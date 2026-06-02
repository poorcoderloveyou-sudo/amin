/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { FullDbState, DbBooking } from '../types';
import { Search, Calendar, Clock, RotateCcw, CheckCircle, Eye, RefreshCw } from 'lucide-react';

interface BookingsViewProps {
  db: FullDbState;
  onAction: (endpoint: string, payload?: any) => void;
}

export default function BookingsView({ db, onAction }: BookingsViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredBookings = db.bookings.filter((b) => {
    const customer = db.users.find((u) => u.id === b.customer_id)?.name || '';
    const shop = db.shops.find((s) => s.id === b.shop_id)?.shop_name || '';
    const vehicle = db.vehicles.find((v) => v.id === b.vehicle_id);
    const vehicleStr = vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.plate_number}` : '';

    const matchesSearch =
      b.display_id.toLowerCase().includes(search.toLowerCase()) ||
      customer.toLowerCase().includes(search.toLowerCase()) ||
      shop.toLowerCase().includes(search.toLowerCase()) ||
      vehicleStr.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === '' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">scheduler operational console</span>
        <h2 className="text-sm font-bold tracking-tight text-slate-800">Live Active Bookings Terminal</h2>
      </div>

      {/* Filter and Search parameters */}
      <div className="flex flex-col md:flex-row gap-3 bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search booking display ref (#AC-9917), client name, garage station, or vehicle plate coordinates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-505"
        >
          <option value="">All Scheduler Statuses</option>
          <option value="pending">Pending Admin Action</option>
          <option value="accepted">Accepted / Scheduled</option>
          <option value="dispatched">Dispatched Crew</option>
          <option value="in_progress">Detallers In-Progress</option>
          <option value="completed">Completed & Settled</option>
          <option value="cancelled">Cancelled Orders</option>
        </select>
      </div>

      {/* Bookings Table card */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <th className="p-3 font-mono font-bold uppercase text-[9px] tracking-wider">Display Ref</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Customer Node</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Station Shop</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Service Package</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Vehicle Node</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Timing Coordinates</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Workflow Status</th>
                <th className="p-3 text-right font-bold uppercase text-[9px] tracking-wider">Modify State (UPDATE)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400 font-mono">
                    No active scheduler bookings matching criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const customer = db.users.find((u) => u.id === b.customer_id);
                  const shop = db.shops.find((s) => s.id === b.shop_id);
                  const service = db.services.find((s) => s.id === b.service_id);
                  const vehicle = db.vehicles.find((v) => v.id === b.vehicle_id);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-600 text-xs">{b.display_id}</td>
                      <td className="p-3">
                        <span className="text-slate-900 block font-bold">{customer ? customer.name : 'Unknown Guest'}</span>
                        <span className="text-[10px] text-slate-450 font-mono">UID: {b.customer_id}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-slate-700 block font-semibold text-xs">{shop ? shop.shop_name : 'Unknown Station'}</span>
                        <span className="text-[10px] text-slate-450 font-mono">ID: {b.shop_id}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-slate-800 block font-medium">{service ? service.service_name : 'Detallers Package'}</span>
                        {service && <span className="text-[10px] text-emerald-700 font-mono font-bold">${service.price} • {service.duration} mins</span>}
                      </td>
                      <td className="p-3">
                        {vehicle ? (
                          <div>
                            <span className="text-slate-700 block font-semibold text-xs uppercase">{vehicle.brand} {vehicle.model}</span>
                            <span className="text-[10px] bg-slate-100 font-mono px-1.5 py-0.5 rounded text-slate-700 border border-slate-200">{vehicle.plate_number}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No registered vehicle</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-550 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3" />
                          <span>{b.booking_date}</span>
                        </span>
                        <span className="flex items-center gap-1 mt-1 text-[10px] text-slate-450">
                          <Clock className="w-3" />
                          <span>{b.booking_time}</span>
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                          b.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-250'
                            : b.status === 'pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                            : b.status === 'cancelled'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-indigo-50 text-indigo-750 border-indigo-200'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <select
                          value={b.status}
                          onChange={(e) => onAction('booking-status', { id: b.id, status: e.target.value })}
                          className="bg-slate-50 text-slate-800 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="pending">Pending Action</option>
                          <option value="accepted">Accepted / Booked</option>
                          <option value="dispatched">Dispatched Detaller</option>
                          <option value="in_progress">Washing / Tuning</option>
                          <option value="completed">Completed (AUTO-PAY)</option>
                          <option value="cancelled">Cancelled (REFUND)</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
