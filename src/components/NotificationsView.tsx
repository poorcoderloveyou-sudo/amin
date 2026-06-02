/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { FullDbState } from '../types';
import { Send, Bell, User, MessageSquare } from 'lucide-react';

interface NotificationsViewProps {
  db: FullDbState;
  onAction: (endpoint: string, payload?: any) => void;
}

export default function NotificationsView({ db, onAction }: NotificationsViewProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleBroadcast = (e: FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    onAction('add-notification', { title, message });
    setTitle('');
    setMessage('');
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">broadcast dispatch centers</span>
        <h2 className="text-sm font-bold tracking-tight text-slate-800">Administrative Alerts</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Broadcast Form */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm h-fit">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Dispatch Global Broadcast</h3>

          <form onSubmit={handleBroadcast} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Subject Header</label>
              <input
                type="text"
                required
                placeholder="e.g. Schedule Maintenance Interval"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Alert Details / Notes</label>
              <textarea
                required
                rows={4}
                placeholder="Compose administrative advisory context here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 placeholder-slate-400 leading-relaxed resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98] text-xs font-sans"
            >
              <Send className="w-3.5 h-3.5 text-white" />
              <span>Broadcast (INSERT)</span>
            </button>
          </form>
        </div>

        {/* Alert Logs List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">History Logs Registry</h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {db.notifications.length === 0 ? (
              <div className="text-center py-20 text-slate-400 font-mono">No logged alerts found.</div>
            ) : (
              db.notifications.slice().reverse().map((notif) => {
                const isGlobal = notif.user_id === null;
                const user = isGlobal ? null : db.users.find((u) => u.id === notif.user_id);

                return (
                  <div key={notif.id} className="p-3 bg-slate-50 border border-slate-100 rounded-md flex items-start gap-3 group hover:border-slate-200 transition-colors">
                    <span className={`p-1.5 rounded-md shrink-0 border ${isGlobal ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-blue-50 text-blue-800 border-blue-250 border-blue-200'}`}>
                      <Bell className="w-4 h-4" />
                    </span>

                    <div className="space-y-1 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 leading-none">{notif.title}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase border ${
                          isGlobal ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {isGlobal ? 'GLOBAL BROADCAST' : 'USER RECIPIENT'}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">{notif.message}</p>
                      
                      <div className="flex gap-4 items-center text-[10px] text-slate-400 font-mono pt-1">
                        <span>RefID: NOT-{notif.id}</span>
                        {user && <span>Target: <b className="text-slate-700">{user.name} (UID: {user.id})</b></span>}
                        <span>• {notif.created_at}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
