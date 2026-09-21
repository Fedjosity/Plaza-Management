import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizePhoneNumber, calculateRentStatus } from '@/lib/utils';
import { ShopWithTenant } from '@/types/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: shops, error: shopsErr } = await supabase
      .from('shops')
      .select('*')
      .order('name', { ascending: true });

    if (shopsErr) throw shopsErr;

    const { data: tenants, error: tenantsErr } = await supabase
      .from('tenants')
      .select('*');

    if (tenantsErr) throw tenantsErr;

    const tenantMap = new Map((tenants || []).map((t) => [t.id, t]));

    const result: ShopWithTenant[] = (shops || []).map((s) => {
      const tenant = s.tenant_id ? tenantMap.get(s.tenant_id) || null : null;
      const { status: rentStatus, daysRemaining } = calculateRentStatus(s.paid_until);
      return {
        ...s,
        tenant,
        rent_status: rentStatus,
        days_remaining: daysRemaining,
      };
    });

    return NextResponse.json({ shops: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, rent_rate, status = 'active', tenant_name, tenant_phone, initial_paid_until } = body;

    if (!name || !rent_rate) {
      return NextResponse.json({ error: 'Shop name and rent rate are required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Create shop
    const { data: newShop, error: shopErr } = await supabase
      .from('shops')
      .insert({
        name,
        rent_rate: Number(rent_rate),
        rate_unit: 'month',
        paid_until: initial_paid_until || null,
        status: tenant_name ? 'active' : (status || 'vacant'),
      })
      .select()
      .single();

    if (shopErr) throw shopErr;

    // 2. If tenant details provided, create or link tenant
    if (tenant_name && tenant_phone) {
      const normalizedPhone = normalizePhoneNumber(tenant_phone);

      const { data: newTenant, error: tenantErr } = await supabase
        .from('tenants')
        .insert({
          full_name: tenant_name,
          phone_number: normalizedPhone,
          shop_id: newShop.id,
          auth_status: 'invited',
        })
        .select()
        .single();

      if (tenantErr) {
        console.error('Tenant create error:', tenantErr);
      } else {
        // Link tenant to shop
        await supabase
          .from('shops')
          .update({ tenant_id: newTenant.id })
          .eq('id', newShop.id);

        newShop.tenant_id = newTenant.id;
      }
    }

    return NextResponse.json({ success: true, shop: newShop });
  } catch (err: any) {
    console.error('Shop creation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create shop' }, { status: 500 });
  }
}
