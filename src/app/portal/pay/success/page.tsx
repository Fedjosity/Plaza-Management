'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Printer, ArrowRight, Store } from 'lucide-react';
import { formatNaira } from '@/lib/utils';

export default function PaymentSuccessPage() {
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('plaza_last_payment');
    if (saved) {
      setPaymentData(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="max-w-lg mx-auto py-8 space-y-6 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mb-2">
        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-black text-stone-900">Rent Payment Confirmed!</h1>
        <p className="text-xs text-stone-500">
          Your payment has been officially processed and your lease has been extended.
        </p>
      </div>

      {paymentData && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs text-left space-y-4 text-xs">
          <div className="border-b border-stone-100 pb-3 flex justify-between items-center">
            <span className="text-stone-500">Shop Unit</span>
            <span className="font-bold text-stone-900">{paymentData.shopName}</span>
          </div>
          <div className="border-b border-stone-100 pb-3 flex justify-between items-center">
            <span className="text-stone-500">Amount Paid</span>
            <span className="font-black text-stone-900 text-base">{formatNaira(Number(paymentData.amount))}</span>
          </div>
          <div className="border-b border-stone-100 pb-3 flex justify-between items-center">
            <span className="text-stone-500">Period Covered</span>
            <span className="font-bold text-stone-900">{paymentData.months_covered} Months</span>
          </div>
          <div className="border-b border-stone-100 pb-3 flex justify-between items-center">
            <span className="text-stone-500">Reference Number</span>
            <span className="font-mono font-bold text-stone-800">{paymentData.paystack_reference}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold flex justify-between items-center">
            <span>New Lease Expiry:</span>
            <span>{paymentData.newPaidUntil}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-700 hover:bg-stone-50 flex items-center gap-1.5"
        >
          <Printer className="w-4 h-4" />
          Print Receipt
        </button>

        <Link
          href="/portal"
          className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Store className="w-4 h-4" />
          Back to My Shop
        </Link>
      </div>
    </div>
  );
}
