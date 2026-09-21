import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizePhoneNumber } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password || password.length < 6) {
      return NextResponse.json({ error: 'Valid password (min 6 characters) is required' }, { status: 400 });
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    const supabase = createAdminClient();

    // 1. Check tenant
    const { data: tenant, error: tenantErr } = await supabase
      .from('tenants')
      .select('id, full_name, auth_status')
      .eq('phone_number', normalizedPhone)
      .single();

    if (tenantErr || !tenant) {
      return NextResponse.json({ error: 'Tenant record not found' }, { status: 404 });
    }

    // Synthetic email format for Supabase Auth to allow phone+password login
    const syntheticEmail = `${normalizedPhone.replace('+', '')}@plaza.internal`;

    // 2. Create or update user in Supabase Auth via Admin Client
    const { data: userList } = await supabase.auth.admin.listUsers();
    const existingUser = userList?.users?.find(
      (u) => u.phone === normalizedPhone || u.email === syntheticEmail
    );

    let authUserId = existingUser?.id;

    if (existingUser) {
      await supabase.auth.admin.updateUserById(existingUser.id, {
        password,
        user_metadata: { full_name: tenant.full_name, phone: normalizedPhone, role: 'tenant' },
      });
    } else {
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email: syntheticEmail,
        phone: normalizedPhone,
        password,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: { full_name: tenant.full_name, phone: normalizedPhone, role: 'tenant' },
      });
      if (createErr) throw createErr;
      authUserId = newUser.user.id;
    }

    // 3. Update tenant status to active
    await supabase
      .from('tenants')
      .update({ auth_status: 'active' })
      .eq('id', tenant.id);

    return NextResponse.json({
      success: true,
      message: 'Password created and account activated successfully',
    });
  } catch (err: any) {
    console.error('Set password error:', err);
    return NextResponse.json({ error: err.message || 'Failed to set password' }, { status: 500 });
  }
}
