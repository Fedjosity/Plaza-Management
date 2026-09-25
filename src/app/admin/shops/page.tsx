'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, Plus, Eye, ChevronRight } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon';
import { ShopWithTenant } from '@/types/database';
import { formatNaira, getWhatsAppReminderUrl } from '@/lib/utils';

export default function AdminShopsPage() {
  const [shops, setShops] = useState<ShopWithTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'occupied' | 'vacant'>('all');

  useEffect(() => {
    fetch('/api/admin/shops')
      .then((r) => r.json())
      .then((data) => setShops(data.shops || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredShops = useMemo(() => {
    return shops.filter((s) => {
      const query = search.toLowerCase();
      const matchName = s.name.toLowerCase().includes(query);
      const matchTenant = s.tenant?.full_name?.toLowerCase().includes(query);
      const matchPhone = s.tenant?.phone_number?.includes(query);
      const matchesSearch = !search || matchName || matchTenant || matchPhone;
      if (!matchesSearch) return false;

      if (filter === 'all') return true;
      if (filter === 'occupied') return !!s.tenant_id;
      if (filter === 'vacant') return !s.tenant_id;
      return true;
    });
  }, [shops, search, filter]);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-semibold text-stone-400">
        Loading shops...
      </div>
    );
  }

  const occupied = shops.filter((s) => s.tenant_id).length;
  const vacant = shops.filter((s) => !s.tenant_id).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">
            Shop Units
          </h1>
          <p className="text-xs text-stone-500">
            {shops.length} total &middot; {occupied} occupied &middot; {vacant} vacant
          </p>
        </div>
        <Link
          href="/admin/shops/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-extrabold hover:bg-black transition-colors shadow-xs self-start"
        >
          <Plus className="w-4 h-4" />
          Add Shop Unit
        </Link>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Search */}
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

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            {[
              { id: 'all', label: 'All', count: shops.length },
              { id: 'occupied', label: 'Occupied', count: occupied },
              { id: 'vacant', label: 'Vacant', count: vacant },
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
                <span className={`text-[10px] px-1.5 rounded-full font-extrabold ${
                  filter === tab.id ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
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
                      <td className="py-3.5 px-4 font-bold text-stone-900">
                        <Link
                          href={`/admin/shops/${shop.id}`}
                          className="hover:underline flex items-center gap-1.5"
                        >
                          {shop.name}
                          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                        </Link>
                      </td>
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
                      <td className="py-3.5 px-4 font-semibold text-stone-900">
                        {formatNaira(Number(shop.rent_rate))}
                        <span className="text-[10px] text-stone-400 font-normal"> /mo</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge
                          status={shop.tenant_id ? shop.rent_status : 'vacant'}
                          daysRemaining={shop.days_remaining}
                          paidUntil={shop.paid_until}
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {waUrl && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold transition-colors border border-emerald-200"
                            title="Send WhatsApp payment reminder"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">WhatsApp</span>
                          </a>
                        )}
                        <Link
                          href={`/admin/shops/${shop.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 text-stone-800 hover:bg-stone-200 text-[11px] font-bold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
