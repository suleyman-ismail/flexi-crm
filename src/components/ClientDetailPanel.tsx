import React, { useState, useEffect } from 'react';
import {
  Phone,
  MapPin,
  Navigation,
  Building2,
  UserCheck,
  Calendar,
  CheckSquare,
  Square,
  Plus,
  Sparkles,
  FileText,
  Wallet,
  Hammer,
  SlidersHorizontal,
  ExternalLink,
  CheckCircle2,
  Clock,
  LocateFixed,
} from 'lucide-react';
import { useCrmStore } from '../store/useCrmStore';
import {
  AvatarBadge,
  StageBadge,
  SkeletonDetail,
  formatEur,
  formatBgDate,
} from './ui/ThemeAndPrimitives';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { WebpPhotoUploader } from './WebpPhotoUploader';
import { gasApiCall } from '../api/client';
import { buildStandardChecklist } from '../api/mockData';
import { PadBlock, PadDocument } from '../types/crm';

interface ClientDetailPanelProps {
  clientName: string | null;
}

export const ClientDetailPanel: React.FC<ClientDetailPanelProps> = ({ clientName }) => {
  const {
    appData,
    token,
    ws,
    clientCardsCache,
    loadingCardName,
    moveClientStageOptimistic,
    completeTaskOptimistic,
    updateClientCoordinatesOptimistic,
    setNewModalOpen,
    addToast,
  } = useCrmStore();

  const [subTab, setSubTab] = useState<'overview' | 'media' | 'checklist'>('overview');
  const [padBlocks, setPadBlocks] = useState<PadBlock[]>([]);
  const [loadingPad, setLoadingPad] = useState(false);
  const [gpsInput, setGpsInput] = useState('');
  const [showGpsEditor, setShowGpsEditor] = useState(false);

  const summary = appData?.clients.find((c) => c.n === clientName) || null;
  const card = clientName ? clientCardsCache[clientName.toLowerCase()] : null;

  useEffect(() => {
    if (!clientName || !token) return;
    let active = true;
    setLoadingPad(true);
    gasApiCall<PadDocument>('padGet', [`c:${clientName}`], { token, ws })
      .then((doc) => {
        if (!active) return;
        setPadBlocks(doc?.blocks || []);
        setLoadingPad(false);
      })
      .catch(() => {
        if (active) setLoadingPad(false);
      });
    return () => {
      active = false;
    };
  }, [clientName, token, ws]);

  if (!clientName || !summary) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-[var(--text-muted)]">
        <Building2 className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm font-semibold text-[var(--text-secondary)]">
          Изберете клиент или обект от списъка
        </p>
        <p className="text-xs mt-1 max-w-xs">
          Тук ще видите финансов баланс, Преди/След сравнение, WebP снимки и 6-етапен строителен
          чеклист.
        </p>
      </div>
    );
  }

  if (loadingCardName === clientName && !card) {
    return <SkeletonDetail />;
  }

  const dealAmt = card?.costs?.deal ?? summary.x?.deal ?? summary.b ?? 0;
  const gotAmt = card?.costs?.got ?? summary.x?.got ?? 0;
  const costAmt = card?.costs?.cost ?? summary.x?.cost ?? 0;
  const owedAmt = card?.costs?.owed ?? summary.x?.owed ?? 0;
  const profitAmt = gotAmt - costAmt;

  const clientTasks = (appData?.tasks || []).filter((t) => t.client === clientName);
  const stages = appData?.stages || [
    'Ново запитване',
    'Проведена среща',
    'Изпратена оферта',
    'Преговори',
    'Сключен договор',
    'Загубен',
  ];

  const handleToggleCheckItem = async (blockId: string, itemIdx: number) => {
    const nextBlocks = padBlocks.map((b) => {
      if (b.id !== blockId || !b.items) return b;
      const items = b.items.map((it, idx) => (idx === itemIdx ? { ...it, d: !it.d } : it));
      return { ...b, items, u: Date.now() };
    });
    setPadBlocks(nextBlocks);
    await gasApiCall('padSave', [`c:${clientName}`, { v: 1, u: Date.now(), blocks: nextBlocks }], {
      token,
      ws,
    });
  };

  const handleGenerateStandardChecklist = async () => {
    const generated = buildStandardChecklist(summary.m || 'Стандарт');
    const merged = [...generated, ...padBlocks.filter((b) => b.t !== 'check')];
    setPadBlocks(merged);
    await gasApiCall('padSave', [`c:${clientName}`, { v: 1, u: Date.now(), blocks: merged }], {
      token,
      ws,
    });
    addToast({
      title: '6-етапен чеклист е генериран',
      description: `Шаблон за модел: ${summary.m || 'Flexi Home'}`,
      variant: 'success',
    });
  };

  const handleSaveGps = async () => {
    const m = gpsInput.match(/(-?\d+\.\d+)\s*[,;\s]\s*(-?\d+\.\d+)/);
    if (!m) {
      addToast({
        title: 'Невалидни координати',
        description: 'Формат: 42.6977, 23.3219 или линк с координати',
        variant: 'warning',
      });
      return;
    }
    await updateClientCoordinatesOptimistic(clientName, parseFloat(m[1]), parseFloat(m[2]));
    setShowGpsEditor(false);
    setGpsInput('');
  };

  const checkBlocks = padBlocks.filter((b) => b.t === 'check');
  const totalCheckItems = checkBlocks.reduce((acc, b) => acc + (b.items?.length || 0), 0);
  const doneCheckItems = checkBlocks.reduce(
    (acc, b) => acc + (b.items?.filter((i) => i.d).length || 0),
    0
  );
  const checkProgressPct =
    totalCheckItems > 0 ? Math.round((doneCheckItems / totalCheckItems) * 100) : 0;

  return (
    <div className="h-full flex flex-col bg-[var(--surface-card)]">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <AvatarBadge name={summary.n} size="lg" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] truncate">
                  {summary.n}
                </h2>
                {summary.x && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                    <Hammer className="w-3 h-3" />
                    Активен обект
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-secondary)] mt-1">
                {summary.c && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    {summary.c}
                  </span>
                )}
                {summary.m && (
                  <span className="inline-flex items-center gap-1 font-medium text-[var(--accent-primary)] tabular-nums">
                    <Building2 className="w-3.5 h-3.5" />
                    {summary.m}
                  </span>
                )}
                {summary.r && (
                  <span className="inline-flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    {summary.r}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Call & Maps */}
          <div className="flex items-center gap-1.5 shrink-0">
            {summary.p && (
              <a
                href={`tel:${summary.p}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 text-xs font-semibold hover:bg-emerald-500/20 transition"
                title={summary.p}
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline tabular-nums">{summary.p}</span>
              </a>
            )}
            {(card?.maps || summary.maps || summary.c) && (
              <a
                href={
                  card?.maps ||
                  summary.maps ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    summary.c + ' Bulgaria'
                  )}`
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                title="Навигация Google Maps"
              >
                <Navigation className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span className="hidden xl:inline">Карта</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => setShowGpsEditor((v) => !v)}
              className="p-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition"
              title="Задай точен GPS Пин"
            >
              <LocateFixed className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* GPS Pin Quick Editor */}
        {showGpsEditor && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
            <MapPin className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
            <input
              type="text"
              value={gpsInput}
              onChange={(e) => setGpsInput(e.target.value)}
              placeholder="GPS коорд. (напр. 42.6541, 23.3194)"
              className="flex-1 bg-transparent text-xs text-[var(--text-primary)] outline-none tabular-nums"
            />
            <button
              type="button"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    updateClientCoordinatesOptimistic(
                      clientName,
                      pos.coords.latitude,
                      pos.coords.longitude
                    );
                    setShowGpsEditor(false);
                  });
                }
              }}
              className="px-2 py-1 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Моята локация
            </button>
            <button
              type="button"
              onClick={handleSaveGps}
              className="px-2.5 py-1 rounded-lg bg-[var(--accent-primary)] text-white text-[11px] font-semibold"
            >
              Запази
            </button>
          </div>
        )}

        {/* Stage Selector Bar */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-[var(--text-muted)]">Етап:</span>
            <StageBadge stage={summary.s} />
          </div>
          <select
            value={summary.s}
            onChange={(e) => moveClientStageOptimistic(summary.n, e.target.value)}
            className="text-xs font-semibold rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2.5 py-1.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] cursor-pointer"
          >
            {stages.map((st) => (
              <option key={st} value={st}>
                Премести в: {st}
              </option>
            ))}
          </select>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => setSubTab('overview')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
              subTab === 'overview'
                ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-2xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Финанси & Задачи</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('media')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
              subTab === 'media'
                ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-2xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Преди/След & WebP</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('checklist')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
              subTab === 'checklist'
                ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-2xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span className="tabular-nums">Чеклист ({checkProgressPct}%)</span>
          </button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
        {subTab === 'overview' && (
          <>
            {/* Financial KPI Grid (tabular-nums) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/50">
                <div className="text-[11px] font-medium text-[var(--text-muted)]">
                  Договор / Оферта
                </div>
                <div className="text-base font-bold text-[var(--text-primary)] tabular-nums mt-0.5">
                  {formatEur(dealAmt)}
                </div>
              </div>
              <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-emerald-500/5">
                <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  Платено от клиент
                </div>
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                  {formatEur(gotAmt)}
                </div>
              </div>
              <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/50">
                <div className="text-[11px] font-medium text-[var(--text-muted)]">Разходи обект</div>
                <div className="text-base font-bold text-[var(--text-primary)] tabular-nums mt-0.5">
                  {formatEur(costAmt)}
                </div>
              </div>
              <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/50">
                <div className="text-[11px] font-medium text-[var(--text-muted)]">
                  Текущ баланс / Дълг
                </div>
                <div
                  className={`text-base font-bold tabular-nums mt-0.5 ${
                    owedAmt > 0
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {owedAmt > 0 ? `Дълг ${formatEur(owedAmt)}` : formatEur(profitAmt)}
                </div>
              </div>
            </div>

            {/* Assigned Brigade / Workers */}
            {summary.x?.w && summary.x.w.length > 0 && (
              <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Hammer className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                    Разпределени майстори и бригади на обекта
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] tabular-nums">
                    Старт: {formatBgDate(summary.x.s0)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {summary.x.w.map((wName) => (
                    <span
                      key={wName}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)]"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {wName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes & Specifications */}
            {card?.notes && (
              <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/30 space-y-1.5">
                <div className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  Бележки и спецификация по проекта
                </div>
                <p className="text-xs text-[var(--text-primary)] leading-relaxed whitespace-pre-line">
                  {card.notes}
                </p>
              </div>
            )}

            {/* Active Tasks for this Client */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Активни задачи ({clientTasks.length})
                </span>
                <button
                  type="button"
                  onClick={() => setNewModalOpen('task')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-primary)] hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Нова задача
                </button>
              </div>

              {clientTasks.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-[var(--border-subtle)] text-center text-xs text-[var(--text-muted)]">
                  Няма предстоящи задачи за {summary.n}.
                </div>
              ) : (
                <div className="space-y-2">
                  {clientTasks.map((task) => (
                    <div
                      key={task.id || task.row}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/40 hover:bg-[var(--surface-hover)] transition"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => completeTaskOptimistic(task)}
                          className="mt-0.5 text-[var(--text-muted)] hover:text-emerald-500 transition"
                          title="Отбележи като завършена"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-[var(--text-primary)]">
                            {task.type}
                          </div>
                          {task.desc && (
                            <div className="text-xs text-[var(--text-secondary)] truncate">
                              {task.desc}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-muted)] shrink-0 tabular-nums">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatBgDate(task.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {subTab === 'media' && (
          <div className="space-y-5">
            <BeforeAfterSlider photos={card?.photos} clientName={summary.n} />
            <WebpPhotoUploader clientName={summary.n} photos={card?.photos || []} />
          </div>
        )}

        {subTab === 'checklist' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/50">
              <div>
                <div className="text-xs font-bold text-[var(--text-primary)]">
                  Строителен контролен лист по етапи
                </div>
                <div className="text-[11px] text-[var(--text-muted)] tabular-nums">
                  Изпълнени {doneCheckItems} от {totalCheckItems} контролни точки ({checkProgressPct}
                  %)
                </div>
              </div>
              <button
                type="button"
                onClick={handleGenerateStandardChecklist}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-semibold hover:opacity-95 transition shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Зареди 6-етапен шаблон</span>
              </button>
            </div>

            {loadingPad ? (
              <div className="space-y-2">
                <div className="h-24 rounded-xl shimmer" />
                <div className="h-24 rounded-xl shimmer" />
              </div>
            ) : checkBlocks.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-[var(--border-subtle)] text-center space-y-2">
                <CheckSquare className="w-8 h-8 mx-auto text-[var(--text-muted)] opacity-50" />
                <div className="text-xs font-semibold text-[var(--text-secondary)]">
                  Все още няма генериран етапен чеклист за този обект
                </div>
                <p className="text-[11px] text-[var(--text-muted)] max-w-xs mx-auto">
                  Натиснете бутона „Зареди 6-етапен шаблон“, за да създадете стандартен протокол за{' '}
                  {summary.m || 'избрания модел'}.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {checkBlocks.map((block) => {
                  const total = block.items?.length || 0;
                  const done = block.items?.filter((i) => i.d).length || 0;
                  return (
                    <div
                      key={block.id}
                      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/30 overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)]/70">
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {block.title}
                        </span>
                        <span className="text-[11px] font-semibold text-[var(--accent-primary)] tabular-nums">
                          {done}/{total}
                        </span>
                      </div>
                      <div className="divide-y divide-[var(--border-subtle)]">
                        {(block.items || []).map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleToggleCheckItem(block.id, idx)}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left hover:bg-[var(--surface-hover)] transition"
                          >
                            {item.d ? (
                              <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                            )}
                            <span
                              className={`text-xs ${
                                item.d
                                  ? 'line-through text-[var(--text-muted)]'
                                  : 'text-[var(--text-primary)]'
                              }`}
                            >
                              {item.x}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
