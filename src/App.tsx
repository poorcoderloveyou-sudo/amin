/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { FullDbState } from './types';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import UsersView from './components/UsersView';
import ShopsView from './components/ShopsView';
import BookingsView from './components/BookingsView';
import ServicesView from './components/ServicesView';
import PaymentsView from './components/PaymentsView';
import ReviewsView from './components/ReviewsView';
import VehiclesView from './components/VehiclesView';
import NotificationsView from './components/NotificationsView';
import SqlConsole from './components/SqlConsole';
import CodeExporter from './components/CodeExporter';
import { RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function App() {
  const [db, setDb] = useState<FullDbState | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [notifToast, setNotifToast] = useState<string | null>(null);

  // Fetch full system DB state on mount
  const fetchDbState = async () => {
    try {
      const resp = await fetch('/api/data');
      if (resp.ok) {
        const data = await resp.json();
        setDb(data);
      } else {
        setErrorAlert('Database connection is inactive. Confirm your Express backend.');
      }
    } catch (err) {
      setErrorAlert('Database failed to synchronize. Node.js backend offline.');
    }
  };

  useEffect(() => {
    fetchDbState();
  }, []);

  const handleAction = async (endpoint: string, payload?: any) => {
    try {
      const resp = await fetch(`/api/action/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload || {})
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.success) {
          setDb(data.db || databaseFallbackReset());
          triggerToast('Action executed. Relational SQL trace updated in terminal.');
        } else {
          triggerToast(`Execution error: ${data.error || 'Check server permissions'}`);
        }
      } else {
        triggerToast('Failed to connect to gateway endpoint.');
      }
    } catch (err) {
      triggerToast('Gateway request failure.');
    }
  };

  const triggerToast = (msg: string) => {
    setNotifToast(msg);
    setTimeout(() => setNotifToast(null), 3500);
  };

  // Helper trigger reset database State
  const onResetDb = async () => {
    if (window.confirm("DATABASE SCRATCH CONFIRMATION: Are you sure you want to run the initialization seeds, truncating all current entries?")) {
      await handleAction('reset');
    }
  };

  const databaseFallbackReset = () => {
    fetchDbState();
    return db;
  };

  if (!db) {
    return (
      <div className="h-full bg-slate-950 flex flex-col items-center justify-center text-slate-100 font-sans min-h-screen p-4">
        <div className="text-center space-y-4">
          <div className="relative flex h-10 w-10 mx-auto">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-10 w-10 bg-emerald-500"></span>
          </div>
          <div>
            <h2 className="text-sm font-mono text-emerald-400 font-bold uppercase tracking-wider">synchronizing server cores</h2>
            <p className="text-xs text-slate-500 mt-2 font-mono">Connecting with local database autocare_db...</p>
          </div>
        </div>
      </div>
    );
  }

  const pendingShopsCount = db.shops.filter((s) => s.status === 'pending').length;

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900 flex">
      {/* 1. Sidebar Panel Column */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingShopsCount={pendingShopsCount}
      />

      {/* 2. Main Executive Content Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Dynamic global header navigation */}
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white shadow-sm sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-[13px] font-extrabold font-mono tracking-wider text-slate-800 uppercase">
              RDBMS WORKSPACE CONSOLE
            </h1>
            <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-mono font-medium">
              v1.0.4 PRO
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Database Status Indicator */}
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <p className="text-[10px] font-mono text-slate-500">
                ACTIVE SCHEMA: <b className="text-slate-800 select-all font-bold">mysql://autocare_db</b>
              </p>
            </div>

            {/* Simulated Database Reset row */}
            <button
              onClick={onResetDb}
              className="px-3.5 py-1.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 hover:border-rose-300 rounded-lg text-[10px] font-mono font-bold text-slate-600 flex items-center gap-1.5 transition-all cursor-pointer select-none"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">RESET SEEDS</span>
            </button>
          </div>
        </header>

        {/* Notif log toaster banner */}
        {notifToast && (
          <div className="bg-blue-50 border-b border-blue-200/50 px-8 py-2 text-[10px] font-mono text-blue-700 flex items-center gap-2 animate-fade-in shrink-0">
            <span className="h-1.5 w-1.5 bg-blue-550 rounded-full animate-ping shrink-0" />
            <span>{notifToast}</span>
          </div>
        )}

        {/* Global connection error warning */}
        {errorAlert && (
          <div className="bg-red-50 border-b border-red-200 px-8 py-3 text-[11px] font-mono text-red-700 flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-650 animate-bounce" />
            <span>{errorAlert}</span>
          </div>
        )}

        {/* Primary View Workspace */}
        <main className="p-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto pb-16">
          {activeTab === 'dashboard' && (
            <DashboardView
              db={db}
              onAction={handleAction}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'users' && (
            <UsersView
              db={db}
              onAction={handleAction}
            />
          )}

          {activeTab === 'shops' && (
            <ShopsView
              db={db}
              onAction={handleAction}
            />
          )}

          {activeTab === 'bookings' && (
            <BookingsView
              db={db}
              onAction={handleAction}
            />
          )}

          {activeTab === 'services' && (
            <ServicesView
              db={db}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView
              db={db}
            />
          )}

          {activeTab === 'reviews' && (
            <ReviewsView
              db={db}
              onAction={handleAction}
            />
          )}

          {activeTab === 'vehicles' && (
            <VehiclesView
              db={db}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsView
              db={db}
              onAction={handleAction}
            />
          )}

          {activeTab === 'sql' && (
            <SqlConsole
              sqlLogs={db.sqlLogs}
              onAction={handleAction}
            />
          )}

          {activeTab === 'exporter' && (
            <CodeExporter />
          )}
        </main>
      </div>
    </div>
  );
}
