'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Store, 
  User, 
  Phone, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Banknote
} from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon';
import { RecordPaymentModal } from '@/components/admin/RecordPaymentModal';
import { ShopWithTenant, RentPayment } from '@/types/database';
import { formatNaira, getWhatsAppReminderUrl } from '@/lib/utils';

export default function ShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const shopId = resolvedParams.id;

  const [shop, setShop] = useState<ShopWithTenant | null>(null);
  const [payments, setPayments] = useState<RentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const loadShopData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/shops/${shopId}`);
      if (res.ok) {
        const data = await res.json();
        setShop(data.shop);
        setPayments(data.payments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shopId) loadShopData();
  }, [shopId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-semibold text-stone-400">
        Loading shop details...
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-stone-600 text-sm">Shop not found.</p>
        <Link href="/admin" className="text-xs font-bold text-stone-900 underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const waUrl = shop.tenant
    ? getWhatsAppReminderUrl(
        shop.tenant.phone_number,
        shop.tenant.full_name,
        shop.name,
        shop.days_remaining
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Shops
        </Link>
      </div>

      {/* Shop Hero Card */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12">
        {/* Left Photo */}
        <div className="relative md:col-span-4 min-h-[220px] bg-stone-900">
          <Image
            src="/images/tailoring_shop.jpg"
            alt="Shop Arcade"
            fill
            priority
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold block">
              COMMERCIAL UNIT
            </span>
            <h1 className="text-2xl font-black">{shop.name}</h1>
          </div>
        </div>

        {/* Right Info */}
        <div className="p-6 md:col-span-8 flex flex-col justify-between space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs text-stone-500 font-medium">Monthly Rent Rate</span>
              <p className="text-3xl font-black text-stone-900">
                {formatNaira(Number(shop.rent_rate))}
                <span className="text-xs text-stone-400 font-normal"> / month</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge
                status={shop.tenant_id ? shop.rent_status : 'vacant'}
                daysRemaining={shop.days_remaining}
                paidUntil={shop.paid_until}
                size="md"
              />
            </div>
          </div>

          {/* Quick Lease Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-stone-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                Paid Until
              </span>
              <span className="text-sm font-bold text-stone-800">
                {shop.paid_until
                  ? new Date(shop.paid_until).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Not set'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                Lease Timeline
              </span>
              <span className={`text-sm font-bold ${shop.days_remaining < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {shop.days_remaining < 0
                  ? `${Math.abs(shop.days_remaining)} days overdue`
                  : `${shop.days_remaining} days remaining`}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                Total Payments
              </span>
              <span className="text-sm font-bold text-stone-800">
                {payments.length} recorded
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setIsPaymentOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black transition-colors flex items-center gap-2 shadow-xs"
            >
              <CreditCard className="w-4 h-4" />
              Record Payment
            </button>

            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                WhatsApp Tenant
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tenant Information Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-700 mb-4">
          Assigned Tenant Profile
        </h2>

        {shop.tenant ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 font-bold text-lg">
                {shop.tenant.full_name[0]}
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">{shop.tenant.full_name}</h3>
                <div className="flex items-center gap-3 text-xs text-stone-500 font-mono mt-0.5">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {shop.tenant.phone_number}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                    Auth: {shop.tenant.auth_status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${shop.tenant.phone_number}`}
                className="px-3 py-2 rounded-lg border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50"
              >
                Call Tenant
              </a>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-stone-400 text-xs">
            This shop unit is currently vacant with no active tenant assigned.
          </div>
        )}
      </div>

      {/* Rent Payment Audit History */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider">
              Payment Audit History
            </h2>
            <p className="text-xs text-stone-500">
              Complete chronological log of rent recorded for {shop.name}.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Months Covered</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4 text-right">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-stone-400">
                    No payment records logged yet for this shop.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
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
                    <td className="py-3 px-4 text-stone-700">
                      {p.months_covered} {p.months_covered === 1 ? 'Month' : 'Months'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold uppercase text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                        {p.paid_via === 'paystack' ? 'Online Card' : 'Manual / Cash'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-stone-500">
                      {p.paystack_reference || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-stone-600 capitalize">
                      {p.recorded_by}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentOpen && (
        <RecordPaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          onSuccess={() => {
            setIsPaymentOpen(false);
            loadShopData();
          }}
          shops={[shop]}
          initialShopId={shop.id}
        />
      )}
    </div>
  );
}
