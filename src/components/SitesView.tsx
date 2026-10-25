import React, { useState } from 'react';
import {
  Hammer,
  Map as MapIcon,
  SplitSquareVertical,
  MapPin,
  Navigation,
  Users,
  Search,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  LocateFixed,
} from 'lucide-react';
import { useCrmStore } from '../store/useCrmStore';
import { ClientSummary } from '../types/crm';
import {
  AvatarBadge,
  SkeletonList,
  formatEur,
  formatBgDate,
} from './ui/ThemeAndPrimitives';
import { ClientDetailPanel } from './ClientDetailPanel';
import { CITY_COORDS } from '../api/mockData';

function resolveSiteCoords(client: ClientSummary): [number, number] {
  const m = String(client.maps || '').match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (m) {
    return [parseFloat(m[1]), parseFloat(m[2])];
  }
  const cityKey = String(client.c || '')
    .trim()
    .toLowerCase();
  for (const [k, coords] of Object.entries(CITY_COORDS)) {
    if (cityKey.includes(k) || k.includes(cityKey)) {
      return coords;
    }
  }
  return [42.6977, 23.3219];
}

export const SitesView: React.FC = () => {
  const {
    appData,
    isLoadingApp,
    sitesViewMode,
    setSitesViewMode,
    selectedSiteName,
    selectSite,
  } = useCrmStore();

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'done'>('all');
  const [search, setSearch] = useState('');
  const [focusedPin, setFocusedPin] = useState<string | null>(null);

  if (isLoadingApp && !appData) {
    return <SkeletonList rows={5} />;
  }

  const allSites = (appData?.clients || []).filter(
    (c) => c.x || c.s === 'Сключен договор' || c.s === 'В процес' || c.s === 'Завършено'
  );

  const filteredSites = allSites.filter((c) => {
    const st = c.x?.o || '🔨 Тече';
    if (statusFilter === 'active' && !st.includes('Тече')) return false;
    if (statusFilter === 'paused' && !st.includes('Пауза')) return false;
    if (statusFilter === 'done' && !st.includes('Завършен')) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const hay = `${c.n} ${c.c} ${c.m} ${(c.x?.w || []).join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const activeSiteName = selectedSiteName || filteredSites[0]?.n || null;
  const focusedSite =
    filteredSites.find((s) => s.n === (focusedPin || activeSiteName)) || filteredSites[0] || null;
  const focusedCoords = focusedSite ? resolveSiteCoords(focusedSite) : ([42.7, 25.0] as [number, number]);

  const totalDeals = filteredSites.reduce((acc, s) => acc + (s.x?.deal || s.b || 0), 0);
  const totalGot = filteredSites.reduce((acc, s) => acc + (s.x?.got || 0), 0);

  return (
    <div className="h-[calc(100dvh-3.75rem)] flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 sm:px-6 py-3 border-b border-[var(--border-subtle)] bg-[var(--surface-card)] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-0.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-2xs'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              Всички ({allSites.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Тече</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('paused')}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                statusFilter === 'paused'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              <PauseCircle className="w-3.5 h-3.5" />
              <span>Пауза</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('done')}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                statusFilter === 'done'
                  ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Завършени</span>
            </button>
          </div>

          <div className="relative w-48 sm:w-56">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Търси обект или бригада..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs tabular-nums">
            <span className="text-[var(--text-muted)]">
              Договори: <strong className="text-[var(--text-primary)]">{formatEur(totalDeals)}</strong>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400">
              Събрани: <strong>{formatEur(totalGot)}</strong>
            </span>
          </div>

          {/* Toggle Split View vs Interactive Map */}
          <div className="flex items-center p-0.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setSitesViewMode('split')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                sitesViewMode === 'split'
                  ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-2xs'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Обекти + Детайли</span>
            </button>
            <button
              type="button"
              onClick={() => setSitesViewMode('map')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                sitesViewMode === 'map'
                  ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-2xs'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Карта на обектите</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODE 1: MASTER-DETAIL SPLIT VIEW */}
      {sitesViewMode === 'split' ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          <div className="lg:col-span-5 border-r border-[var(--border-subtle)] overflow-y-auto divide-y divide-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            {filteredSites.map((site) => {
              const isSelected = activeSiteName === site.n;
              const deal = site.x?.deal || site.b || 0;
              const got = site.x?.got || 0;
              const paidPct = deal > 0 ? Math.min(100, Math.round((got / deal) * 100)) : 0;
              const st = site.x?.o || '🔨 Тече';

              return (
                <div
                  key={site.n}
                  onClick={() => selectSite(site.n, window.innerWidth < 1024)}
                  className={`p-4 cursor-pointer transition space-y-3 ${
                    isSelected
                      ? 'bg-[var(--accent-subtle)]/70 border-l-4 border-l-[var(--accent-primary)]'
                      : 'bg-[var(--surface-card)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <AvatarBadge name={site.n} size="md" />
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-[var(--text-primary)] truncate">
                          {site.n}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-0.5">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[var(--text-muted)]" />
                            {site.c || '—'}
                          </span>
                          <span>·</span>
                          <span className="font-semibold text-[var(--accent-primary)] tabular-nums">
                            {site.m}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        st.includes('Пауза')
                          ? 'bg-amber-500/12 text-amber-600 dark:text-amber-400 border-amber-500/25'
                          : st.includes('Завършен')
                          ? 'bg-sky-500/12 text-sky-600 dark:text-sky-400 border-sky-500/25'
                          : 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                      }`}
                    >
                      {st.includes('Пауза')
                        ? 'Пауза'
                        : st.includes('Завършен')
                        ? 'Завършен'
                        : 'В строеж'}
                    </span>
                  </div>

                  {/* Financial Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] tabular-nums">
                      <span className="text-[var(--text-muted)]">
                        Платени: <strong className="text-[var(--text-primary)]">{formatEur(got)}</strong> от{' '}
                        {formatEur(deal)}
                      </span>
                      <span className="font-bold text-[var(--accent-primary)]">{paidPct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[var(--surface-elevated)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--accent-primary)] transition-all"
                        style={{ width: `${paidPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Assigned Workers & Start Date */}
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <div className="flex items-center gap-1.5 truncate">
                      <Users className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                      <span className="truncate">
                        {site.x?.w?.length ? site.x.w.join(', ') : 'Няма назначена бригада'}
                      </span>
                    </div>
                    <span className="tabular-nums shrink-0">
                      Старт: {formatBgDate(site.x?.s0 || site.i)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden lg:block lg:col-span-7 overflow-hidden">
            <ClientDetailPanel clientName={activeSiteName} />
          </div>
        </div>
      ) : (
        /* MODE 2: INTERACTIVE GPS SITE MAP VIEW (Карта на обектите) */
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          <div className="lg:col-span-8 relative bg-slate-900 min-h-[380px]">
            {/* Embedded OpenStreetMap around focused site */}
            <iframe
              title="Карта на обектите"
              className="w-full h-full border-0"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                focusedCoords[1] - 0.18
              }%2C${focusedCoords[0] - 0.12}%2C${focusedCoords[1] + 0.18}%2C${
                focusedCoords[0] + 0.12
              }&layer=mapnik&marker=${focusedCoords[0]}%2C${focusedCoords[1]}`}
            />

            {/* Floating GPS Site Switcher Pills on Map */}
            <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-1.5 pointer-events-auto">
              {filteredSites.map((site) => {
                const isFocused = (focusedPin || activeSiteName) === site.n;
                const coords = resolveSiteCoords(site);
                return (
                  <button
                    key={site.n}
                    type="button"
                    onClick={() => {
                      setFocusedPin(site.n);
                      selectSite(site.n, false);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md border transition cursor-pointer ${
                      isFocused
                        ? 'bg-[var(--accent-primary)] text-white border-white/30 scale-105'
                        : 'bg-[var(--surface-card)]/90 text-[var(--text-primary)] border-[var(--border-strong)] hover:bg-[var(--surface-card)]'
                    }`}
                  >
                    <LocateFixed className="w-3.5 h-3.5" />
                    <span>{site.n}</span>
                    <span className="opacity-75 font-normal">({site.c})</span>
                    <span className="hidden sm:inline text-[10px] opacity-70 tabular-nums">
                      {coords[0].toFixed(2)}, {coords[1].toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Map Action Bar */}
            {focusedSite && (
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-[var(--surface-card)]/95 backdrop-blur-md border border-[var(--border-strong)] shadow-2xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AvatarBadge name={focusedSite.n} size="md" />
                  <div>
                    <div className="text-sm font-bold text-[var(--text-primary)]">
                      {focusedSite.n} · {focusedSite.c}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] tabular-nums">
                      Модел: {focusedSite.m} · Договор: {formatEur(focusedSite.x?.deal || focusedSite.b)} ·
                      Бригада: {focusedSite.x?.w?.join(', ') || '—'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${focusedCoords[0]},${focusedCoords[1]}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-95 transition"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Google Maps</span>
                  </a>
                  <a
                    href={`https://waze.com/ul?ll=${focusedCoords[0]},${focusedCoords[1]}&navigate=yes`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition"
                  >
                    <Hammer className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                    <span>Waze</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 border-l border-[var(--border-subtle)] overflow-hidden">
            <ClientDetailPanel clientName={focusedSite?.n || activeSiteName} />
          </div>
        </div>
      )}
    </div>
  );
};
