'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, CreditCard, Banknote, ShieldCheck, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { ShopWithTenant, Tenant } from '@/types/database';
import { formatNaira } from '@/lib/utils';

export default function PayRentPage() {
  const router = useRouter();

  const [shop, setShop] = useState<ShopWithTenant | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [months, setMonths] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'transfer'>('paystack');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('plaza_active_tenant_id');
    fetch('/api/tenant/portal' + (saved ? `?tenant_id=${saved}` : ''))
      .then((r) => r.json())
      .then((data) => {
        setShop(data.shop);
        setTenant(data.tenant);
      })
      .catch(console.error);
  }, []);

  if (!shop) {
    return (
      <div className="py-20 text-center text-xs text-stone-400">
        Loading payment checkout...
      </div>
    );
  }

  const monthlyRate = Number(shop.rent_rate);
  const totalAmount = monthlyRate * months;

  // Calculate forward extension date preview
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let baseDate = today;
  if (shop.paid_until) {
    const p = new Date(shop.paid_until);
    p.setHours(0, 0, 0, 0);
    if (p > today) baseDate = p;
  }
  const newExtensionDate = new Date(baseDate);
  newExtensionDate.setMonth(newExtensionDate.getMonth() + months);
  const forwardPreviewStr = newExtensionDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleProcessPayment = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/tenant/pay/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: shop.id,
          tenant_id: tenant?.id,
          months,
          amount: totalAmount,
          payment_method: paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      // Save last payment to sessionStorage for confirmation receipt page
      sessionStorage.setItem('plaza_last_payment', JSON.stringify({
        ...data.payment,
        shopName: shop.name,
        tenantName: tenant?.full_name,
        newPaidUntil: data.new_paid_until,
      }));

      router.push('/portal/pay/success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/portal"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Shop
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        {/* Top Split Panel with visual */}
        <div className="relative p-6 bg-stone-900 text-white overflow-hidden">
          <Image
            src="/images/counter_payment.jpg"
            alt="Retail Shop Payment"
            fill
            className="object-cover opacity-25"
          />
          <div className="relative z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">
              SCREEN C2 • SECURE CHECKOUT
            </span>
            <h1 className="text-2xl font-black">{shop.name} Rent Extension</h1>
            <p className="text-xs text-stone-300 mt-1">
              Select your payment period. Your lease will immediately roll forward upon confirmation.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Period Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
              Select Rent Period
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { m: 1, label: '1 Month' },
                { m: 3, label: '3 Months (Quarter)' },
                { m: 6, label: '6 Months (Half Year)' },
                { m: 12, label: '1 Year (Annual)' },
              ].map(({ m, label }) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonths(m)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    months === m
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-xs font-bold block">{label}</span>
                  <span className={`text-[11px] block mt-0.5 ${months === m ? 'text-stone-300' : 'text-stone-500'}`}>
                    {formatNaira(monthlyRate * m)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Rolling Extension Banner */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                New lease expiry date:
              </span>
            </div>
            <span className="font-extrabold text-sm text-emerald-950">{forwardPreviewStr}</span>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('paystack')}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  paymentMethod === 'paystack'
                    ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-stone-900 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-stone-900 block">Card, Bank Transfer or USSD</span>
                  <span className="text-[11px] text-stone-500">Instant digital confirmation</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  paymentMethod === 'transfer'
                    ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <Banknote className="w-5 h-5 text-stone-900 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-stone-900 block">Plaza Bank Account</span>
                  <span className="text-[11px] text-stone-500">Pay via Zenith Bank mobile app</span>
                </div>
              </button>
            </div>
          </div>

          {/* If Direct Bank Transfer Chosen, show details */}
          {paymentMethod === 'transfer' && (
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-stone-700">Bank Name:</span>
                <span className="font-semibold text-stone-900">Zenith Bank</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-stone-700">Account Number:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-stone-900">1012345678</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('1012345678');
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-1 rounded bg-white border border-stone-300 hover:bg-stone-100"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-stone-700">Account Name:</span>
                <span className="font-semibold text-stone-900">Ikeja Central Commercial Plaza Ltd</span>
              </div>
            </div>
          )}

          {/* Summary & Checkout CTA */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-stone-500 block">Total Due</span>
              <span className="text-2xl font-black text-stone-900">
                {formatNaira(totalAmount)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleProcessPayment}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-stone-900 text-white text-xs font-extrabold hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {loading ? 'Processing Payment...' : `Pay ${formatNaira(totalAmount)} Now`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
