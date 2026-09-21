"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface AuthCardProps {
  imageSrc: string;
  imageAlt: string;
  tagline?: string;
  badge?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({
  imageSrc,
  imageAlt,
  tagline = "Central Commercial Plaza • Lagos",
  badge,
  title,
  subtitle,
  children,
  footer,
}: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#f6f3f2]">
      <div className="w-full max-w-4xl bg-white border border-[#e4e2e1] rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-145">
        {/* Left Side: Visual Documentary Image Panel */}
        <div className="relative md:col-span-5 bg-[#1b1c1c] text-white p-6 sm:p-8 flex flex-col justify-between overflow-hidden min-h-55 md:min-h-full">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover opacity-60 mix-blend-luminosity hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-black/30" />

          {/* Top Brand Header */}
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <span className="font-semibold tracking-tight text-white text-sm sm:text-base">
                Plaza Portal
              </span>
            </Link>
            <p className="text-xs text-stone-300 mt-1 font-medium">{tagline}</p>
          </div>

          {/* Bottom Card Context */}
          <div className="relative z-10 mt-auto pt-6">
            {badge && (
              <span className="inline-block px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-md rounded-md border border-white/20 mb-2.5">
                {badge}
              </span>
            )}
            <p className="text-sm font-medium text-stone-200 leading-relaxed drop-shadow-sm">
              Reliable, transparent rent tracking and direct commercial
              management for shops and plaza owners.
            </p>
          </div>
        </div>

        {/* Right Side: Clean Form Container */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1b1c1c]">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-[#5e5e5e] mt-1.5 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            {children}
          </div>

          {footer && (
            <div className="max-w-md mx-auto w-full pt-6 mt-6 border-t border-[#f0eded] text-center text-xs text-[#5e5e5e]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
