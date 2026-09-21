import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { shop_id, amount, months_covered, payment_method = 'manual', notes, recorded_by = 'admin' } = body;

    if (!shop_id || !amount || !months_covered) {
      return NextResponse.json(
        { error: 'Shop ID, amount, and months covered are required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Fetch current shop
    const { data: shop, error: shopErr } = await supabase
      .from('shops')
      .select('id, name, paid_until, rent_rate, tenant_id')
      .eq('id', shop_id)
      .single();

    if (shopErr || !shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // 2. Compute rolling forward paid_until date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let baseDate = today;
    if (shop.paid_until) {
      const currentPaidUntil = new Date(shop.paid_until);
      currentPaidUntil.setHours(0, 0, 0, 0);
      // If current paid_until is in the future, add to it. Otherwise start from today.
      if (currentPaidUntil > today) {
        baseDate = currentPaidUntil;
      }
    }

    // Advance by months_covered
    const newPaidUntil = new Date(baseDate);
    newPaidUntil.setMonth(newPaidUntil.getMonth() + Number(months_covered));
    const newPaidUntilStr = newPaidUntil.toISOString().split('T')[0];

    // 3. Record rent payment
    const { data: payment, error: payErr } = await supabase
      .from('rent_payments')
      .insert({
        shop_id: shop.id,
        amount: Number(amount),
        months_covered: Number(months_covered),
        paid_via: 'manual',
        paystack_reference: 'MAN-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000),
        recorded_by,
      })
      .select()
      .single();

    if (payErr) throw payErr;

    // 4. Update shop paid_until date
    const { error: updateErr } = await supabase
      .from('shops')
      .update({
        paid_until: newPaidUntilStr,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', shop.id);

    if (updateErr) throw updateErr;

    // 5. Log notification audit
    if (shop.tenant_id) {
      await supabase.from('notifications_log').insert({
        recipient_type: 'tenant',
        recipient_id: shop.tenant_id,
        channel: 'sms',
        message: `Manual payment of ₦${Number(amount).toLocaleString()} confirmed for ${shop.name}. Rent covered until ${newPaidUntilStr}.`,
        status: 'sent',
      });
    }

    return NextResponse.json({
      success: true,
      new_paid_until: newPaidUntilStr,
      payment,
    });
  } catch (err: any) {
    console.error('Record manual payment error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to record manual payment' },
      { status: 500 }
    );
  }
}
