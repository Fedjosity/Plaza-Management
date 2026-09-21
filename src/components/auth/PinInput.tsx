'use client';

import React, { useRef, useEffect } from 'react';

interface PinInputProps {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  onComplete?: (val: string) => void;
  disabled?: boolean;
}

export function PinInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
}: PinInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleCharChange = (index: number, char: string) => {
    const clean = char.replace(/[^0-9]/g, '');
    if (!clean) return;

    const chars = value.padEnd(length, ' ').split('');
    chars[index] = clean.slice(-1);
    const newVal = chars.join('').trim();
    onChange(newVal);

    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (newVal.length === length && onComplete) {
      onComplete(newVal);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const chars = value.split('');
      chars[index] = '';
      onChange(chars.join(''));

      if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
    if (pasted) {
      onChange(pasted);
      if (pasted.length === length && onComplete) {
        onComplete(pasted);
      }
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 max-w-xs mx-auto my-4" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleCharChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold bg-[#fcf9f8] border border-[#c4c7c7] rounded-lg text-[#1b1c1c] focus:border-[#1b1c1c] focus:ring-2 focus:ring-[#1b1c1c]/10 outline-none transition-all shadow-sm"
        />
      ))}
    </div>
  );
}
