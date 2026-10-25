import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  PiggyBank,
  HardHat,
  BarChart3,
} from 'lucide-react';
import { useCrmStore } from '../store/useCrmStore';
import { formatEur } from './ui/ThemeAndPrimitives';
import { MONTHLY_FINANCE_SERIES } from '../api/mockData';

export const ReportsView: React.FC = () => {
  const { appData } = useCrmStore();

  const clients = appData?.clients || [];
  const sites = clients.filter((c) => c.x);

  const totalPipeline = clients.reduce((s, c) => s + (Number(c.b) || 0), 0);
  const totalContracted = sites.reduce((s, c) => s + (c.x?.deal || c.b || 0), 0);
  const totalCollected = sites.reduce((s, c) => s + (c.x?.got || 0), 0);
  const totalCosts = sites.reduce((s, c) => s + (c.x?.cost || 0), 0);
  const totalOwedWorkers = sites.reduce((s, c) => s + (c.x?.owed || 0), 0);
  const netCashflow = totalCollected - totalCosts;

  // Conversion Funnel Data
  const stages = appData?.stages || [
    'Ново запитване',
    'Проведена среща',
    'Изпратена оферта',
    'Преговори',
    'Сключен договор',
  ];
  const funnelStages = stages.filter((st) => st !== 'Загубен');
  const maxStageCount = Math.max(
    1,
    ...funnelStages.map((st) => clients.filter((c) => c.s === st).length)
  );

  // Per-site Cashflow bar chart data
  const siteCashflowData = sites.map((s) => ({
    name: s.n.split(' ')[0],
    Договор: s.x?.deal || s.b || 0,
    Събрани: s.x?.got || 0,
    Разходи: s.x?.cost || 0,
  }));

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Executive Financial KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              Активни договори (Обекти)
            </span>
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent-primary)] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)] tabular-nums mt-2">
            {formatEur(totalContracted)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 tabular-nums">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Портфейл оферти: {formatEur(totalPipeline)}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              Реално постъпили суми
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/12 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums mt-2">
            {formatEur(totalCollected)}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1 tabular-nums">
            Очаквани вземания: {formatEur(Math.max(0, totalContracted - totalCollected))}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              Разходи & Материали
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/12 text-amber-500 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)] tabular-nums mt-2">
            {formatEur(totalCosts)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 tabular-nums">
            <HardHat className="w-3.5 h-3.5" />
            <span>Дължими към майстори: {formatEur(totalOwedWorkers)}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              Нетен паричен поток
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/12 text-sky-500 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[var(--accent-primary)] tabular-nums mt-2">
            {formatEur(netCashflow)}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1 tabular-nums">
            Марж: {totalCollected > 0 ? Math.round((netCashflow / totalCollected) * 100) : 0}% от
            постъпленията
          </div>
        </div>
      </div>

      {/* Charts Grid (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 6-Month Revenue vs Expense Trend */}
        <div className="lg:col-span-7 p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>Тренд на приходи, разходи и нетна печалба (6 месеца)</span>
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Месечна динамика на касовите потоци в евро (€)
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_FINANCE_SERIES} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis
                  tickFormatter={(v) => `€${Math.round(v / 1000)}k`}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <Tooltip
                  formatter={(value: unknown) => [formatEur(Number(value)), '']}
                  contentStyle={{
                    backgroundColor: 'var(--surface-card)',
                    borderColor: 'var(--border-strong)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Приходи"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Разходи"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#expGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Conversion Funnel */}
        <div className="lg:col-span-5 p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>Фуния на продажбите и конверсия</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Разпределение на клиентите и стойност по търговски етапи
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {funnelStages.map((stage, idx) => {
              const stageClients = clients.filter((c) => c.s === stage);
              const count = stageClients.length;
              const sumEur = stageClients.reduce((acc, c) => acc + (Number(c.b) || 0), 0);
              const widthPct = Math.max(18, Math.round((count / maxStageCount) * 100));

              return (
                <div key={stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--text-primary)]">
                      {idx + 1}. {stage}
                    </span>
                    <div className="flex items-center gap-2 tabular-nums">
                      <span className="px-2 py-0.5 rounded-md bg-[var(--surface-elevated)] text-[var(--text-secondary)] font-bold">
                        {count} кл.
                      </span>
                      <span className="font-extrabold text-[var(--accent-primary)]">
                        {formatEur(sumEur)}
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[var(--surface-elevated)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-emerald-400 transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Per-Site Cashflow BarChart */}
      <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>Финансово изпълнение по активни строителни обекти</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Сравнение между договорена сума, платени вноски и извършени разходи по обект
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={siteCashflowData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis
                tickFormatter={(v) => `€${Math.round(v / 1000)}k`}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
              />
              <Tooltip
                formatter={(value: unknown) => [formatEur(Number(value)), '']}
                contentStyle={{
                  backgroundColor: 'var(--surface-card)',
                  borderColor: 'var(--border-strong)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="Договор" fill="#0d9488" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Събрани" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Разходи" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
