/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  BarChart3, 
  Users, 
  Store, 
  CalendarRange, 
  Layers, 
  CreditCard, 
  Star, 
  Car, 
  BellRing, 
  Terminal, 
  Download, 
  RotateCcw,
  UserCheck2
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingShopsCount: number;
}

export default function Sidebar({ activeTab, setActiveTab, pendingShopsCount }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Account Registry', icon: Users },
    { id: 'shops', label: 'Affiliated Shops', icon: Store, badge: pendingShopsCount > 0 ? pendingShopsCount : undefined },
    { id: 'bookings', label: 'Booking Scheduler', icon: CalendarRange },
    { id: 'services', label: 'Service Catalog', icon: Layers },
    { id: 'payments', label: 'Financial Logs', icon: CreditCard },
    { id: 'reviews', label: 'Client Feedback', icon: Star },
    { id: 'vehicles', label: 'Vehicles Database', icon: Car },
    { id: 'notifications', label: 'Broadcast Alerts', icon: BellRing },
    { id: 'sql', label: 'Live SQL Terminal', icon: Terminal },
    { id: 'exporter', label: 'PHP Code Exporter', icon: Download, highlight: true }
  ];

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Header Branding */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="bg-blue-600/15 border border-blue-500/30 p-1.5 rounded-lg">
            <UserCheck2 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <span className="text-white font-bold tracking-wider text-sm block">AUTOCARE ENGINE</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest leading-none block">System Control Controller</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-md text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 font-bold'
                    : item.highlight
                    ? 'text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 border border-amber-500/20'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-blue-400' : item.highlight ? 'text-amber-400' : 'text-slate-400'
                  }`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    isActive ? 'bg-blue-650/40 text-blue-400' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Operator User Badge */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold leading-none">
            A
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200">Admin Staff</p>
            <p className="text-[9px] font-mono text-slate-500 truncate max-w-[130px]">poorcoderloveyou@</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-[10px] text-blue-400 font-mono tracking-tighter">ONLINE</span>
        </div>
      </div>
    </aside>
  );
}
