import React, { useState } from 'react';
import {
  Search,
  Columns3,
  SplitSquareVertical,
  Plus,
  MapPin,
  Phone,
  Building2,
  GripVertical,
  Hammer,
  Filter,
} from 'lucide-react';
import { useCrmStore } from '../store/useCrmStore';
import { ClientSummary } from '../types/crm';
import {
  AvatarBadge,
  StageBadge,
  SkeletonList,
  formatEur,
  formatBgDate,
} from './ui/ThemeAndPrimitives';
import { ClientDetailPanel } from './ClientDetailPanel';

export const ClientsView: React.FC = () => {
  const {
    appData,
    isLoadingApp,
    scopeFilter,
    clientsViewMode,
    setClientsViewMode,
    selectedClientName,
    selectClient,
    moveClientStageOptimistic,
    setNewModalOpen,
  } = useCrmStore();

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [draggingClient, setDraggingClient] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  if (isLoadingApp && !appData) {
    return <SkeletonList rows={7} />;
  }

  const me = appData?.me || '';
  const stages = appData?.stages || [
    'Ново запитване',
    'Проведена среща',
    'Изпратена оферта',
    'Преговори',
    'Сключен договор',
    'Загубен',
  ];

  const allClients = appData?.clients || [];
  const cities = Array.from(new Set(allClients.map((c) => c.c).filter(Boolean))).sort();

  const filteredClients = allClients.filter((c) => {
    if (scopeFilter === 'mine' && me && c.r && c.r.toLowerCase() !== me.toLowerCase()) {
      return false;
    }
    if (stageFilter !== 'all' && c.s !== stageFilter) return false;
    if (cityFilter !== 'all' && c.c !== cityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const hay = `${c.n} ${c.p} ${c.c} ${c.m} ${c.r} ${c.s}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const totalPipelineValue = filteredClients.reduce((sum, c) => sum + (Number(c.b) || 0), 0);

  const handleSelectClient = (client: ClientSummary) => {
    const isMobile = window.innerWidth < 1024;
    selectClient(client.n, isMobile);
  };

  return (
    <div className="h-[calc(100dvh-3.75rem)] flex flex-col overflow-hidden">
      {/* Top Action & Filter Toolbar */}
      <div className="px-4 sm:px-6 py-3 border-b border-[var(--border-subtle)] bg-[var(--surface-card)] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Търси клиент, телефон, град, модел..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[var(--text-muted)] hidden sm:inline" />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-primary)] outline-none"
            >
              <option value="all">Всички етапи ({allClients.length})</option>
              {stages.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-primary)] outline-none"
            >
              <option value="all">Всички градове</option>
              {cities.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs">
            <span className="text-[var(--text-muted)]">Общ портфейл:</span>
            <span className="font-bold text-[var(--accent-primary)] tabular-nums">
              {formatEur(totalPipelineValue)}
            </span>
          </div>

          {/* View Mode Toggle: Split vs Kanban */}
          <div className="flex items-center p-0.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setClientsViewMode('split')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                clientsViewMode === 'split'
                  ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-2xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Списък + Детайли</span>
            </button>
            <button
              type="button"
              onClick={() => setClientsViewMode('kanban')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                clientsViewMode === 'kanban'
                  ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-2xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Канбан</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setNewModalOpen('client')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-95 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Нов клиент</span>
          </button>
        </div>
      </div>

      {/* MODE 1: MASTER-DETAIL SPLIT VIEW */}
      {clientsViewMode === 'split' ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Master List */}
          <div className="lg:col-span-5 xl:col-span-5 border-r border-[var(--border-subtle)] overflow-y-auto divide-y divide-[var(--border-subtle)] bg-[var(--bg-canvas)]">
            {filteredClients.length === 0 ? (
              <div className="p-10 text-center text-xs text-[var(--text-muted)]">
                Няма намерени клиенти по зададените критерии.
              </div>
            ) : (
              filteredClients.map((client) => {
                const isSelected = selectedClientName === client.n;
                return (
                  <div
                    key={client.n}
                    onClick={() => handleSelectClient(client)}
                    className={`p-3.5 sm:p-4 cursor-pointer transition flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-[var(--accent-subtle)]/70 border-l-4 border-l-[var(--accent-primary)]'
                        : 'bg-[var(--surface-card)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <AvatarBadge name={client.n} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[var(--text-primary)] truncate">
                            {client.n}
                          </span>
                          {client.x && (
                            <span title="Активен обект" className="shrink-0">
                              <Hammer className="w-3.5 h-3.5 text-emerald-500" />
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-[var(--text-secondary)] mt-0.5">
                          {client.c && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[var(--text-muted)]" />
                              {client.c}
                            </span>
                          )}
                          {client.m && (
                            <span className="inline-flex items-center gap-1 font-medium text-[var(--accent-primary)] tabular-nums">
                              <Building2 className="w-3 h-3" />
                              {client.m}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <StageBadge stage={client.s} size="sm" />
                          {client.r && (
                            <span className="text-[11px] text-[var(--text-muted)]">
                              · {client.r}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-extrabold text-[var(--text-primary)] tabular-nums">
                        {client.b ? formatEur(client.b) : '—'}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] tabular-nums mt-1">
                        {formatBgDate(client.l || client.i)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Detail Panel (Desktop) */}
          <div className="hidden lg:block lg:col-span-7 xl:col-span-7 overflow-hidden">
            <ClientDetailPanel clientName={selectedClientName} />
          </div>
        </div>
      ) : (
        /* MODE 2: INTERACTIVE KANBAN BOARD (Faz 3) */
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 bg-[var(--bg-canvas)]">
          <div className="flex h-full gap-3.5 min-w-max">
            {stages.map((stage) => {
              const stageClients = filteredClients.filter((c) => c.s === stage);
              const stageRevenue = stageClients.reduce((acc, c) => acc + (Number(c.b) || 0), 0);
              const isDropTarget = dragOverStage === stage;

              return (
                <div
                  key={stage}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverStage(stage);
                  }}
                  onDragLeave={() => setDragOverStage(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverStage(null);
                    const cName = e.dataTransfer.getData('text/plain') || draggingClient;
                    if (cName) {
                      moveClientStageOptimistic(cName, stage);
                    }
                    setDraggingClient(null);
                  }}
                  className={`w-76 flex flex-col rounded-2xl border transition-colors ${
                    isDropTarget
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)]/30'
                      : 'border-[var(--border-subtle)] bg-[var(--surface-elevated)]/60'
                  }`}
                >
                  {/* Column Header with Stage Revenue Badge (tabular-nums) */}
                  <div className="p-3 border-b border-[var(--border-subtle)] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <StageBadge stage={stage} />
                      <span className="px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] tabular-nums">
                        {stageClients.length}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] text-xs font-extrabold text-[var(--accent-primary)] tabular-nums">
                      {formatEur(stageRevenue)}
                    </span>
                  </div>

                  {/* Column Cards */}
                  <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                    {stageClients.map((client) => {
                      const isDragging = draggingClient === client.n;
                      return (
                        <div
                          key={client.n}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', client.n);
                            setDraggingClient(client.n);
                          }}
                          onDragEnd={() => {
                            setDraggingClient(null);
                            setDragOverStage(null);
                          }}
                          onClick={() => handleSelectClient(client)}
                          className={`group p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-[var(--accent-primary)]/50 cursor-grab active:cursor-grabbing transition-all select-none ${
                            isDragging ? 'kanban-dragging opacity-90' : 'shadow-2xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <AvatarBadge name={client.n} size="sm" />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                                  {client.n}
                                </div>
                                <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 truncate">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  <span>{client.c || '—'}</span>
                                </div>
                              </div>
                            </div>
                            <GripVertical className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                            <span className="font-medium text-[var(--text-secondary)] truncate max-w-[55%] tabular-nums">
                              {client.m || 'Стандарт'}
                            </span>
                            <span className="font-extrabold text-[var(--accent-primary)] tabular-nums">
                              {client.b ? formatEur(client.b) : '—'}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                            <span>Отг: {client.r || '—'}</span>
                            {client.p && (
                              <span className="inline-flex items-center gap-1 tabular-nums">
                                <Phone className="w-2.5 h-2.5" />
                                {client.p}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
