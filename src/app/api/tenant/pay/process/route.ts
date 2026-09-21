import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { shop_id, tenant_id, months, amount, payment_method = 'paystack', reference } = body;

    if (!shop_id || !months || !amount) {
      return NextResponse.json(
        { error: 'Shop ID, months, and amount are required' },
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

    // 2. Calculate rolling forward extension
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let baseDate = today;
    if (shop.paid_until) {
      const p = new Date(shop.paid_until);
      p.setHours(0, 0, 0, 0);
      if (p > today) baseDate = p;
    }

    const newPaidUntil = new Date(baseDate);
    newPaidUntil.setMonth(newPaidUntil.getMonth() + Number(months));
    const newPaidUntilStr = newPaidUntil.toISOString().split('T')[0];

    const ref = reference || ('PZ-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000));

    // 3. Record rent payment
    const { data: payment, error: payErr } = await supabase
      .from('rent_payments')
      .insert({
        shop_id: shop.id,
        amount: Number(amount),
        months_covered: Number(months),
        paid_via: payment_method === 'transfer' ? 'manual' : 'paystack',
        paystack_reference: ref,
        recorded_by: 'tenant',
      })
      .select()
      .single();

    if (payErr) throw payErr;

    // 4. Update shop paid_until
    const { error: updateErr } = await supabase
      .from('shops')
      .update({
        paid_until: newPaidUntilStr,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', shop.id);

    if (updateErr) throw updateErr;

    // 5. Log audit notification
    await supabase.from('notifications_log').insert({
      recipient_type: 'tenant',
      recipient_id: tenant_id || shop.tenant_id || 'system',
      channel: 'sms',
      message: `Payment of ₦${Number(amount).toLocaleString()} confirmed for ${shop.name}. Rent covered until ${newPaidUntilStr}. Reference: ${ref}.`,
      status: 'sent',
    });

    return NextResponse.json({
      success: true,
      new_paid_until: newPaidUntilStr,
      payment,
      reference: ref,
    });
  } catch (err: any) {
    console.error('Tenant payment processing error:', err);
    return NextResponse.json(
      { error: err.message || 'Payment processing failed' },
      { status: 500 }
    );
  }
}
