'use client';

import React from 'react';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (formatted: string) => void;
  label?: string;
  error?: string;
}

export function PhoneInput({
  value,
  onChange,
  label = "Phone Number",
  error,
  ...props
}: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Keep only numbers
    const raw = e.target.value.replace(/[^0-9]/g, '');
    
    // Format locally for Nigeria: e.g. 0803 123 4567 or 803 123 4567
    let clean = raw;
    if (clean.startsWith('234')) {
      clean = clean.slice(3);
    }
    if (clean.startsWith('0')) {
      clean = clean.slice(1);
    }
    // Limit to 10 digits after +234
    clean = clean.slice(0, 10);

    onChange(clean);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#444748] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative flex items-center rounded-lg border border-[#c4c7c7] bg-[#fcf9f8] focus-within:border-[#1b1c1c] focus-within:ring-1 focus-within:ring-[#1b1c1c] transition-all">
        <div className="flex items-center gap-1.5 pl-3.5 pr-2 py-2.5 text-sm font-semibold text-[#1b1c1c] border-r border-[#e4e2e1] select-none">
          <span>🇳🇬</span>
          <span>+234</span>
        </div>
        <input
          type="tel"
          value={value}
          onChange={handleChange}
          placeholder="803 123 4567"
          className="w-full px-3.5 py-2.5 text-sm bg-transparent outline-none text-[#1b1c1c] placeholder:text-[#858383] font-mono tracking-wide"
          {...props}
        />
      </div>
      {error && <p className="text-xs text-[#ba1a1a] mt-1 font-medium">{error}</p>}
    </div>
  );
}
