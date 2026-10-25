import React, { useEffect } from 'react';
import {
  CheckSquare,
  Hammer,
  Users,
  HardHat,
  BarChart3,
  MessageSquare,
  Search,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RefreshCw,
  Wifi,
  WifiOff,
  Building2,
  Wrench,
  LogOut,
  KeyRound,
  Bell,
} from 'lucide-react';
import { useCrmStore } from './store/useCrmStore';
import { NavTab } from './types/crm';
import { CommandPalette } from './components/CommandPalette';
import { TasksView } from './components/TasksView';
import { ClientsView } from './components/ClientsView';
import { SitesView } from './components/SitesView';
import { ReportsView } from './components/ReportsView';
import { WorkersView, MessagesView } from './components/WorkersAndMessagesView';
import { ClientDetailPanel } from './components/ClientDetailPanel';
import { CreateModals } from './components/CreateModals';
import { LoginScreen } from './components/LoginScreen';
import {
  ToastViewport,
  DraggableBottomSheet,
  AvatarBadge,
} from './components/ui/ThemeAndPrimitives';

export const App: React.FC = () => {
  const {
    token,
    ws,
    theme,
    activeTab,
    sidebarCollapsed,
    scopeFilter,
    appData,
    syncState,
    pendingMutations,
    lastLatencyMs,
    mobileSheetClient,
    initApp,
    loginDemoMode,
    logout,
    setWorkspace,
    toggleTheme,
    setActiveTab,
    toggleSidebar,
    setScopeFilter,
    closeMobileSheet,
    setCmdOpen,
    setNewModalOpen,
    refreshAppData,
  } = useCrmStore();

  useEffect(() => {
    initApp().then(() => {
      // If no token in storage on initial visit, load interactive enterprise demo mode automatically
      if (!useCrmStore.getState().token) {
        loginDemoMode();
      }
    });
  }, [initApp, loginDemoMode]);

  if (!token) {
    return (
      <>
        <LoginScreen />
        <ToastViewport />
      </>
    );
  }

  const tasksCount = appData?.tasks?.length || 0;
  const sitesCount = (appData?.clients || []).filter((c) => c.x).length;
  const clientsCount = appData?.clients?.length || 0;
  const workersCount = appData?.workers?.length || 0;

  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: number;
  }> = [
    { id: 'tasks', label: 'Задачи', icon: CheckSquare, badge: tasksCount },
    { id: 'sites', label: 'Обекти', icon: Hammer, badge: sitesCount },
    { id: 'clients', label: 'Продажби & Канбан', icon: Users, badge: clientsCount },
    { id: 'workers', label: 'Бригади & Партньори', icon: HardHat, badge: workersCount },
    { id: 'reports', label: 'Финанси & Отчети', icon: BarChart3 },
    { id: 'messages', label: 'Съобщения', icon: MessageSquare },
  ];

  return (
    <div className="min-h-dvh flex bg-[var(--bg-canvas)] text-[var(--text-primary)] selection:bg-[var(--accent-primary)] selection:text-white">
      {/* DESKTOP SIDEBAR (NAVIGATION RAIL - Faz 1) */}
      <aside
        className={`hidden lg:flex flex-col border-r border-[var(--border-subtle)] bg-[var(--surface-card)] transition-all duration-200 shrink-0 ${
          sidebarCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {/* Brand & Collapse Header */}
        <div className="h-15 px-3.5 border-b border-[var(--border-subtle)] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-primary)] text-white flex items-center justify-center shrink-0 shadow-xs">
              {ws === 'r' ? <Wrench className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="text-sm font-extrabold tracking-tight text-[var(--text-primary)] truncate">
                  {ws === 'r' ? 'CRM Ремонти' : 'Flexi Home CRM'}
                </div>
                <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Enterprise v5.0
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-pointer"
            title={sidebarCollapsed ? 'Разшири менюто' : 'Свий менюто'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Dual Workspace Switcher (Flexi Home vs Ремонти) */}
        <div className="p-2.5 border-b border-[var(--border-subtle)]">
          <div
            className={`grid ${
              sidebarCollapsed ? 'grid-cols-1 gap-1' : 'grid-cols-2 gap-1'
            } p-1 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]`}
          >
            <button
              type="button"
              onClick={() => setWorkspace('')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                ws === ''
                  ? 'bg-[var(--surface-card)] text-[var(--accent-primary)] shadow-2xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
              title="Работно място: Flexi Home (Сглобяеми къщи)"
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              {!sidebarCollapsed && <span className="truncate">Flexi Home</span>}
            </button>
            <button
              type="button"
              onClick={() => setWorkspace('r')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                ws === 'r'
                  ? 'bg-[var(--surface-card)] text-[var(--accent-primary)] shadow-2xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
              title="Работно място: Ремонти и Довършителни работи"
            >
              <Wrench className="w-3.5 h-3.5 shrink-0" />
              {!sidebarCollapsed && <span className="truncate">Ремонти</span>}
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-[var(--accent-subtle)] text-[var(--accent-primary)] font-bold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!sidebarCollapsed && item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${
                      isActive
                        ? 'bg-[var(--accent-primary)] text-white'
                        : 'bg-[var(--surface-elevated)] text-[var(--text-muted)]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Create Buttons */}
        <div className="p-2.5 border-t border-[var(--border-subtle)] space-y-1.5">
          <button
            type="button"
            onClick={() => setNewModalOpen('client')}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-95 transition cursor-pointer shadow-xs"
            title="Нов клиент или обект"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Нов клиент / Обект</span>}
          </button>
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <AvatarBadge name={appData?.me || 'Сюлейман'} size="sm" />
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                  {appData?.me || 'Сюлейман'}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] truncate">
                  {token === 'DEMO_TOKEN' ? 'Демо Сесия' : 'Администратор'}
                </div>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-rose-500 transition cursor-pointer"
              title="Изход / Смяна на PIN"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* TOPBAR (Faz 1 & Faz 2) */}
        <header className="h-15 px-4 sm:px-6 border-b border-[var(--border-subtle)] bg-[var(--surface-card)]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-3 shrink-0">
          {/* Left: Mobile Brand + Cmd+K Search Trigger */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-primary)] text-white flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="w-full flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-xs text-[var(--text-muted)] transition cursor-pointer"
            >
              <span className="flex items-center gap-2 truncate">
                <Search className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                <span className="truncate">Търси клиент, обект, задача или команда...</span>
              </span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[10px] font-bold text-[var(--text-secondary)] shrink-0">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Sync Pill, Scope Toggle, PIN Switcher, Theme */}
          <div className="flex items-center gap-2">
            {/* Offline / Sync Status Pill (Faz 2) */}
            <button
              type="button"
              onClick={() => refreshAppData()}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] font-semibold transition cursor-pointer ${
                syncState === 'offline'
                  ? 'bg-amber-500/12 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : syncState === 'syncing'
                  ? 'bg-sky-500/12 border-sky-500/30 text-sky-600 dark:text-sky-400'
                  : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-400'
              }`}
              title="Статус на синхронизация с Google Apps Script & IndexedDB"
            >
              {syncState === 'offline' ? (
                <WifiOff className="w-3.5 h-3.5" />
              ) : syncState === 'syncing' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Wifi className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {syncState === 'offline'
                  ? `Офлайн${pendingMutations ? ` (${pendingMutations})` : ''}`
                  : syncState === 'syncing'
                  ? 'Синхронизиране…'
                  : 'Синхронизирано'}
              </span>
              {lastLatencyMs && syncState === 'synced' && (
                <span className="hidden xl:inline text-[10px] opacity-75 tabular-nums">
                  · {lastLatencyMs}ms
                </span>
              )}
            </button>

            {/* Mine / All Scope Filter */}
            <div className="hidden md:flex items-center p-0.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs">
              <button
                type="button"
                onClick={() => setScopeFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  scopeFilter === 'all'
                    ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-2xs'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                Всички
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter('mine')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  scopeFilter === 'mine'
                    ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-2xs'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                Моите
              </button>
            </div>

            {token === 'DEMO_TOKEN' && (
              <button
                type="button"
                onClick={logout}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/25 text-xs font-bold hover:opacity-90 transition cursor-pointer"
                title="Влез с реален PIN код към Google Apps Script"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Вход с PIN</span>
              </button>
            )}

            {/* Notifications Bell */}
            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              className="relative p-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
              title="Известия и задачи за днес"
            >
              <Bell className="w-4 h-4" />
              {tasksCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
                  {tasksCount}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
              title={theme === 'dark' ? 'Светъл режим' : 'Тъмен режим'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* ACTIVE VIEWPORT */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'tasks' && <TasksView />}
          {activeTab === 'sites' && <SitesView />}
          {activeTab === 'clients' && <ClientsView />}
          {activeTab === 'workers' && <WorkersView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'messages' && <MessagesView />}
        </main>
      </div>

      {/* MOBILE FLOATING ACTION BUTTON (FAB - Faz 1) */}
      <button
        type="button"
        onClick={() => setNewModalOpen(activeTab === 'tasks' ? 'task' : 'client')}
        className="lg:hidden fixed right-4 bottom-20 z-30 w-13 h-13 rounded-2xl bg-[var(--accent-primary)] text-white shadow-xl flex items-center justify-center active:scale-95 transition"
        aria-label="Бързо добавяне"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* MOBILE ERGONOMIC BOTTOM NAVIGATION BAR (Faz 1) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-16 border-t border-[var(--border-subtle)] bg-[var(--surface-card)]/95 backdrop-blur-md grid grid-cols-5 px-1">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition ${
                isActive ? 'text-[var(--accent-primary)] font-bold' : 'text-[var(--text-muted)]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="truncate max-w-[64px]">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>

      {/* MOBILE DRAGGABLE BOTTOM SHEET FOR CLIENT / SITE DETAILS (Faz 1) */}
      <DraggableBottomSheet
        open={!!mobileSheetClient}
        onClose={closeMobileSheet}
        title={mobileSheetClient || 'Детайли за клиента'}
      >
        <ClientDetailPanel clientName={mobileSheetClient} />
      </DraggableBottomSheet>

      {/* GLOBAL MODALS, COMMAND PALETTE & UNDOABLE TOASTS */}
      <CommandPalette />
      <CreateModals />
      <ToastViewport />
    </div>
  );
};
export default App;
