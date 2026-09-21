'use client';

import React from 'react';
import { X, Printer, CheckCircle2, Building2, Store, Calendar, CreditCard } from 'lucide-react';
import { RentPayment, Shop } from '@/types/database';
import { formatNaira } from '@/lib/utils';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: RentPayment | null;
  shop: Shop | null;
  tenantName: string;
}

export function ReceiptModal({
  isOpen,
  onClose,
  payment,
  shop,
  tenantName,
}: ReceiptModalProps) {
  if (!isOpen || !payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(payment.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Strip */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50 print:hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Digital Rent Receipt
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-receipt" className="p-6 space-y-5 bg-white text-stone-900">
          {/* Plaza Stamp */}
          <div className="text-center border-b border-stone-200 pb-4 space-y-1">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 mb-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-stone-900">
              Ikeja Central Commercial Plaza
            </h2>
            <p className="text-[11px] text-stone-500">
              Official Rent Payment Acknowledgment
            </p>
            <span className="inline-block mt-1 font-mono text-[10px] text-stone-400">
              Ref: {payment.paystack_reference || payment.id.slice(0, 12)}
            </span>
          </div>

          {/* Amount Paid Banner */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
              Amount Received
            </span>
            <span className="text-2xl font-black text-stone-900">
              {formatNaira(Number(payment.amount))}
            </span>
            <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">
              Verified & Credited
            </span>
          </div>

          {/* Transaction Metadata Grid */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-stone-500">Shop Unit</span>
              <span className="font-bold text-stone-900">{shop?.name || 'Assigned Unit'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-stone-500">Tenant Name</span>
              <span className="font-bold text-stone-900">{tenantName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-stone-500">Period Covered</span>
              <span className="font-bold text-stone-900">
                {payment.months_covered} {payment.months_covered === 1 ? 'Month' : 'Months'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-stone-500">Payment Date</span>
              <span className="font-bold text-stone-900">{formattedDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-stone-500">Payment Channel</span>
              <span className="font-bold uppercase text-[11px] text-stone-900">
                {payment.paid_via === 'paystack' ? 'Online Card / USSD' : 'Bank Transfer / Cash'}
              </span>
            </div>
            {shop?.paid_until && (
              <div className="flex justify-between py-1.5 bg-emerald-50/60 px-2 rounded-lg text-emerald-950 font-bold">
                <span>Lease Covered Until:</span>
                <span>
                  {new Date(shop.paid_until).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Legal / Plaza footer */}
          <div className="text-center pt-2 text-[10px] text-stone-400">
            Issued by Plaza Management Operations • Awolowo Way, Ikeja, Lagos
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-100"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg bg-stone-900 text-white text-xs font-bold hover:bg-black transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
