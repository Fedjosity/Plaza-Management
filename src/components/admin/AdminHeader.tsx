'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Building2, Plus, CreditCard, LayoutDashboard, Store, Settings } from 'lucide-react';

interface AdminHeaderProps {
  onOpenPaymentModal: () => void;
}

export function AdminHeader({ onOpenPaymentModal }: AdminHeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Shops', href: '/admin/shops', icon: Store, exact: false },
    { label: 'Settings', href: '/admin/settings', icon: Settings, exact: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand */}
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center text-white shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black tracking-widest text-stone-900 uppercase block leading-tight">
                  PLAZA MGMT
                </span>
                <span className="text-[10px] text-stone-500 font-medium block">
                  Ikeja Central Arcade
                </span>
              </div>
            </Link>

            {/* Nav Tabs (Desktop) */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-stone-100 text-stone-900 font-extrabold'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenPaymentModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Record</span> Payment
            </button>

            <Link
              href="/admin/shops/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 text-white text-xs font-bold hover:bg-black transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add</span> Shop
            </Link>

            {/* Manager Avatar Chip */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-stone-200">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-stone-300 bg-stone-100">
                <Image
                  src="/images/manager_portrait.jpg"
                  alt="Plaza Property Manager"
                  fill
                  className="object-cover grayscale"
                />
              </div>
              <div className="hidden lg:block text-left leading-tight">
                <span className="text-xs font-bold text-stone-900 block">Chief Durojaiye</span>
                <span className="text-[10px] text-stone-500 font-medium">Plaza Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
