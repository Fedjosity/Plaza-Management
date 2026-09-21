import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculateRentStatus } from '@/lib/utils';
import { ShopWithTenant } from '@/types/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();

    // 1. Fetch all shops
    const { data: rawShops, error: shopsErr } = await supabase
      .from('shops')
      .select('*')
      .order('name', { ascending: true });

    if (shopsErr) throw shopsErr;

    // 2. Fetch all tenants
    const { data: rawTenants, error: tenantsErr } = await supabase
      .from('tenants')
      .select('*');

    if (tenantsErr) throw tenantsErr;

    // 3. Fetch recent payments this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: rawPayments, error: paymentsErr } = await supabase
      .from('rent_payments')
      .select('*')
      .gte('created_at', startOfMonth.toISOString());

    if (paymentsErr) throw paymentsErr;

    // Map tenants
    const tenantMap = new Map((rawTenants || []).map((t) => [t.id, t]));

    let overdueCount = 0;
    let overdueDebt = 0;
    let expiringCount = 0;
    let occupiedCount = 0;

    const shops: ShopWithTenant[] = (rawShops || []).map((s) => {
      const tenant = s.tenant_id ? tenantMap.get(s.tenant_id) || null : null;
      const { status: rentStatus, daysRemaining } = calculateRentStatus(s.paid_until);

      if (tenant && s.status === 'active') {
        occupiedCount++;
        if (rentStatus === 'overdue') {
          overdueCount++;
          const overdueMonths = Math.max(1, Math.ceil(Math.abs(daysRemaining) / 30));
          overdueDebt += Number(s.rent_rate) * overdueMonths;
        } else if (rentStatus === 'expiring_soon') {
          expiringCount++;
        }
      }

      return {
        ...s,
        tenant,
        rent_status: rentStatus,
        days_remaining: daysRemaining,
      };
    });

    const collectedThisMonth = (rawPayments || []).reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

    const totalShops = shops.length;
    const vacantCount = totalShops - occupiedCount;

    return NextResponse.json({
      metrics: {
        total_shops: totalShops,
        occupied_shops: occupiedCount,
        vacant_shops: vacantCount,
        occupancy_rate: totalShops > 0 ? Math.round((occupiedCount / totalShops) * 100) : 0,
        overdue_shops: overdueCount,
        total_overdue_debt: overdueDebt,
        expiring_soon_shops: expiringCount,
        collected_this_month: collectedThisMonth,
      },
      shops,
    });
  } catch (err: any) {
    console.error('Admin dashboard fetch error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch admin dashboard metrics' },
      { status: 500 }
    );
  }
}
