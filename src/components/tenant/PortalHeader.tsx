'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Store, CreditCard, History, QrCode, User, LogOut } from 'lucide-react';

export function PortalHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const navTabs = [
    { label: 'My Shop', href: '/portal', exact: true, icon: Store },
    { label: 'Pay Rent', href: '/portal/pay', exact: true, icon: CreditCard },
    { label: 'Payment Receipts', href: '/portal/history', exact: true, icon: History },
    { label: 'Counter QR', href: '/portal/qr', exact: true, icon: QrCode },
    { label: 'My Profile', href: '/portal/profile', exact: true, icon: User },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

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

          {/* Right: Logout */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
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
