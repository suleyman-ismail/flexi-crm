import React, { useState, useRef } from 'react';
import { SlidersHorizontal, ArrowLeftRight, Sparkles, Maximize2 } from 'lucide-react';
import { BEFORE_SVG_DATA_URI, AFTER_SVG_DATA_URI } from '../api/mockData';
import { MediaPhoto } from '../types/crm';

interface BeforeAfterSliderProps {
  photos?: MediaPhoto[];
  clientName: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ photos = [], clientName }) => {
  const [sliderPos, setSliderPos] = useState(52);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const beforePhoto = photos.find((p) => p.beforeAfter === 'before') || photos[0];
  const afterPhoto = photos.find((p) => p.beforeAfter === 'after') || photos[1];

  const beforeSrc = beforePhoto?.url || beforePhoto?.thumb || BEFORE_SVG_DATA_URI;
  const afterSrc = afterPhoto?.url || afterPhoto?.thumb || AFTER_SVG_DATA_URI;

  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPos(percent);
  };

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] overflow-hidden shadow-xs">
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)]/60">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[var(--accent-primary)]" />
          <span className="text-xs font-semibold text-[var(--text-primary)]">
            Интерактивно сравнение: Преди и След
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-[var(--text-muted)] tabular-nums">
            {sliderPos}% / {100 - sliderPos}%
          </span>
          <button
            type="button"
            onClick={() => setSliderPos(50)}
            className="px-2 py-0.5 text-[10px] font-semibold rounded bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            50/50
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        onPointerDown={(e) => {
          setIsDragging(true);
          updatePosition(e.clientX);
        }}
        onPointerMove={(e) => {
          if (isDragging) updatePosition(e.clientX);
        }}
        onPointerUp={() => setIsDragging(false)}
        onPointerLeave={() => setIsDragging(false)}
        className="relative w-full h-56 sm:h-64 select-none cursor-ew-resize overflow-hidden touch-none bg-slate-950"
      >
        {/* AFTER IMAGE (Base layer) */}
        <img
          src={afterSrc}
          alt={`${clientName} - След`}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          draggable={false}
        />

        {/* BEFORE IMAGE (Clipped overlay) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <img
            src={beforeSrc}
            alt={`${clientName} - Преди`}
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md border border-white/15 text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 pointer-events-none">
          <span>Етап 1 · Преди</span>
        </div>
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-emerald-950/85 backdrop-blur-md border border-emerald-400/30 text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5 pointer-events-none">
          <Sparkles className="w-3 h-3" />
          <span>Завършен · След</span>
        </div>

        {/* Divider Handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.8)] pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white text-slate-900 shadow-lg border-2 border-[var(--accent-primary)] flex items-center justify-center">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
        </div>

        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white/80 pointer-events-none drop-shadow">
          <span className="truncate max-w-[45%]">{beforePhoto?.name || 'Груб строеж / Основа'}</span>
          <span className="truncate max-w-[45%] text-right">{afterPhoto?.name || 'Финален монтаж'}</span>
        </div>
      </div>
    </div>
  );
};
