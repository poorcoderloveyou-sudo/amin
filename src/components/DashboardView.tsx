/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FullDbState, DbShop } from '../types';
import { Store, Users, CalendarRange, DollarSign, ArrowUpRight, Clock, Star, MapPin } from 'lucide-react';

interface DashboardViewProps {
  db: FullDbState;
  onAction: (endpoint: string, payload?: any) => void;
  setActiveTab: (tab: string) => void;
}

export default function DashboardView({ db, onAction, setActiveTab }: DashboardViewProps) {
  const totalShops = db.shops.length;
  const totalUsers = db.users.length;
  const totalBookings = db.bookings.length;

  const totalRevenue = db.payments
    .filter((p) => p.payment_status === 'paid')
    .reduce((acc, p) => acc + p.amount, 0);

  const pendingShops = db.shops.filter((s) => s.status === 'pending');
  const recentBookings = db.bookings
    .slice()
    .reverse()
    .slice(0, 5)
    .map((b) => {
      const customer = db.users.find((u) => u.id === b.customer_id);
      const shop = db.shops.find((s) => s.id === b.shop_id);
      const service = db.services.find((s) => s.id === b.service_id);
      return {
        ...b,
        customerName: customer ? customer.name : 'Unknown Guest',
        shopName: shop ? shop.shop_name : 'Unknown Shop',
        serviceName: service ? service.service_name : 'Automotive Package'
      };
    });

  const recentReviews = db.reviews
    .slice()
    .reverse()
    .slice(0, 3)
    .map((r) => {
      const customer = db.users.find((u) => u.id === r.customer_id);
      const shop = db.shops.find((s) => s.id === r.shop_id);
      return {
        ...r,
        customerName: customer ? customer.name : 'Verified Customer',
        shopName: shop ? shop.shop_name : 'Auto Spa'
      };
    });

  // Calculate chart metrics for 7 day earnings simulation
  const sparklineData = [120, 240, 180, 390, 310, 480, 520];
  const maxSpark = Math.max(...sparklineData);
  const minSpark = Math.min(...sparklineData);

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Visual Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Store className="w-16 h-16 text-slate-900" />
          </div>
          <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">AFFILIATED STATIONS</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">{totalShops}</h3>
            <span className="text-[10px] text-slate-400 font-mono">registered</span>
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 text-[10px] text-slate-550">
            <span>Pending approval: <b className="text-amber-600">{pendingShops.length}</b></span>
            <button onClick={() => setActiveTab('shops')} className="hover:underline flex items-center gap-0.5 text-blue-600 font-semibold font-mono">
              MANAGE <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-16 h-16 text-slate-900" />
          </div>
          <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">ACCOUNTS STORED</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">{totalUsers}</h3>
            <span className="text-[10px] text-slate-400 font-mono">active nodes</span>
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 text-[10px] text-slate-550">
            <span>Suspended: <b className="text-red-650">{db.users.filter(u => u.status === 'suspended').length}</b></span>
            <button onClick={() => setActiveTab('users')} className="hover:underline flex items-center gap-0.5 text-blue-600 font-semibold font-mono">
              VIEW <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <CalendarRange className="w-16 h-16 text-slate-900" />
          </div>
          <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">BOOKING DEMANDS</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">{totalBookings}</h3>
            <span className="text-[10px] text-slate-400 font-mono">scheduled</span>
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 text-[10px] text-slate-550">
            <span>Pending action: <b className="text-amber-600">{db.bookings.filter(b => b.status === 'pending').length}</b></span>
            <button onClick={() => setActiveTab('bookings')} className="hover:underline flex items-center gap-0.5 text-blue-600 font-semibold font-mono">
              SCHEDULER <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign className="w-16 h-16 text-slate-900" />
          </div>
          <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">COLLECTED REVENUE</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 text-[10px] text-slate-550">
            <span>Payment collection: <b className="text-emerald-600">100% Secure</b></span>
            <button onClick={() => setActiveTab('payments')} className="hover:underline flex items-center gap-0.5 text-blue-600 font-semibold font-mono">
              PAYMENTS <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Revenue flow and Pending requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Spark Flow Earning Simulation */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-[10px] tracking-widest uppercase font-mono text-slate-400">weekly accounting trends</span>
                <h2 className="text-sm font-bold tracking-tight text-slate-800">Simulated Revenue Run</h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400">Calculated sum</p>
                <p className="text-xs font-extrabold text-blue-600">+$2,240.25</p>
              </div>
            </div>

            {/* Custom line chart in SVG */}
            <div className="h-40 w-full relative group">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 700 160">
                {/* Horizontal Guide lines */}
                <line x1="0" y1="20" x2="700" y2="20" stroke="#f1f5f9" strokeWidth="1.5" />
                <line x1="0" y1="80" x2="700" y2="80" stroke="#f1f5f9" strokeWidth="1.5" />
                <line x1="0" y1="140" x2="700" y2="140" stroke="#f1f5f9" strokeWidth="1.5" />

                {/* Shading Area graph */}
                <path
                  d="M 10 140 Q 115 110 220 120 T 440 40 T 690 20 L 690 140 Z"
                  fill="url(#grad)"
                  opacity="0.1"
                />

                {/* Line Path */}
                <path
                  d="M 10 140 Q 115 110 220 120 T 440 40 T 690 20"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Node Points */}
                <circle cx="10" cy="140" r="4.5" fill="#2563eb" />
                <circle cx="115" cy="110" r="4.5" fill="#3b82f6" />
                <circle cx="225" cy="120" r="4.5" fill="#3b82f6" />
                <circle cx="440" cy="40" r="4.5" fill="#3b82f6" />
                <circle cx="690" cy="20" r="5" fill="#1d4ed8" stroke="#2563eb" strokeWidth="1.5" />

                {/* Tooltip labels */}
                <text x="10" y="155" fill="#94a3b8" className="text-[9px] font-mono">Mon</text>
                <text x="115" y="155" fill="#94a3b8" className="text-[9px] font-mono">Tue</text>
                <text x="225" y="155" fill="#94a3b8" className="text-[9px] font-mono">Wed</text>
                <text x="335" y="155" fill="#94a3b8" className="text-[9px] font-mono">Thu</text>
                <text x="445" y="155" fill="#94a3b8" className="text-[9px] font-mono">Fri</text>
                <text x="560" y="155" fill="#94a3b8" className="text-[9px] font-mono">Sat</text>
                <text x="660" y="155" fill="#94a3b8" className="text-[9px] font-mono">Today</text>

                {/* Gradients */}
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#ffffff" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <div className="flex gap-4 items-center border-t border-slate-100 pt-3 mt-3 text-[10px] text-slate-500 font-mono">
            <span>● Weekly Target: <b className="text-slate-700">92% Met</b></span>
            <span>● Current Load: <b className="text-slate-700">Medium Demand</b></span>
          </div>
        </div>

        {/* Verification Queue card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-600">verification pending</span>
              <h2 className="text-xs font-bold text-slate-800">Affiliation Approvals</h2>
            </div>
            <span className="text-[10px] bg-amber-50 text-amber-700 font-mono px-2 py-0.5 rounded font-bold border border-amber-200">
              {pendingShops.length} req
            </span>
          </div>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {pendingShops.length === 0 ? (
              <div className="text-center py-10 text-slate-400 flex flex-col items-center justify-center gap-1.5 border border-dashed border-slate-200 rounded-lg">
                <Store className="w-5 h-5 opacity-40 text-slate-400" />
                <p className="text-xs font-mono">All affiliate queues approved!</p>
              </div>
            ) : (
              pendingShops.map((shop) => (
                <div key={shop.id} className="p-3 bg-slate-50 border border-slate-200 rounded-md flex flex-col gap-2 relative group hover:border-slate-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 leading-tight">{shop.shop_name}</h4>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-slate-450" /> {shop.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-1.5 mt-1 border-t border-slate-200 pt-2 text-[10px]">
                    <button
                      onClick={() => onAction('shop-status', { id: shop.id, status: 'active' })}
                      className="px-2.5 py-1 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-all font-sans cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onAction('shop-status', { id: shop.id, status: 'suspended' })}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded border border-slate-250 transition-all font-sans cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Grid 2: Recent Bookings & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings Queue */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">LIVE WORKFLOW TRIGGER</span>
              <h2 className="text-xs font-bold text-slate-800">Recent Scheduler Bookings</h2>
            </div>
            <button
              onClick={() => setActiveTab('bookings')}
              className="text-[10px] text-blue-600 font-mono tracking-tighter hover:underline font-bold"
            >
              SHOW ALL MASTER LIST
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-500 border-b border-slate-200 bg-slate-50">
                  <th className="p-2 font-mono font-bold uppercase text-[9px] tracking-wider">Display Ref</th>
                  <th className="p-2 font-bold uppercase text-[9px] tracking-wider">Customer Node</th>
                  <th className="p-2 font-bold uppercase text-[9px] tracking-wider">Station Shop</th>
                  <th className="p-2 font-bold uppercase text-[9px] tracking-wider">Timings</th>
                  <th className="p-2 font-bold uppercase text-[9px] tracking-wider text-right">Workflow Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-mono">No booking nodes available</td>
                  </tr>
                ) : (
                  recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2 font-mono font-bold text-blue-600">{b.display_id}</td>
                      <td className="p-2 text-slate-800 font-bold">{b.customerName}</td>
                      <td className="p-2 text-slate-650 font-medium font-sans">{b.shopName}</td>
                      <td className="p-2 text-slate-600">
                        <span className="block font-mono leading-none">{b.booking_date}</span>
                        <span className="text-[10px] text-slate-400 block mt-1 font-mono">{b.booking_time}</span>
                      </td>
                      <td className="p-2 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                          b.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : b.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse'
                            : b.status === 'cancelled'
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : 'bg-blue-105 bg-blue-50 text-blue-800 border-blue-200'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Client feedback audit module */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">CLIENT METRICS</span>
                <h2 className="text-xs font-bold text-slate-800">Review Auditing</h2>
              </div>
              <button onClick={() => setActiveTab('reviews')} className="text-[10px] text-blue-600 hover:underline font-mono font-bold">
                MODERATE
              </button>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {recentReviews.length === 0 ? (
                <div className="text-center py-10 text-slate-400">No audits found.</div>
              ) : (
                recentReviews.map((r) => (
                  <div key={r.id} className="p-3 bg-slate-50 border border-slate-200 rounded-md flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-850">{r.customerName}</span>
                      <div className="flex items-center gap-0.5 text-amber-600 font-mono text-[10px] font-bold">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {r.rating}/5
                      </div>
                    </div>
                    <p className="text-slate-600 line-clamp-2 text-[11px] leading-relaxed italic">
                      "{r.comment}"
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-450 border-t border-slate-200 pt-2">
                      <span className="font-mono text-blue-600">{r.shopName}</span>
                      <span className="font-mono text-slate-400">{r.created_at.substring(0, 10)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-slate-50 p-3 border border-slate-200 rounded-md mt-4 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono text-slate-500 block uppercase leading-none">ALL SYSTEM RATING</span>
              <span className="text-sm font-extrabold text-amber-600 block mt-1">★ 4.50 avg</span>
            </div>
            <div className="h-1.5 w-20 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 w-[90%] rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
