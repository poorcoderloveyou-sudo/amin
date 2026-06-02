/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { FullDbState } from '../types';
import { Search, Car } from 'lucide-react';

export default function VehiclesView({ db }: { db: FullDbState }) {
  const [search, setSearch] = useState('');

  const filteredVehicles = db.vehicles.filter((v) => {
    const customer = db.users.find((u) => u.id === v.customer_id)?.name || '';
    return (
      customer.toLowerCase().includes(search.toLowerCase()) ||
      v.brand.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.plate_number.toLowerCase().includes(search.toLowerCase()) ||
      v.vehicle_type.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">relational index lists</span>
        <h2 className="text-sm font-bold tracking-tight text-slate-800">Customer Vehicles Registry</h2>
      </div>

      {/* Filter and Search */}
      <div className="flex bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search vehicles by brand, model, plate numbers, vehicle category, or owner details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
          />
        </div>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredVehicles.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 font-mono border border-dashed border-slate-200 rounded-lg bg-white">
            No active client vehicles indexed matching specifications.
          </div>
        ) : (
          filteredVehicles.map((vehicle) => {
            const customer = db.users.find((u) => u.id === vehicle.customer_id);
            return (
              <div key={vehicle.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between relative overflow-hidden group shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                  <Car className="w-20 h-20 text-slate-900" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-slate-100 text-slate-755 text-slate-705 text-slate-700 border border-slate-200">
                      {vehicle.vehicle_type}
                    </span>
                    <span className="font-mono text-[9px] text-slate-400">ID: VEC-{vehicle.id}</span>
                  </div>

                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 leading-none group-hover:text-blue-600 transition-colors uppercase">
                      {vehicle.brand} {vehicle.model}
                    </h3>
                    <p className="text-[10px] text-slate-450 font-mono mt-1">Prod Year: {vehicle.year}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 mt-3 space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">Owner User:</span>
                    <span className="text-slate-900 font-bold hover:underline cursor-pointer">
                      {customer ? customer.name : 'Unknown Owner'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 font-mono">PLATE IND</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-150 bg-slate-100 text-slate-800 border border-slate-200 leading-none">
                      {vehicle.plate_number}
                    </span>
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
