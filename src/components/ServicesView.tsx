/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { FullDbState } from '../types';
import { Search, DollarSign, Clock, Tag } from 'lucide-react';

export default function ServicesView({ db }: { db: FullDbState }) {
  const [search, setSearch] = useState('');

  const filteredServices = db.services.filter((s) => {
    const shop = db.shops.find((shp) => shp.id === s.shop_id)?.shop_name || '';
    return (
      s.service_name.toLowerCase().includes(search.toLowerCase()) ||
      s.vehicle_type.toLowerCase().includes(search.toLowerCase()) ||
      shop.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">affiliated package menus</span>
        <h2 className="text-sm font-bold tracking-tight text-slate-800">Service Catalog Database</h2>
      </div>

      {/* Filter and Search */}
      <div className="flex bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search service packs by category name, vehicle type (Sedan, SUV, Truck, Motorcycle), or associated garage..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
          />
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 font-mono border border-dashed border-slate-200 rounded-lg bg-white">
            No service packages registered matching current specifications.
          </div>
        ) : (
          filteredServices.map((service) => {
            const shop = db.shops.find((shp) => shp.id === service.shop_id);
            return (
              <div key={service.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-350 hover:border-slate-300 transition-all flex flex-col justify-between relative group shadow-sm">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      {service.vehicle_type}
                    </span>
                    <span className="font-mono text-[9px] text-slate-400">ID: SRV-{service.id}</span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                    {service.service_name}
                  </h3>

                  <p className="text-[11px] font-mono text-blue-600 hover:underline cursor-pointer block pt-1">
                    Station: {shop ? shop.shop_name : 'Unknown Affiliate'}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-455 text-slate-400" />
                    <span className="text-xs text-slate-600 font-medium font-mono">{service.duration} mins</span>
                  </div>
                  <div className="flex items-center text-emerald-800 font-mono font-extrabold text-xs bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                    <DollarSign className="w-3 h-3 text-emerald-700 shrink-0" />
                    <span>{service.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
