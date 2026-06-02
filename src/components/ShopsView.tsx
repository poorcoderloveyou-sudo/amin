/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { FullDbState, DbShop } from '../types';
import { Store, Search, ShieldAlert, BadgeInfo, CheckCircle, Ban, Skull, HelpCircle, MapPin, PhoneCall } from 'lucide-react';

interface ShopsViewProps {
  db: FullDbState;
  onAction: (endpoint: string, payload?: any) => void;
}

export default function ShopsView({ db, onAction }: ShopsViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredShops = db.shops.filter((shop) => {
    const ownerName = db.users.find((u) => u.id === shop.owner_id)?.name || '';
    const matchesSearch =
      shop.shop_name.toLowerCase().includes(search.toLowerCase()) ||
      shop.address.toLowerCase().includes(search.toLowerCase()) ||
      ownerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === '' || shop.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">partner station registry</span>
        <h2 className="text-sm font-bold tracking-tight text-slate-800">Affiliated Service Shops</h2>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex justify-between items-center">
          <div>
            <span className="text-[9px] text-slate-500 font-mono font-bold uppercase">APPROVED PARTNERS</span>
            <span className="text-lg font-bold text-slate-900 block">{db.shops.filter(s => s.status === 'active').length}</span>
          </div>
          <span className="p-1.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-md">
            <CheckCircle className="w-4 h-4" />
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex justify-between items-center animate-none">
          <div>
            <span className="text-[9px] text-slate-500 font-mono font-bold uppercase">PENDING VERIFICATION</span>
            <span className="text-lg font-bold text-amber-600 block">{db.shops.filter(s => s.status === 'pending').length}</span>
          </div>
          <span className="p-1.5 bg-amber-50 border border-amber-200 text-amber-650 rounded-md">
            <HelpCircle className="w-4 h-4" />
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex justify-between items-center">
          <div>
            <span className="text-[9px] text-slate-500 font-mono font-bold uppercase">SUSPENDED STATIONS</span>
            <span className="text-lg font-bold text-red-600 block">{db.shops.filter(s => s.status === 'suspended').length}</span>
          </div>
          <span className="p-1.5 bg-red-50 border border-red-200 text-red-650 rounded-md">
            <Ban className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Filter and Search Bars */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search garage by shop name, address coordinates, or owner identity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Status Filter</option>
          <option value="active">Active/Approved</option>
          <option value="pending">Pending Admin Approval</option>
          <option value="suspended">Suspended Garage</option>
        </select>
      </div>

      {/* Main Grid Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <th className="p-3 font-mono font-bold uppercase text-[9px] tracking-wider">Shop ID</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Garage Station Ident</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Owner Details</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Physical Location</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Phone number</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Ratings Core</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Verification Status</th>
                <th className="p-3 text-right font-bold uppercase text-[9px] tracking-wider">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredShops.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400 font-mono">
                    No affiliated shops indexed matching selected queries.
                  </td>
                </tr>
              ) : (
                filteredShops.map((shop) => {
                  const owner = db.users.find((u) => u.id === shop.owner_id);
                  const isPending = shop.status === 'pending';
                  const isSuspended = shop.status === 'suspended';

                  return (
                    <tr key={shop.id} className={`hover:bg-slate-50 transition-colors ${isSuspended ? 'opacity-70 bg-red-50/20' : ''}`}>
                      <td className="p-3 font-mono text-slate-400 font-bold">SHP-{shop.id}</td>
                      <td className="p-3">
                        <span className="font-extrabold text-blue-600 text-xs block">{shop.shop_name}</span>
                        <span className="text-[10px] text-slate-450 font-mono">Coords: {shop.latitude.toFixed(4)}, {shop.longitude.toFixed(4)}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-slate-900 block font-semibold">{owner ? owner.name : 'Unknown User'}</span>
                        <span className="text-[10px] text-slate-450 font-mono">UID: {shop.owner_id}</span>
                      </td>
                      <td className="p-3 max-w-xs truncate text-slate-700">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{shop.address}</span>
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <PhoneCall className="w-3 h-3 text-slate-450 shrink-0" />
                          <span>{shop.phone}</span>
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-amber-600 font-extrabold font-mono text-xs">★ {shop.avg_rating.toFixed(1)}</span>
                          <span className="text-[10px] text-slate-450">({shop.total_reviews} reviews)</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                          shop.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-250'
                            : isPending
                            ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                            : 'bg-red-50 text-red-800 border-red-200'
                        }`}>
                          {shop.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1 whitespace-nowrap">
                        {isPending && (
                          <button
                            onClick={() => onAction('shop-status', { id: shop.id, status: 'active' })}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1 rounded text-[10px] cursor-pointer"
                          >
                            Approve
                          </button>
                        )}

                        {shop.status !== 'suspended' ? (
                          <button
                            onClick={() => onAction('shop-status', { id: shop.id, status: 'suspended' })}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-850 border border-amber-200 px-2 py-1 rounded text-[10px] font-semibold cursor-pointer"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => onAction('shop-status', { id: shop.id, status: 'active' })}
                            className="bg-emerald-55 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-1 rounded text-[10px] font-semibold cursor-pointer"
                          >
                            Activate
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (window.confirm("Cascaded Trigger Warning: Wiping this shop will remove all related scheduler bookings and payment logs. Proceed?")) {
                              onAction('shop-status', { id: shop.id, status: 'suspended' });
                            }
                          }}
                          className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2 py-1 rounded text-[10px] font-semibold cursor-pointer"
                        >
                          Wipe
                        </button>
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
