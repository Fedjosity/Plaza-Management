'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Building2, 
  Users, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  Search, 
  MessageSquare, 
  CreditCard, 
  ChevronRight,
  RotateCw,
  Plus
} from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { RecordPaymentModal } from '@/components/admin/RecordPaymentModal';
import { ShopWithTenant } from '@/types/database';
import { formatNaira, getWhatsAppReminderUrl } from '@/lib/utils';

interface Metrics {
  total_shops: number;
  occupied_shops: number;
  vacant_shops: number;
  occupancy_rate: number;
  overdue_shops: number;
  total_overdue_debt: number;
  expiring_soon_shops: number;
  collected_this_month: number;
}

export default function AdminDashboardPage() {
  const [shops, setShops] = useState<ShopWithTenant[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'overdue' | 'expiring' | 'current' | 'vacant'>('all');
  
  // Payment modal for specific shop row click
  const [activePaymentShopId, setActivePaymentShopId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setShops(data.shops || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleRefresh = () => loadData();
    window.addEventListener('plaza-payment-recorded', handleRefresh);
    return () => window.removeEventListener('plaza-payment-recorded', handleRefresh);
  }, []);

  const filteredShops = useMemo(() => {
    return shops.filter((s) => {
      // Search match
      const query = search.toLowerCase();
      const matchName = s.name.toLowerCase().includes(query);
      const matchTenant = s.tenant?.full_name.toLowerCase().includes(query);
      const matchPhone = s.tenant?.phone_number.includes(query);
      const matchesSearch = !search || matchName || matchTenant || matchPhone;

      if (!matchesSearch) return false;

      if (filter === 'all') return true;
      if (filter === 'overdue') return s.rent_status === 'overdue' && s.tenant_id;
      if (filter === 'expiring') return s.rent_status === 'expiring_soon' && s.tenant_id;
      if (filter === 'current') return s.rent_status === 'current' && s.tenant_id;
      if (filter === 'vacant') return !s.tenant_id || s.status === 'vacant';
      return true;
    });
  }, [shops, search, filter]);

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome with Plaza photo strip */}
      <div className="relative rounded-2xl overflow-hidden bg-stone-900 text-white p-6 sm:p-8 shadow-sm">
        <Image
          src="/images/plaza_storefront.jpg"
          alt="Plaza Arcade"
          fill
          priority
          className="object-cover opacity-25 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LIVE PROPERTY METRICS
              </span>
              <span className="text-xs text-stone-400">Lagostime: GMT+1</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ikeja Commercial Plaza
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
              Rolling rent tracking, automated tenant reminders, and manual collection management for 50 commercial shop units.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link
              href="/admin/shops/new"
              className="px-4 py-2.5 rounded-xl bg-white text-stone-900 text-xs font-extrabold hover:bg-stone-100 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Shop Unit
            </Link>
          </div>
        </div>
      </div>

      {/* Financial & Status Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Occupancy */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Occupancy</span>
            <Building2 className="w-4 h-4 text-stone-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-stone-900">
              {metrics ? `${metrics.occupied_shops} / ${metrics.total_shops}` : '--'}
            </span>
            <span className="text-xs font-bold text-emerald-600">
              {metrics ? `${metrics.occupancy_rate}%` : ''}
            </span>
          </div>
          <span className="text-[11px] text-stone-400 block mt-1">
            {metrics ? `${metrics.vacant_shops} vacant units available` : 'Loading...'}
          </span>
        </div>

        {/* Metric 2: Overdue Debt */}
        <div className="p-5 rounded-2xl bg-white border border-rose-200 bg-rose-50/20 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Overdue Debt</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-700">
              {metrics ? formatNaira(metrics.total_overdue_debt) : '--'}
            </span>
          </div>
          <span className="text-[11px] text-rose-600/80 font-medium block mt-1">
            {metrics ? `${metrics.overdue_shops} shops requiring payment` : 'Calculating...'}
          </span>
        </div>

        {/* Metric 3: Expiring Soon */}
        <div className="p-5 rounded-2xl bg-white border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Expiring in 7 Days</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-800">
              {metrics ? `${metrics.expiring_soon_shops} Units` : '--'}
            </span>
          </div>
          <span className="text-[11px] text-amber-600/80 font-medium block mt-1">
            Due for rent extension
          </span>
        </div>

        {/* Metric 4: Collected This Month */}
        <div className="p-5 rounded-2xl bg-white border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Collections This Month</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-800">
              {metrics ? formatNaira(metrics.collected_this_month) : '--'}
            </span>
          </div>
          <span className="text-[11px] text-emerald-600/80 font-medium block mt-1">
            Cash, transfer & Paystack
          </span>
        </div>
      </div>

      {/* Shop Directory Section */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {/* Controls: Search & Tabs */}
        <div className="p-5 border-b border-stone-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-stone-900 tracking-tight">
                Shop Units Directory
              </h2>
              <p className="text-xs text-stone-500">
                Manage rolling rent periods, send WhatsApp reminders, and record cash payments.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search shop, tenant, phone..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'All Shops', count: shops.length },
              { id: 'overdue', label: 'Overdue', count: metrics?.overdue_shops || 0, badgeColor: 'bg-rose-100 text-rose-800' },
              { id: 'expiring', label: 'Expiring Soon', count: metrics?.expiring_soon_shops || 0, badgeColor: 'bg-amber-100 text-amber-800' },
              { id: 'current', label: 'Paid Up', count: shops.filter(s => s.rent_status === 'current' && s.tenant_id).length },
              { id: 'vacant', label: 'Vacant', count: metrics?.vacant_shops || 0 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  filter === tab.id
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  filter === tab.id ? 'bg-white/20 text-white' : tab.badgeColor || 'bg-stone-200 text-stone-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Shop List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">Tenant / Contact</th>
                <th className="py-3 px-4">Monthly Rate</th>
                <th className="py-3 px-4">Rent Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {filteredShops.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-400">
                    No shops match the selected filter or search query.
                  </td>
                </tr>
              ) : (
                filteredShops.map((shop) => {
                  const waUrl = shop.tenant
                    ? getWhatsAppReminderUrl(
                        shop.tenant.phone_number,
                        shop.tenant.full_name,
                        shop.name,
                        shop.days_remaining
                      )
                    : null;

                  return (
                    <tr key={shop.id} className="hover:bg-stone-50/80 transition-colors">
                      {/* Shop Name */}
                      <td className="py-3.5 px-4 font-bold text-stone-900">
                        <Link
                          href={`/admin/shops/${shop.id}`}
                          className="hover:underline flex items-center gap-1.5"
                        >
                          {shop.name}
                          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                        </Link>
                      </td>

                      {/* Tenant */}
                      <td className="py-3.5 px-4">
                        {shop.tenant ? (
                          <div>
                            <span className="font-semibold text-stone-900 block">
                              {shop.tenant.full_name}
                            </span>
                            <span className="text-[11px] text-stone-500 font-mono">
                              {shop.tenant.phone_number}
                            </span>
                          </div>
                        ) : (
                          <span className="text-stone-400 italic">No tenant assigned</span>
                        )}
                      </td>

                      {/* Monthly Rate */}
                      <td className="py-3.5 px-4 font-semibold text-stone-900">
                        {formatNaira(Number(shop.rent_rate))}
                        <span className="text-[10px] text-stone-400 font-normal"> /mo</span>
                      </td>

                      {/* Rent Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge
                          status={shop.tenant_id ? shop.rent_status : 'vacant'}
                          daysRemaining={shop.days_remaining}
                          paidUntil={shop.paid_until}
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {/* WhatsApp reminder if tenant exists */}
                        {waUrl && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold transition-colors border border-emerald-200"
                            title="Send WhatsApp payment reminder"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">WhatsApp</span>
                          </a>
                        )}

                        {/* Record Cash button */}
                        <button
                          type="button"
                          onClick={() => setActivePaymentShopId(shop.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 text-stone-800 hover:bg-stone-200 text-[11px] font-bold transition-colors"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Record</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-page modal if invoked from specific row */}
      {activePaymentShopId && (
        <RecordPaymentModal
          isOpen={true}
          onClose={() => setActivePaymentShopId(null)}
          onSuccess={() => {
            setActivePaymentShopId(null);
            loadData();
          }}
          shops={shops}
          initialShopId={activePaymentShopId}
        />
      )}
    </div>
  );
}
