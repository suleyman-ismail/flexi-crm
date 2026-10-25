import React, { useState, useRef } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  RotateCcw,
  X,
} from 'lucide-react';
import { useCrmStore } from '../../store/useCrmStore';

export function formatEur(amount: number | string | undefined | null): string {
  const n = Math.round(Number(amount) || 0);
  return (n < 0 ? '−' : '') + '€' + Math.abs(n).toLocaleString('en-US');
}

export function formatBgDate(isoDate?: string): string {
  if (!isoDate) return '—';
  const months = [
    'яну',
    'фев',
    'мар',
    'апр',
    'май',
    'юни',
    'юли',
    'авг',
    'сеп',
    'окт',
    'ное',
    'дек',
  ];
  const parts = String(isoDate).split('-');
  if (parts.length < 3) return isoDate;
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  return `${d} ${months[m] || parts[1]}`;
}

const STAGE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  'Ново запитване': {
    bg: 'bg-sky-500/12 border-sky-500/25',
    text: 'text-sky-600 dark:text-sky-400',
    dot: 'bg-sky-500',
  },
  'Проведена среща': {
    bg: 'bg-violet-500/12 border-violet-500/25',
    text: 'text-violet-600 dark:text-violet-400',
    dot: 'bg-violet-500',
  },
  Оглед: {
    bg: 'bg-violet-500/12 border-violet-500/25',
    text: 'text-violet-600 dark:text-violet-400',
    dot: 'bg-violet-500',
  },
  'Изпратена оферта': {
    bg: 'bg-amber-500/12 border-amber-500/25',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  Преговори: {
    bg: 'bg-orange-500/12 border-orange-500/25',
    text: 'text-orange-700 dark:text-orange-400',
    dot: 'bg-orange-500',
  },
  'В процес': {
    bg: 'bg-cyan-500/12 border-cyan-500/25',
    text: 'text-cyan-700 dark:text-cyan-400',
    dot: 'bg-cyan-500',
  },
  'Сключен договор': {
    bg: 'bg-emerald-500/12 border-emerald-500/25',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  Завършено: {
    bg: 'bg-emerald-500/12 border-emerald-500/25',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  Загубен: {
    bg: 'bg-slate-500/12 border-slate-500/25',
    text: 'text-slate-600 dark:text-slate-400',
    dot: 'bg-slate-400',
  },
};

export const StageBadge: React.FC<{ stage: string; size?: 'sm' | 'md' }> = ({
  stage,
  size = 'sm',
}) => {
  if (!stage) return null;
  const st = STAGE_STYLES[stage] || {
    bg: 'bg-slate-500/10 border-slate-500/20',
    text: 'text-slate-600 dark:text-slate-300',
    dot: 'bg-slate-400',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${st.bg} ${st.text} ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
      {stage}
    </span>
  );
};

export const AvatarBadge: React.FC<{ name: string; size?: 'sm' | 'md' | 'lg' }> = ({
  name,
  size = 'md',
}) => {
  const parts = String(name || 'К')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : String(name || 'К')
          .slice(0, 2)
          .toUpperCase();

  const palettes = [
    'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/25',
    'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/25',
    'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/25',
    'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/25',
    'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
    'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/25',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const color = palettes[hash % palettes.length];
  const dims =
    size === 'sm'
      ? 'h-8 w-8 text-xs'
      : size === 'lg'
      ? 'h-12 w-12 text-base'
      : 'h-10 w-10 text-xs';

  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center rounded-xl border font-bold tracking-tight ${dims} ${color}`}
    >
      {initials}
    </div>
  );
};

// ---------- Shimmer Skeleton Loaders (Faz 3) ----------
export const SkeletonList: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3 p-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4"
      >
        <div className="h-10 w-10 shrink-0 rounded-xl shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/5 rounded-md shimmer" />
          <div className="h-3 w-3/4 rounded-md shimmer" />
        </div>
        <div className="h-6 w-20 rounded-full shimmer" />
      </div>
    ))}
  </div>
);

export const SkeletonDetail: React.FC = () => (
  <div className="space-y-5 p-6">
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-2xl shimmer" />
      <div className="flex-1 space-y-2">
        <div className="h-5 w-48 rounded-lg shimmer" />
        <div className="h-3.5 w-32 rounded-md shimmer" />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-3">
      <div className="h-20 rounded-2xl shimmer" />
      <div className="h-20 rounded-2xl shimmer" />
      <div className="h-20 rounded-2xl shimmer" />
    </div>
    <div className="h-56 rounded-2xl shimmer" />
    <div className="space-y-2.5">
      <div className="h-12 rounded-xl shimmer" />
      <div className="h-12 rounded-xl shimmer" />
      <div className="h-12 rounded-xl shimmer" />
    </div>
  </div>
);

// ---------- Rich Undoable Toast Notifications (Faz 3) ----------
export const ToastViewport: React.FC = () => {
  const toasts = useCrmStore((s) => s.toasts);
  const dismissToast = useCrmStore((s) => s.dismissToast);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2.5 lg:bottom-6 lg:right-6 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => {
        const Icon =
          t.variant === 'success'
            ? CheckCircle2
            : t.variant === 'warning'
            ? AlertTriangle
            : t.variant === 'error'
            ? XCircle
            : Info;
        const iconColor =
          t.variant === 'success'
            ? 'text-emerald-500'
            : t.variant === 'warning'
            ? 'text-amber-500'
            : t.variant === 'error'
            ? 'text-rose-500'
            : 'text-teal-500';

        return (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-card)]/95 p-3.5 shadow-xl backdrop-blur-md transition-all"
          >
            <Icon className={`h-5 w-5 shrink-0 ${iconColor}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                {t.title}
              </p>
              {t.description && (
                <p className="truncate text-xs text-[var(--text-secondary)] mt-0.5">
                  {t.description}
                </p>
              )}
            </div>
            {t.onUndo && (
              <button
                onClick={() => {
                  t.onUndo?.();
                  dismissToast(t.id);
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-[var(--accent-soft)] px-2.5 py-1.5 text-xs font-bold text-[var(--accent-primary)] hover:opacity-90 transition cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t.undoLabel || 'Върни'}
              </button>
            )}
            <button
              onClick={() => dismissToast(t.id)}
              className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-pointer"
              aria-label="Затвори"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

// ---------- Vaul-Style Draggable Bottom Sheet for Mobile (Faz 1) ----------
export const DraggableBottomSheet: React.FC<{
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}> = ({ open, onClose, title, children }) => {
  const [dragOffset, setDragOffset] = useState(0);
  const startY = useRef<number | null>(null);

  if (!open) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) setDragOffset(dy);
  };
  const handleTouchEnd = () => {
    if (dragOffset > 110) {
      setDragOffset(0);
      onClose();
    } else {
      setDragOffset(0);
    }
    startY.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col justify-end bg-slate-950/60 backdrop-blur-xs lg:hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          transform: `translateY(${dragOffset}px)`,
          transition: startY.current === null ? 'transform 0.22s ease-out' : 'none',
        }}
        className="flex max-h-[90dvh] w-full flex-col rounded-t-3xl border-t border-[var(--border-strong)] bg-[var(--surface-card)] shadow-2xl overflow-hidden"
      >
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex flex-col items-center pt-3 pb-2 px-4 border-b border-[var(--border-subtle)] cursor-grab active:cursor-grabbing"
        >
          <div className="h-1.5 w-12 rounded-full bg-[var(--border-strong)] mb-2" />
          <div className="flex w-full items-center justify-between">
            <span className="text-sm font-bold text-[var(--text-primary)] truncate">
              {title || 'Детайли'}
            </span>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
