'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, History, Printer } from 'lucide-react';
import { ReceiptModal } from '@/components/tenant/ReceiptModal';
import { RentPayment, ShopWithTenant, Tenant } from '@/types/database';
import { formatNaira } from '@/lib/utils';

export default function TenantHistoryPage() {
  const [shop, setShop] = useState<ShopWithTenant | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [payments, setPayments] = useState<RentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<RentPayment | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('plaza_active_tenant_id');
    fetch('/api/tenant/portal' + (saved ? `?tenant_id=${saved}` : ''))
      .then((r) => r.json())
      .then((data) => {
        setShop(data.shop);
        setTenant(data.tenant);
        setPayments(data.payments || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/portal"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Shop
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-stone-200">
          <h1 className="text-lg font-black text-stone-900 uppercase tracking-wide">
            Payment Receipts & Rent History
          </h1>
          <p className="text-xs text-stone-500">
            Chronological audit log of all rent payments recorded for {shop?.name || 'your shop'}.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Period</th>
                <th className="py-3.5 px-4">Reference</th>
                <th className="py-3.5 px-4">Channel</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    No payment history recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/80">
                    <td className="py-3.5 px-4 font-semibold text-stone-900">
                      {new Date(p.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      {formatNaira(Number(p.amount))}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {p.months_covered} {p.months_covered === 1 ? 'Month' : 'Months'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-stone-500">
                      {p.paystack_reference || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 capitalize">
                        {p.paid_via === 'paystack' ? 'Online' : 'Bank Transfer'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="px-2.5 py-1 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 font-bold text-[11px] inline-flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPayment && (
        <ReceiptModal
          isOpen={true}
          onClose={() => setSelectedPayment(null)}
          payment={selectedPayment}
          shop={shop}
          tenantName={tenant?.full_name || 'Tenant'}
        />
      )}
    </div>
  );
}
