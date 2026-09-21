'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Store, CreditCard, History, QrCode, User, ChevronDown, ShieldCheck, ArrowRight } from 'lucide-react';
import { Tenant } from '@/types/database';

export function PortalHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');

  useEffect(() => {
    // Check saved active tenant or fetch from portal
    const saved = localStorage.getItem('plaza_active_tenant_id');
    fetch('/api/tenant/portal' + (saved ? `?tenant_id=${saved}` : ''))
      .then((r) => r.json())
      .then((data) => {
        if (data.tenants) setTenants(data.tenants);
        if (data.tenant) {
          setSelectedTenantId(data.tenant.id);
          localStorage.setItem('plaza_active_tenant_id', data.tenant.id);
        }
      })
      .catch(console.error);
  }, []);

  const handleTenantChange = (newId: string) => {
    setSelectedTenantId(newId);
    localStorage.setItem('plaza_active_tenant_id', newId);
    window.location.reload();
  };

  const navTabs = [
    { label: 'My Shop', href: '/portal', exact: true, icon: Store },
    { label: 'Pay Rent', href: '/portal/pay', exact: true, icon: CreditCard },
    { label: 'Payment Receipts', href: '/portal/history', exact: true, icon: History },
    { label: 'Counter QR', href: '/portal/qr', exact: true, icon: QrCode },
    { label: 'My Profile', href: '/portal/profile', exact: true, icon: User },
  ];

  const currentTenantObj = tenants.find((t) => t.id === selectedTenantId);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Badge */}
          <div className="flex items-center gap-4">
            <Link href="/portal" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center text-white shadow-xs">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black tracking-widest text-stone-900 uppercase block leading-tight">
                  TENANT PORTAL
                </span>
                <span className="text-[10px] text-stone-500 font-medium block">
                  Ikeja Central Commercial Plaza
                </span>
              </div>
            </Link>

            {/* Navigation Tabs (Desktop) */}
            <nav className="hidden md:flex items-center space-x-1 ml-4">
              {navTabs.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Tenant Switcher & Admin link */}
          <div className="flex items-center gap-3">
            {tenants.length > 0 && (
              <div className="relative">
                <select
                  value={selectedTenantId}
                  onChange={(e) => handleTenantChange(e.target.value)}
                  className="pl-3 pr-8 py-1.5 rounded-lg border border-stone-300 text-xs font-bold text-stone-800 bg-stone-50 hover:bg-stone-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-stone-900 appearance-none"
                  title="Switch tenant view (Testing Helper)"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            <Link
              href="/admin"
              className="text-[11px] font-bold text-stone-500 hover:text-stone-900 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <span>Admin View</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-stone-100 space-x-1 text-xs">
          {navTabs.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md whitespace-nowrap text-xs font-bold ${
                  isActive
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Icon className="w-3 h-3" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
