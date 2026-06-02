/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { FullDbState } from '../types';
import { Search, Star, Trash2 } from 'lucide-react';

interface ReviewsViewProps {
  db: FullDbState;
  onAction: (endpoint: string, payload?: any) => void;
}

export default function ReviewsView({ db, onAction }: ReviewsViewProps) {
  const [search, setSearch] = useState('');

  const filteredReviews = db.reviews.filter((r) => {
    const customer = db.users.find((u) => u.id === r.customer_id)?.name || '';
    const shop = db.shops.find((shp) => shp.id === r.shop_id)?.shop_name || '';
    const booking = db.bookings.find((b) => b.id === r.booking_id)?.display_id || '';

    return (
      customer.toLowerCase().includes(search.toLowerCase()) ||
      shop.toLowerCase().includes(search.toLowerCase()) ||
      booking.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">client auditing panel</span>
        <h2 className="text-sm font-bold tracking-tight text-slate-800">Review Moderation Console</h2>
      </div>

      {/* Audit warning info */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-805 text-amber-850 text-amber-840 text-amber-800">
        <b>CASCADE NOTIFICATION ALERT:</b> Deleting reviews will automatically trigger retroactive AVG rating recalculation algorithms for the target partner shop inside the database, updating averages and review counts.
      </div>

      {/* Filter and Search */}
      <div className="flex bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search review comments, client node names, garage names, or scheduler reference displays..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 animate-none"
          />
        </div>
      </div>

      {/* Table reviews log */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <th className="p-3 font-mono font-bold uppercase text-[9px] tracking-wider">Record Ref</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Customer Node</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Associated Shop</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Scheduler Ref</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Rating Level</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Client Comment / Feedback message</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Log Date</th>
                <th className="p-3 text-right font-bold uppercase text-[9px] tracking-wider">Moderate Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400 font-mono">
                    Empty Resultset. No feedback comments indexed matching specifications.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((r) => {
                  const customer = db.users.find((u) => u.id === r.customer_id);
                  const shop = db.shops.find((shp) => shp.id === r.shop_id);
                  const booking = db.bookings.find((b) => b.id === r.booking_id);

                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono text-slate-400 font-bold">REV-{r.id}</td>
                      <td className="p-3 font-bold text-slate-900">{customer ? customer.name : 'Unknown Guest'}</td>
                      <td className="p-3 text-blue-600 font-semibold">{shop ? shop.shop_name : 'Unknown Affiliate'}</td>
                      <td className="p-3 font-mono text-slate-450 font-bold">{booking ? booking.display_id : 'Unknown Ref'}</td>
                      <td className="p-3 text-amber-600 font-extrabold font-mono text-sm whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-550 fill-amber-500 text-amber-500 shrink-0" />
                          <span>{r.rating} / 5</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-700 max-w-sm whitespace-normal leading-relaxed italic pr-8">
                        "{r.comment}"
                      </td>
                      <td className="p-3 text-slate-500 font-mono whitespace-nowrap">{r.created_at}</td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            if (window.confirm("Cascaded Trigger Warning: Confirm wiping this rating comment? This recalibrates average rating statistics score for parent store.")) {
                              onAction('delete-review', { id: r.id });
                            }
                          }}
                          className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold px-2.5 py-1.5 rounded text-[10px] cursor-pointer inline-flex items-center gap-1.5 animate-none"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Drop Review</span>
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
