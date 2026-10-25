import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  CalendarDays,
  Phone,
  MapPin,
  Plus,
  Search,
  Hammer,
  Briefcase,
  ArrowRight,
  CalendarPlus,
} from 'lucide-react';
import { useCrmStore } from '../store/useCrmStore';
import { TaskItem } from '../types/crm';
import { AvatarBadge, SkeletonList, formatBgDate } from './ui/ThemeAndPrimitives';

const SwipeableTaskCard: React.FC<{
  task: TaskItem;
  today: string;
  isSite: boolean;
  onComplete: (t: TaskItem) => void;
  onSnooze: (t: TaskItem, days: number) => void;
  onOpenClient: (name: string) => void;
}> = ({ task, today, isSite, onComplete, onSnooze, onOpenClient }) => {
  const [dragX, setDragX] = useState(0);
  const [startX, setStartX] = useState<number | null>(null);

  const isOverdue = task.date < today;
  const isToday = task.date === today;

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) return;
    setStartX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 6) {
      setDragX(Math.max(-130, Math.min(130, dx)));
    }
  };

  const handlePointerEnd = () => {
    if (dragX > 80) {
      onComplete(task);
    } else if (dragX < -80) {
      onSnooze(task, 1);
    }
    setDragX(0);
    setStartX(null);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden select-none">
      {/* Swipe Background Indicators */}
      <div className="absolute inset-0 flex items-center justify-between px-5 text-xs font-bold uppercase tracking-wider pointer-events-none">
        <div
          className={`flex items-center gap-2 text-emerald-600 dark:text-emerald-400 transition-opacity ${
            dragX > 20 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Завърши веднага</span>
        </div>
        <div
          className={`flex items-center gap-2 text-amber-600 dark:text-amber-400 transition-opacity ${
            dragX < -20 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span>Отложи +1 ден</span>
          <CalendarPlus className="w-5 h-5" />
        </div>
      </div>

      {/* Foreground Card */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        style={{
          transform: `translateX(${dragX}px)`,
          transition: startX === null ? 'transform 0.2s ease-out' : 'none',
        }}
        className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border bg-[var(--surface-card)] hover:border-[var(--border-strong)] transition shadow-2xs ${
          isOverdue
            ? 'border-l-4 border-l-rose-500 border-[var(--border-subtle)]'
            : isToday
            ? 'border-l-4 border-l-[var(--accent-primary)] border-[var(--border-subtle)]'
            : 'border-[var(--border-subtle)]'
        }`}
      >
        <div className="flex items-start gap-3.5 min-w-0">
          <button
            type="button"
            onClick={() => onComplete(task)}
            className="mt-0.5 w-6 h-6 rounded-lg border-2 border-[var(--border-strong)] hover:border-emerald-500 hover:bg-emerald-500/15 flex items-center justify-center text-transparent hover:text-emerald-500 transition shrink-0 cursor-pointer"
            title="Отбележи като завършена"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>

          <AvatarBadge name={task.client} size="md" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenClient(task.client)}
                className="text-sm font-bold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition truncate cursor-pointer"
              >
                {task.client}
              </button>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                {task.type}
              </span>
              {isSite && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
                  <Hammer className="w-3 h-3" />
                  Обект
                </span>
              )}
            </div>

            {task.desc && (
              <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{task.desc}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--text-muted)] mt-2">
              <span
                className={`inline-flex items-center gap-1 font-semibold tabular-nums ${
                  isOverdue
                    ? 'text-rose-600 dark:text-rose-400'
                    : isToday
                    ? 'text-[var(--accent-primary)]'
                    : ''
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {isOverdue
                  ? `Закъсняла · ${formatBgDate(task.date)}`
                  : isToday
                  ? `Днес${task.time ? ` · ${task.time}` : ''}`
                  : `${formatBgDate(task.date)}${task.time ? ` · ${task.time}` : ''}`}
              </span>
              {task.city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {task.city}
                </span>
              )}
              {task.rep && <span>Отг: {task.rep}</span>}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)]">
          {task.phone && (
            <a
              href={`tel:${task.phone}`}
              className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition"
              title={`Обади се: ${task.phone}`}
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
          <button
            type="button"
            onClick={() => onSnooze(task, 1)}
            className="px-2.5 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer tabular-nums"
            title="Отложи с 1 ден"
          >
            +1д
          </button>
          <button
            type="button"
            onClick={() => onSnooze(task, 3)}
            className="px-2.5 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer tabular-nums"
            title="Отложи с 3 дни"
          >
            +3д
          </button>
          <button
            type="button"
            onClick={() => onOpenClient(task.client)}
            className="p-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition cursor-pointer"
            title="Отвори детайли за клиента"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const TasksView: React.FC = () => {
  const {
    appData,
    isLoadingApp,
    scopeFilter,
    completeTaskOptimistic,
    snoozeTaskOptimistic,
    selectClient,
    setActiveTab,
    setNewModalOpen,
  } = useCrmStore();

  const [category, setCategory] = useState<'all' | 'sales' | 'sites'>('all');
  const [bucketFilter, setBucketFilter] = useState<'all' | 'overdue' | 'today' | 'upcoming'>('all');
  const [search, setSearch] = useState('');

  if (isLoadingApp && !appData) {
    return <SkeletonList rows={6} />;
  }

  const today = appData?.today || new Date().toISOString().slice(0, 10);
  const me = appData?.me || '';
  const clientsByName = new Map((appData?.clients || []).map((c) => [c.n.toLowerCase(), c]));

  const allTasks = (appData?.tasks || []).filter((t) => {
    if (scopeFilter === 'mine' && me && t.rep && t.rep.toLowerCase() !== me.toLowerCase()) {
      return false;
    }
    const cl = clientsByName.get(t.client.toLowerCase());
    const isSite = !!cl?.x;
    if (category === 'sales' && isSite) return false;
    if (category === 'sites' && !isSite) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const hay = `${t.client} ${t.type} ${t.desc} ${t.city || ''} ${t.rep || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const overdueTasks = allTasks.filter((t) => t.date < today);
  const todayTasks = allTasks.filter((t) => t.date === today);
  const upcomingTasks = allTasks.filter((t) => t.date > today);

  const visibleTasks =
    bucketFilter === 'overdue'
      ? overdueTasks
      : bucketFilter === 'today'
      ? todayTasks
      : bucketFilter === 'upcoming'
      ? upcomingTasks
      : [...overdueTasks, ...todayTasks, ...upcomingTasks];

  const handleOpenClient = (name: string) => {
    const isMobile = window.innerWidth < 1024;
    selectClient(name, isMobile);
    if (!isMobile) {
      setActiveTab('clients');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
      {/* KPI Bucket Cards */}
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setBucketFilter(bucketFilter === 'overdue' ? 'all' : 'overdue')}
          className={`flex items-center justify-between p-4 rounded-2xl border text-left transition cursor-pointer ${
            bucketFilter === 'overdue'
              ? 'border-rose-500 bg-rose-500/10'
              : 'border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-rose-500/40'
          }`}
        >
          <div>
            <div className="text-xs font-semibold text-rose-600 dark:text-rose-400">Закъснели</div>
            <div className="text-2xl font-extrabold text-[var(--text-primary)] tabular-nums mt-1">
              {overdueTasks.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/12 text-rose-500 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setBucketFilter(bucketFilter === 'today' ? 'all' : 'today')}
          className={`flex items-center justify-between p-4 rounded-2xl border text-left transition cursor-pointer ${
            bucketFilter === 'today'
              ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)]'
              : 'border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-[var(--accent-primary)]/40'
          }`}
        >
          <div>
            <div className="text-xs font-semibold text-[var(--accent-primary)]">За днес</div>
            <div className="text-2xl font-extrabold text-[var(--text-primary)] tabular-nums mt-1">
              {todayTasks.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent-primary)] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setBucketFilter(bucketFilter === 'upcoming' ? 'all' : 'upcoming')}
          className={`flex items-center justify-between p-4 rounded-2xl border text-left transition cursor-pointer ${
            bucketFilter === 'upcoming'
              ? 'border-sky-500 bg-sky-500/10'
              : 'border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-sky-500/40'
          }`}
        >
          <div>
            <div className="text-xs font-semibold text-sky-600 dark:text-sky-400">Предстоящи</div>
            <div className="text-2xl font-extrabold text-[var(--text-primary)] tabular-nums mt-1">
              {upcomingTasks.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/12 text-sky-500 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => setCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              category === 'all'
                ? 'bg-[var(--accent-primary)] text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Всички ({allTasks.length})
          </button>
          <button
            type="button"
            onClick={() => setCategory('sales')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              category === 'sales'
                ? 'bg-[var(--accent-primary)] text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Продажби</span>
          </button>
          <button
            type="button"
            onClick={() => setCategory('sites')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              category === 'sites'
                ? 'bg-[var(--accent-primary)] text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Hammer className="w-3.5 h-3.5" />
            <span>По обекти</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-1 sm:flex-initial">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Филтрирай задачи..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
            />
          </div>
          <button
            type="button"
            onClick={() => setNewModalOpen('task')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-95 transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Нова задача</span>
          </button>
        </div>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="lg:hidden flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
        <span>Плъзни надясно за завършване</span>
        <span>Плъзни наляво за +1 ден</span>
      </div>

      {/* Task List */}
      {visibleTasks.length === 0 ? (
        <div className="p-12 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-80" />
          <div className="text-sm font-bold text-[var(--text-primary)]">
            Всички задачи в тази категория са изпълнени!
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Няма намерени задачи според избраните филтри.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visibleTasks.map((task) => {
            const cl = clientsByName.get(task.client.toLowerCase());
            return (
              <SwipeableTaskCard
                key={task.id || task.row}
                task={task}
                today={today}
                isSite={!!cl?.x}
                onComplete={completeTaskOptimistic}
                onSnooze={snoozeTaskOptimistic}
                onOpenClient={handleOpenClient}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
