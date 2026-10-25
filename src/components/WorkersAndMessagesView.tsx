import React, { useState, useEffect } from 'react';
import {
  HardHat,
  Factory,
  Phone,
  MapPin,
  Star,
  Wallet,
  Send,
  MessageSquare,
  Users,
  CheckCheck,
} from 'lucide-react';
import { useCrmStore } from '../store/useCrmStore';
import { AvatarBadge, formatEur, formatBgDate } from './ui/ThemeAndPrimitives';
import { gasApiCall } from '../api/client';
import { ChatConv, ChatMessage } from '../types/crm';

export const WorkersView: React.FC = () => {
  const { appData } = useCrmStore();
  const [tab, setTab] = useState<'workers' | 'partners'>('workers');

  const workers = appData?.workers || [];
  const partners = appData?.partners || [];

  const totalOwed = workers.reduce((s, w) => s + (w.owed || 0), 0);
  const totalPaid = workers.reduce((s, w) => s + (w.paid || 0), 0);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-5">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center p-1 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => setTab('workers')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              tab === 'workers'
                ? 'bg-[var(--accent-primary)] text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <HardHat className="w-4 h-4" />
            <span>Майстори и Бригади ({workers.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('partners')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              tab === 'partners'
                ? 'bg-[var(--accent-primary)] text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Factory className="w-4 h-4" />
            <span>Партньори и Доставчици ({partners.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs tabular-nums">
          <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
            <span className="text-[var(--text-muted)]">Изплатени: </span>
            <strong className="text-emerald-600 dark:text-emerald-400">{formatEur(totalPaid)}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
            <span className="text-[var(--text-muted)]">Дължими хонорари: </span>
            <strong className="text-amber-600 dark:text-amber-400">{formatEur(totalOwed)}</strong>
          </div>
        </div>
      </div>

      {tab === 'workers' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workers.map((w) => (
            <div
              key={w.n}
              className="p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-2xs space-y-3.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AvatarBadge name={w.n} size="lg" />
                  <div>
                    <div className="text-sm font-bold text-[var(--text-primary)]">{w.n}</div>
                    <div className="text-xs font-medium text-[var(--accent-primary)]">{w.sp}</div>
                    <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] mt-0.5">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {w.city}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: w.r || 5 }).map((_, idx) => (
                          <Star key={idx} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </span>
                    </div>
                  </div>
                </div>

                {w.p && (
                  <a
                    href={`tel:${w.p}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 text-xs font-semibold tabular-nums"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{w.p}</span>
                  </a>
                )}
              </div>

              {w.note && <p className="text-xs text-[var(--text-secondary)]">{w.note}</p>}

              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-[var(--surface-elevated)]/60 border border-[var(--border-subtle)] text-xs tabular-nums">
                <div>
                  <span className="text-[var(--text-muted)] block text-[11px]">Изплатено общо</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatEur(w.paid)}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[11px]">Остатък за плащане</span>
                  <span
                    className={`font-bold text-sm ${
                      w.owed > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {formatEur(w.owed)}
                  </span>
                </div>
              </div>

              {w.jobs && w.jobs.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Разпределени задачи по обекти
                  </div>
                  {w.jobs.map((jb, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-[var(--surface-elevated)]/40"
                    >
                      <div className="truncate pr-2">
                        <strong className="text-[var(--text-primary)]">{jb.c}</strong> ·{' '}
                        <span className="text-[var(--text-secondary)]">{jb.j}</span>
                      </div>
                      <span className="font-semibold tabular-nums shrink-0 text-[var(--text-primary)]">
                        {formatEur(jb.a)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {partners.map((p) => (
            <div
              key={p.n}
              className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[var(--accent-subtle)] text-[var(--accent-primary)]">
                    {p.t}
                  </span>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mt-1.5">{p.n}</h3>
                  <p className="text-xs text-[var(--text-secondary)]">{p.w}</p>
                </div>
              </div>
              <div className="text-xs text-[var(--text-muted)] space-y-1 pt-2 border-t border-[var(--border-subtle)]">
                <div>Град: {p.city}</div>
                <div>Контакт: {p.ct}</div>
                {p.p && (
                  <a
                    href={`tel:${p.p}`}
                    className="inline-flex items-center gap-1 text-[var(--accent-primary)] font-semibold tabular-nums pt-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {p.p}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const MessagesView: React.FC = () => {
  const { appData, token, ws } = useCrmStore();
  const [convs, setConvs] = useState<ChatConv[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<string>('*');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    gasApiCall<{ convs: ChatConv[] }>('chatList', [], { token, ws }).then((res) => {
      if (res?.convs) setConvs(res.convs);
    });
  }, [token, ws]);

  useEffect(() => {
    gasApiCall<{ msgs: ChatMessage[] }>('chatOpen', [selectedPeer], { token, ws }).then((res) => {
      if (res?.msgs) setMessages(res.msgs);
    });
  }, [selectedPeer, token, ws]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const text = draft.trim();
    setDraft('');
    const optimisticMsg: ChatMessage = {
      id: 'm-' + Date.now(),
      t: Date.now(),
      f: appData?.me || 'Сюлейман',
      x: text,
      r: 1,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    await gasApiCall('chatSend', [selectedPeer, text, null, null], { token, ws });
  };

  return (
    <div className="h-[calc(100dvh-3.75rem)] grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
      {/* Left Channels */}
      <div className="lg:col-span-4 border-r border-[var(--border-subtle)] bg-[var(--surface-card)] overflow-y-auto divide-y divide-[var(--border-subtle)]">
        <div className="p-3.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[var(--accent-primary)]" />
          <span>Вътрешни канали на екипа</span>
        </div>
        {convs.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedPeer(c.id)}
            className={`w-full p-3.5 text-left flex items-center justify-between gap-3 transition cursor-pointer ${
              selectedPeer === c.id
                ? 'bg-[var(--accent-subtle)]/70 border-l-4 border-l-[var(--accent-primary)]'
                : 'hover:bg-[var(--surface-hover)]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <AvatarBadge name={c.n} size="md" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-[var(--text-primary)] truncate">{c.n}</div>
                <div className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">{c.x}</div>
              </div>
            </div>
            {c.un > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[var(--accent-primary)] text-white text-[10px] font-bold tabular-nums">
                {c.un}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Right Chat Stream */}
      <div className="lg:col-span-8 flex flex-col bg-[var(--bg-canvas)] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {messages.map((m) => {
            const isMine = m.f === (appData?.me || 'Сюлейман');
            return (
              <div
                key={m.id}
                className={`flex flex-col max-w-md ${
                  isMine ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <span className="text-[10px] font-semibold text-[var(--text-muted)] mb-1 px-1">
                  {m.f}
                </span>
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    isMine
                      ? 'bg-[var(--accent-primary)] text-white rounded-br-xs'
                      : 'bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-bl-xs'
                  }`}
                >
                  {m.x}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] mt-1 px-1 tabular-nums">
                  <span>
                    {new Date(m.t).toLocaleTimeString('bg-BG', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {isMine && <CheckCheck className="w-3 h-3 text-emerald-500" />}
                </div>
              </div>
            );
          })}
        </div>

        <form
          onSubmit={handleSend}
          className="p-3.5 border-t border-[var(--border-subtle)] bg-[var(--surface-card)] flex items-center gap-2"
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Напишете съобщение до екипа..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-95 transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Изпрати</span>
          </button>
        </form>
      </div>
    </div>
  );
};
