import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  User,
  HardHat,
  CheckSquare,
  Plus,
  Moon,
  Sun,
  ArrowRight,
  Building2,
  Hammer,
  Wrench,
  X,
} from 'lucide-react';
import { useCrmStore } from '../store/useCrmStore';
import { formatEur, StageBadge } from './ui/ThemeAndPrimitives';

export const CommandPalette: React.FC = () => {
  const cmdOpen = useCrmStore((s) => s.cmdOpen);
  const setCmdOpen = useCrmStore((s) => s.setCmdOpen);
  const appData = useCrmStore((s) => s.appData);
  const setActiveTab = useCrmStore((s) => s.setActiveTab);
  const selectClient = useCrmStore((s) => s.selectClient);
  const selectSite = useCrmStore((s) => s.selectSite);
  const setNewModalOpen = useCrmStore((s) => s.setNewModalOpen);
  const toggleTheme = useCrmStore((s) => s.toggleTheme);
  const theme = useCrmStore((s) => s.theme);
  const ws = useCrmStore((s) => s.ws);
  const setWorkspace = useCrmStore((s) => s.setWorkspace);

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen(!cmdOpen);
      } else if (e.key === 'Escape' && cmdOpen) {
        setCmdOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cmdOpen, setCmdOpen]);

  useEffect(() => {
    if (cmdOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [cmdOpen]);

  const results = useMemo(() => {
    if (!appData) return { clients: [], tasks: [], workers: [] };
    const q = query.trim().toLowerCase();
    const clients = appData.clients
      .filter(
        (c) =>
          !q ||
          c.n.toLowerCase().includes(q) ||
          (c.c || '').toLowerCase().includes(q) ||
          (c.m || '').toLowerCase().includes(q) ||
          (c.p || '').toLowerCase().includes(q)
      )
      .slice(0, 6);

    const tasks = appData.tasks
      .filter(
        (t) =>
          !q ||
          t.client.toLowerCase().includes(q) ||
          (t.type || '').toLowerCase().includes(q) ||
          (t.remind || '').toLowerCase().includes(q)
      )
      .slice(0, 4);

    const workers = appData.workers
      .filter(
        (w) =>
          !q ||
          w.n.toLowerCase().includes(q) ||
          (w.sp || '').toLowerCase().includes(q) ||
          (w.city || '').toLowerCase().includes(q)
      )
      .slice(0, 3);

    return { clients, tasks, workers };
  }, [appData, query]);

  if (!cmdOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 pt-14 px-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) setCmdOpen(false);
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-card)] shadow-2xl">
        {/* Search Input Header */}
        <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3.5">
          <Search className="h-5 w-5 text-[var(--accent-primary)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Търси клиент, обект, град, задача или команда… (ESC за затваряне)"
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
          />
          <button
            onClick={() => setCmdOpen(false)}
            className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--surface-hover)] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[68vh] overflow-y-auto p-3 space-y-4">
          {/* Quick Actions */}
          <div>
            <p className="px-2.5 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Бързи действия
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  setCmdOpen(false);
                  setNewModalOpen('task');
                }}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-primary)]">
                  <Plus className="h-4 w-4" />
                </div>
                <span>Нова задача</span>
              </button>
              <button
                onClick={() => {
                  setCmdOpen(false);
                  setNewModalOpen('client');
                }}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/12 text-emerald-500">
                  <User className="h-4 w-4" />
                </div>
                <span>Нов клиент / Обект</span>
              </button>
              <button
                onClick={() => {
                  setCmdOpen(false);
                  setWorkspace(ws === 'r' ? '' : 'r');
                }}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/12 text-amber-500">
                  {ws === 'r' ? <Building2 className="h-4 w-4" /> : <Hammer className="h-4 w-4" />}
                </div>
                <span>
                  Превключи към {ws === 'r' ? 'Flexi Home (Къщи)' : 'Ремонти и строителство'}
                </span>
              </button>
              <button
                onClick={() => {
                  toggleTheme();
                  setCmdOpen(false);
                }}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/12 text-indigo-500">
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </div>
                <span>{theme === 'dark' ? 'Светла тема' : 'Тъмна тема (Dark Mode)'}</span>
              </button>
            </div>
          </div>

          {/* Clients & Sites */}
          {results.clients.length > 0 && (
            <div>
              <p className="px-2.5 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Клиенти и Обекти ({results.clients.length})
              </p>
              <div className="space-y-1">
                {results.clients.map((c) => (
                  <button
                    key={c.n}
                    onClick={() => {
                      setCmdOpen(false);
                      if (c.x) {
                        setActiveTab('sites');
                        selectSite(c.n, true);
                      } else {
                        setActiveTab('clients');
                        selectClient(c.n, true);
                      }
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-[var(--surface-hover)] transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-elevated)] text-[var(--text-secondary)]">
                        {c.x ? <HardHat className="h-4 w-4 text-[var(--accent-primary)]" /> : <User className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                          {c.n}
                        </p>
                        <p className="truncate text-xs text-[var(--text-secondary)]">
                          {[c.c, c.m].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      {c.b > 0 && (
                        <span className="text-xs font-bold tabular-nums text-[var(--text-secondary)]">
                          {formatEur(c.b)}
                        </span>
                      )}
                      <StageBadge stage={c.s} />
                      <ArrowRight className="h-4 w-4 text-[var(--text-muted)]" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {results.tasks.length > 0 && (
            <div>
              <p className="px-2.5 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Задачи ({results.tasks.length})
              </p>
              <div className="space-y-1">
                {results.tasks.map((t) => (
                  <button
                    key={t.id || t.row}
                    onClick={() => {
                      setCmdOpen(false);
                      setActiveTab('clients');
                      selectClient(t.client, true);
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left hover:bg-[var(--surface-hover)] transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CheckSquare className="h-4 w-4 shrink-0 text-[var(--accent-primary)]" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                          {t.client} · <span className="font-semibold">{t.type}</span>
                        </p>
                        <p className="truncate text-xs text-[var(--text-secondary)]">
                          {t.remind || t.desc || t.date}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium tabular-nums text-[var(--text-muted)]">
                      {t.date}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Workers */}
          {results.workers.length > 0 && (
            <div>
              <p className="px-2.5 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Екип и Майстори ({results.workers.length})
              </p>
              <div className="space-y-1">
                {results.workers.map((w) => (
                  <button
                    key={w.n}
                    onClick={() => {
                      setCmdOpen(false);
                      setActiveTab('workers');
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left hover:bg-[var(--surface-hover)] transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Wrench className="h-4 w-4 shrink-0 text-amber-500" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                          {w.n}
                        </p>
                        <p className="truncate text-xs text-[var(--text-secondary)]">
                          {w.sp} · {w.city}
                        </p>
                      </div>
                    </div>
                    {w.owed > 0 && (
                      <span className="text-xs font-bold tabular-nums text-amber-600 dark:text-amber-400">
                        Дължимо {formatEur(w.owed)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
