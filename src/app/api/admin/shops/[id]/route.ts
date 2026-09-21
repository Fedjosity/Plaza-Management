import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculateRentStatus } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // 1. Fetch shop
    const { data: shop, error: shopErr } = await supabase
      .from('shops')
      .select('*')
      .eq('id', id)
      .single();

    if (shopErr || !shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // 2. Fetch tenant if assigned
    let tenant = null;
    if (shop.tenant_id) {
      const { data: t } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', shop.tenant_id)
        .single();
      tenant = t;
    }

    // 3. Fetch payment history
    const { data: payments } = await supabase
      .from('rent_payments')
      .select('*')
      .eq('shop_id', id)
      .order('created_at', { ascending: false });

    const { status: rentStatus, daysRemaining } = calculateRentStatus(shop.paid_until);

    return NextResponse.json({
      shop: {
        ...shop,
        tenant,
        rent_status: rentStatus,
        days_remaining: daysRemaining,
      },
      payments: payments || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await req.json();
    const supabase = createAdminClient();

    const allowed = ['name', 'rent_rate', 'status', 'paid_until', 'tenant_id'];
    const filtered: Record<string, any> = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) filtered[key] = updates[key];
    }

    filtered.updated_at = new Date().toISOString();

    const { data: updated, error } = await supabase
      .from('shops')
      .update(filtered)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, shop: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
