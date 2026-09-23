'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Store, 
  Calendar, 
  CreditCard, 
  MessageSquare, 
  Phone, 
  Copy, 
  Check, 
  ArrowRight,
  ShieldCheck,
  RotateCw,
  QrCode
} from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ReceiptModal } from '@/components/tenant/ReceiptModal';
import { ShopWithTenant, RentPayment, Tenant } from '@/types/database';
import { formatNaira } from '@/lib/utils';

export default function TenantShopPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [shop, setShop] = useState<ShopWithTenant | null>(null);
  const [payments, setPayments] = useState<RentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<RentPayment | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('plaza_active_tenant_id');
    fetch('/api/tenant/portal' + (saved ? `?tenant_id=${saved}` : ''))
      .then((res) => res.json())
      .then((data) => {
        setTenant(data.tenant);
        setShop(data.shop);
        setPayments(data.payments || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('1012345678');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-semibold text-stone-400">
        Loading shop portal...
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="py-20 text-center space-y-3">
        <Store className="w-10 h-10 text-stone-400 mx-auto" />
        <h2 className="text-base font-bold text-stone-800">No Shop Assigned Yet</h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Your account is active, but the plaza manager has not yet assigned you a commercial unit.
        </p>
      </div>
    );
  }

  const isOverdue = shop.days_remaining < 0;
  const isExpiring = shop.days_remaining >= 0 && shop.days_remaining <= 7;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">
            TENANT SELF-SERVICE
          </span>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Welcome, {tenant?.full_name}
          </h1>
          <p className="text-xs text-stone-500">
            Manage your shop lease, pay upcoming rent, and view payment receipts.
          </p>
        </div>

        <Link
          href="/portal/pay"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black transition-colors shadow-sm self-start sm:self-auto"
        >
          <CreditCard className="w-4 h-4" />
          Pay Rent Online
        </Link>
      </div>

      {/* Main Rent & Lease Status Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="relative p-6 sm:p-8 bg-stone-900 text-white">
          <Image
            src="/images/plaza_storefront.jpg"
            alt="Commercial Plaza"
            fill
            className="object-cover opacity-20"
          />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white">
                  {shop.name}
                </span>
                <StatusBadge
                  status={shop.rent_status}
                  daysRemaining={shop.days_remaining}
                  paidUntil={shop.paid_until}
                  size="md"
                />
              </div>
              <p className="text-3xl sm:text-4xl font-black">
                {formatNaira(Number(shop.rent_rate))}
                <span className="text-xs sm:text-sm text-stone-300 font-normal"> / month</span>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/15 space-y-1 min-w-[200px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-300 block">
                Lease Paid Until
              </span>
              <span className="text-base font-extrabold text-white block">
                {shop.paid_until
                  ? new Date(shop.paid_until).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'No payment recorded'}
              </span>
              <span className={`text-xs font-bold block ${isOverdue ? 'text-rose-400' : 'text-emerald-300'}`}>
                {isOverdue
                  ? `Rent expired ${Math.abs(shop.days_remaining)} days ago`
                  : `${shop.days_remaining} days remaining`}
              </span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-4 sm:p-6 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-stone-600">
            {isOverdue ? (
              <span className="text-rose-700 font-bold">
                ⚠️ Your rent is overdue. Please settle or contact the plaza office today.
              </span>
            ) : isExpiring ? (
              <span className="text-amber-800 font-bold">
                ⏰ Rent expires soon. Prepay 1–12 months to roll your lease forward.
              </span>
            ) : (
              <span className="text-emerald-800 font-medium">
                ✅ Your rent is current and up-to-date.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/portal/qr"
              className="px-3.5 py-2 rounded-lg border border-stone-300 bg-white text-xs font-bold text-stone-700 hover:bg-stone-100 flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5" />
              Counter QR Stand
            </Link>

            <Link
              href="/portal/pay"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1.5 shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Extend Lease
            </Link>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Plaza Bank Account & Manager Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Offline Transfer Bank Account */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
              Plaza Bank Account (Direct Transfer)
            </span>
            <span className="text-[10px] font-bold text-stone-400">Zenith Bank</span>
          </div>
          <p className="text-xs text-stone-500">
            If transferring directly via mobile app, use the official plaza account below:
          </p>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <div>
              <span className="font-mono text-base font-black text-stone-900 block tracking-wider">
                1012345678
              </span>
              <span className="text-[11px] text-stone-500">Ikeja Central Commercial Plaza Ltd</span>
            </div>
            <button
              onClick={handleCopyAccount}
              className="p-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 transition-colors text-xs font-bold flex items-center gap-1"
              title="Copy account number"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Plaza Manager Direct Line */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-stone-700 block">
            Plaza Property Manager
          </span>
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
              <Image
                src="/images/manager_portrait.jpg"
                alt="Chief Durojaiye"
                fill
                className="object-cover grayscale"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Chief Alabi Durojaiye</h3>
              <p className="text-xs text-stone-500">Plaza Office • Suite 01, Ground Floor</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <a
              href="https://wa.me/2348029998888?text=Hello%20Chief%2C%20regarding%20my%20shop%20rent"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              WhatsApp Office
            </a>
            <a
              href="tel:+2348029998888"
              className="flex-1 py-2 px-3 rounded-lg border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              Call Manager
            </a>
          </div>
        </div>
      </div>

      {/* Recent Payments Section */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider">
              Recent Rent Payments
            </h2>
            <p className="text-xs text-stone-500">
              Your verified rent payments and digital receipts.
            </p>
          </div>
          <Link
            href="/portal/history"
            className="text-xs font-bold text-stone-900 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Period Covered</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-400">
                    No payments logged yet.
                  </td>
                </tr>
              ) : (
                payments.slice(0, 3).map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/80">
                    <td className="py-3 px-4 font-medium text-stone-800">
                      {new Date(p.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 font-bold text-stone-900">
                      {formatNaira(Number(p.amount))}
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      {p.months_covered} {p.months_covered === 1 ? 'Month' : 'Months'}
                    </td>
                    <td className="py-3 px-4 capitalize font-medium text-stone-600">
                      {p.paid_via === 'paystack' ? 'Online Card' : 'Manual Transfer'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="font-bold text-emerald-700 hover:underline"
                      >
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
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
