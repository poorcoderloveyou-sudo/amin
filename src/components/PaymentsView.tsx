/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { FullDbState } from '../types';
import { Search, Info, DollarSign, Calendar, CreditCard, Layers } from 'lucide-react';

export default function PaymentsView({ db }: { db: FullDbState }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const paidAmount = db.payments
    .filter((p) => p.payment_status === 'paid')
    .reduce((acc, p) => acc + p.amount, 0);

  const pendingAmount = db.payments
    .filter((p) => p.payment_status === 'pending')
    .reduce((acc, p) => acc + p.amount, 0);

  const refundedAmount = db.payments
    .filter((p) => p.payment_status === 'refunded')
    .reduce((acc, p) => acc + p.amount, 0);

  const filteredPayments = db.payments.filter((p) => {
    const booking = db.bookings.find((b) => b.id === p.booking_id);
    const bookingIdStr = booking ? booking.display_id : '';
    const customer = booking ? db.users.find((u) => u.id === booking.customer_id)?.name || '' : '';

    const matchesSearch =
      bookingIdStr.toLowerCase().includes(search.toLowerCase()) ||
      customer.toLowerCase().includes(search.toLowerCase()) ||
      p.payment_method.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === '' || p.payment_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">financial transactions core</span>
        <h2 className="text-sm font-bold tracking-tight text-slate-800">Revenue Ledger Logging</h2>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">APPROVED CASHFLOWS</p>
          <div className="flex items-baseline mt-1">
            <h3 className="text-xl font-extrabold text-emerald-700">${paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
          <span className="text-[9px] text-emerald-700 font-mono mt-1.5 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-250 w-fit animate-none">Set in DB (PAID)</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">OUTSTANDING INVOICES</p>
          <div className="flex items-baseline mt-1">
            <h3 className="text-xl font-extrabold text-amber-700">${pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
          <span className="text-[9px] text-amber-700 font-mono mt-1.5 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit">Awaiting (PENDING)</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">REVERSED REVENUES</p>
          <div className="flex items-baseline mt-1">
            <h3 className="text-xl font-extrabold text-red-700">${refundedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
          <span className="text-[9px] text-red-700 font-mono mt-1.5 bg-red-50 px-2 py-0.5 rounded border border-red-200 w-fit">Cancelled (REFUNDED)</span>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search transactions by associated display ID (#AC-9917), client, or payment code (credit_card, e-wallet)..."
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
          <option value="">All Payment Statuses</option>
          <option value="paid">Settled/Paid</option>
          <option value="pending">Awaiting Settle</option>
          <option value="refunded">Refunded / Reversed</option>
          <option value="failed">Failed / Declined</option>
        </select>
      </div>

      {/* Database Payments Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <th className="p-3 font-mono font-bold uppercase text-[9px] tracking-wider">Tx Ref ID</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Scheduler Ref</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Client Consumer Name</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Amount Coordinates</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Payment Protocol</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Settle status</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider text-right">Settled Timings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400 font-mono">
                    No financial ledger events matching targets.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const booking = db.bookings.find((b) => b.id === p.booking_id);
                  const customer = booking ? db.users.find((u) => u.id === booking.customer_id) : null;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono text-slate-400 font-bold">TXN-{p.id}</td>
                      <td className="p-3 font-mono text-blue-600 font-semibold">{booking ? booking.display_id : 'N/A'}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900">{customer ? customer.name : 'Unknown Consumer'}</span>
                        {customer && <span className="text-[10px] text-slate-455 font-mono block">UID: {customer.id}</span>}
                      </td>
                      <td className="p-3">
                        <span className="font-extrabold text-slate-900 font-mono text-xs">${p.amount.toFixed(2)}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-100 text-slate-700 border border-slate-200">
                          {p.payment_method.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                          p.payment_status === 'paid'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-250'
                            : p.payment_status === 'pending'
                            ? 'bg-amber-50 text-amber-805 text-amber-800 border-amber-200'
                            : 'bg-red-50 text-red-800 border-red-200'
                        }`}>
                          {p.payment_status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-right">
                        {p.paid_at ? p.paid_at : <span className="text-slate-400 italic">Unresolved timings</span>}
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
