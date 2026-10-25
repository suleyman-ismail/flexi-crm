import React, { useState } from 'react';
import { X, PlusCircle, UserPlus, CalendarClock } from 'lucide-react';
import { useCrmStore } from '../store/useCrmStore';

export const CreateModals: React.FC = () => {
  const {
    newModalOpen,
    setNewModalOpen,
    appData,
    selectedClientName,
    createTaskOptimistic,
    createClientOptimistic,
  } = useCrmStore();

  const today = appData?.today || new Date().toISOString().slice(0, 10);
  const me = appData?.me || 'Сюлейман';

  // Task State
  const [taskClient, setTaskClient] = useState(selectedClientName || '');
  const [taskType, setTaskType] = useState(appData?.types?.[0] || 'Обаждане');
  const [taskDate, setTaskDate] = useState(today);
  const [taskTime, setTaskTime] = useState('10:00');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskRep, setTaskRep] = useState(me);

  // Client State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCity, setClientCity] = useState('София');
  const [clientModel, setClientModel] = useState(appData?.models?.[0] || 'Модел 60m²');
  const [clientBudget, setClientBudget] = useState('45000');
  const [clientStage, setClientStage] = useState(appData?.stages?.[0] || 'Ново запитване');
  const [clientNotes, setClientNotes] = useState('');
  const [clientIsSite, setClientIsSite] = useState(false);

  if (!newModalOpen) return null;

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetClient = taskClient.trim() || selectedClientName || appData?.clients?.[0]?.n || 'Клиент';
    await createTaskOptimistic({
      client: targetClient,
      type: taskType,
      date: taskDate,
      time: taskTime,
      remind: '30',
      desc: taskDesc,
      rep: taskRep,
    });
    setTaskDesc('');
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;
    await createClientOptimistic({
      name: clientName.trim(),
      phone: clientPhone.trim(),
      city: clientCity.trim(),
      model: clientModel,
      budget: Number(clientBudget) || 0,
      src: appData?.sources?.[0] || 'Препоръка',
      stage: clientStage,
      rep: me,
      notes: clientNotes,
      site: clientIsSite,
    });
    setClientName('');
    setClientPhone('');
    setClientNotes('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setNewModalOpen(null);
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-card)] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)]/60">
          <div className="flex items-center gap-2">
            {newModalOpen === 'task' ? (
              <CalendarClock className="w-5 h-5 text-[var(--accent-primary)]" />
            ) : (
              <UserPlus className="w-5 h-5 text-[var(--accent-primary)]" />
            )}
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {newModalOpen === 'task' ? 'Нова задача' : 'Нов клиент / Обект'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setNewModalOpen(null)}
            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {newModalOpen === 'task' ? (
          <form onSubmit={handleTaskSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Клиент / Обект
              </label>
              <input
                type="text"
                list="crm-client-list"
                value={taskClient || selectedClientName || ''}
                onChange={(e) => setTaskClient(e.target.value)}
                placeholder="Изберете или въведете клиент..."
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
                required
              />
              <datalist id="crm-client-list">
                {(appData?.clients || []).map((c) => (
                  <option key={c.n} value={c.n} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Тип действие
                </label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none"
                >
                  {(appData?.types || ['Обаждане', 'Среща', 'Оглед', 'Оферта', 'Договор']).map(
                    (t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Отговорник
                </label>
                <select
                  value={taskRep}
                  onChange={(e) => setTaskRep(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none"
                >
                  {(appData?.reps || ['Сюлейман', 'Георги', 'Елена']).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Дата
                </label>
                <input
                  type="date"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none tabular-nums"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Час
                </label>
                <input
                  type="time"
                  value={taskTime}
                  onChange={(e) => setTaskTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Описание / Бележка
              </label>
              <textarea
                rows={3}
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="Детайли по задачата..."
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewModalOpen(null)}
                className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] text-xs font-semibold text-[var(--text-secondary)]"
              >
                Отказ
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Запази задачата</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleClientSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Име на клиент *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="напр. Николай Димитров"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Телефон
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+359 88..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Град / Локация
                </label>
                <input
                  type="text"
                  value={clientCity}
                  onChange={(e) => setClientCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Модел / Обхват
                </label>
                <select
                  value={clientModel}
                  onChange={(e) => setClientModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none"
                >
                  {(
                    appData?.models || [
                      'Модел 45m²',
                      'Модел 60m²',
                      'Модел 80m²',
                      'Модел 100m²',
                      'Модел 120m²',
                      'Индивидуален проект',
                    ]
                  ).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Оферта / Бюджет (€)
                </label>
                <input
                  type="number"
                  value={clientBudget}
                  onChange={(e) => setClientBudget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none tabular-nums"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--surface-elevated)]/60 border border-[var(--border-subtle)]">
              <span className="text-xs font-medium text-[var(--text-primary)]">
                Директно активирай като строителен обект (с 6-етапен чеклист)
              </span>
              <input
                type="checkbox"
                checked={clientIsSite}
                onChange={(e) => setClientIsSite(e.target.checked)}
                className="w-4 h-4 accent-[var(--accent-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Бележки
              </label>
              <textarea
                rows={2}
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                placeholder="Специфични изисквания за парцела или проекта..."
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewModalOpen(null)}
                className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] text-xs font-semibold text-[var(--text-secondary)]"
              >
                Отказ
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-95 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Създай клиент</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
