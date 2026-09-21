import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculateRentStatus } from '@/lib/utils';
import { ShopWithTenant, RentPayment } from '@/types/database';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantIdParam = searchParams.get('tenant_id');

    const supabase = createAdminClient();

    // 1. Fetch all tenants (for selector/switcher)
    const { data: allTenants, error: tErr } = await supabase
      .from('tenants')
      .select('*')
      .order('full_name', { ascending: true });

    if (tErr) throw tErr;

    // Pick active tenant
    let currentTenant = null;
    if (tenantIdParam) {
      currentTenant = (allTenants || []).find((t) => t.id === tenantIdParam);
    }
    if (!currentTenant && allTenants && allTenants.length > 0) {
      // Pick first tenant that has a shop assigned
      currentTenant = allTenants.find((t) => t.shop_id) || allTenants[0];
    }

    if (!currentTenant) {
      return NextResponse.json({
        tenant: null,
        shop: null,
        payments: [],
        tenants: [],
      });
    }

    // 2. Fetch linked shop
    let shop: ShopWithTenant | null = null;
    let payments: RentPayment[] = [];

    if (currentTenant.shop_id) {
      const { data: sData } = await supabase
        .from('shops')
        .select('*')
        .eq('id', currentTenant.shop_id)
        .single();

      if (sData) {
        const { status: rentStatus, daysRemaining } = calculateRentStatus(sData.paid_until);
        shop = {
          ...sData,
          tenant: currentTenant,
          rent_status: rentStatus,
          days_remaining: daysRemaining,
        };

        // Fetch payment history for this shop
        const { data: pData } = await supabase
          .from('rent_payments')
          .select('*')
          .eq('shop_id', sData.id)
          .order('created_at', { ascending: false });

        payments = pData || [];
      }
    }

    return NextResponse.json({
      tenant: currentTenant,
      shop,
      payments,
      tenants: allTenants,
    });
  } catch (err: any) {
    console.error('Tenant portal fetch error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to load tenant portal data' },
      { status: 500 }
    );
  }
}
