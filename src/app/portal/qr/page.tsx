'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, QrCode, Printer, Copy, Check, Share2 } from 'lucide-react';
import { ShopWithTenant, Tenant } from '@/types/database';

export default function TenantQrPage() {
  const [shop, setShop] = useState<ShopWithTenant | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('plaza_active_tenant_id');
    fetch('/api/tenant/portal' + (saved ? `?tenant_id=${saved}` : ''))
      .then((r) => r.json())
      .then((data) => {
        setShop(data.shop);
        setTenant(data.tenant);
      })
      .catch(console.error);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://plaza.ng/pay/${shop?.name.toLowerCase().replace(/\s+/g, '-') || 'shop'}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <Link
          href="/portal"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Shop
        </Link>
      </div>

      {/* Printable Counter Stand Card */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs text-center">
        <div className="p-6 bg-stone-900 text-white space-y-1">
          <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase">
            RETAIL COUNTER DISPLAY
          </span>
          <h1 className="text-xl font-black">{shop?.name || 'My Store'}</h1>
          <p className="text-xs text-stone-300">
            {tenant?.full_name} • Ikeja Commercial Plaza
          </p>
        </div>

        <div className="p-8 space-y-6">
          <p className="text-xs text-stone-600 max-w-xs mx-auto">
            Scan with any Nigerian banking app or camera to pay directly at this store counter.
          </p>

          {/* QR Code Container */}
          <div className="relative w-64 h-64 mx-auto p-4 rounded-2xl border-2 border-stone-900 bg-white flex items-center justify-center shadow-sm">
            <Image
              src="/images/qr_code.png"
              alt="Counter Payment QR Code"
              width={220}
              height={220}
              priority
              className="object-contain"
            />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-stone-900 block">
              Instant Card • USSD • Bank Transfer
            </span>
            <span className="text-[11px] text-stone-400 block">
              Direct settlement to shop account
            </span>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-700 hover:bg-stone-50 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Counter Stand
            </button>

            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Link Copied' : 'Copy Payment Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
