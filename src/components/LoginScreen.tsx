import React, { useState } from 'react';
import { Building2, KeyRound, Sparkles, ShieldCheck, ArrowRight, Delete } from 'lucide-react';
import { useCrmStore } from '../store/useCrmStore';

export const LoginScreen: React.FC = () => {
  const { loginWithPin, loginDemoMode, isLoadingApp } = useCrmStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleDigit = async (digit: string) => {
    if (pin.length >= 6) return;
    const next = pin + digit;
    setPin(next);
    setError('');
    if (next.length === 4) {
      try {
        await loginWithPin(next);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Невалиден PIN код');
        setPin('');
      }
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--bg-canvas)] p-4">
      <div className="w-full max-w-md rounded-3xl border border-[var(--border-strong)] bg-[var(--surface-card)] p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary)] text-white flex items-center justify-center mx-auto shadow-lg">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
            CRM Flexi Home <span className="text-[var(--accent-primary)]">v5.0</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Корпоративна система за сглобяеми къщи, строителни обекти и ремонти
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-3 py-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  pin.length > i
                    ? 'bg-[var(--accent-primary)] scale-110'
                    : 'bg-[var(--surface-elevated)] border border-[var(--border-strong)]'
                }`}
              />
            ))}
          </div>
          {error && (
            <p className="text-center text-xs font-semibold text-rose-500">{error}</p>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button
              key={d}
              type="button"
              disabled={isLoadingApp}
              onClick={() => handleDigit(d)}
              className="h-13 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-base font-bold text-[var(--text-primary)] tabular-nums transition active:scale-95 cursor-pointer"
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin('')}
            className="h-13 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition cursor-pointer"
          >
            Изчисти
          </button>
          <button
            type="button"
            disabled={isLoadingApp}
            onClick={() => handleDigit('0')}
            className="h-13 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-base font-bold text-[var(--text-primary)] tabular-nums transition active:scale-95 cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => setPin((p) => p.slice(0, -1))}
            className="h-13 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>

        {/* Instant Enterprise Demo Mode Button */}
        <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2.5">
          <button
            type="button"
            onClick={loginDemoMode}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-[var(--accent-primary)] to-emerald-600 text-white text-xs font-bold shadow-md hover:opacity-95 transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Отвори интерактивно Демо (Всички функции Faz 1–4)</span>
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Google Apps Script API + IndexedDB Офлайн Синхронизация</span>
          </div>
        </div>
      </div>
    </div>
  );
};
