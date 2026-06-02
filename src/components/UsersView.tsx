/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { FullDbState, DbUser } from '../types';
import { Shield, Plus, Search, ShieldAlert, UserPlus, Trash, Ban, CheckCircle } from 'lucide-react';

interface UsersViewProps {
  db: FullDbState;
  onAction: (endpoint: string, payload?: any) => void;
}

export default function UsersView({ db, onAction }: UsersViewProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Add User Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'customer' | 'shop_owner' | 'admin'>('customer');

  const filteredUsers = db.users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.includes(search);
    const matchesRole = roleFilter === '' || user.role === roleFilter;
    const matchesStatus = statusFilter === '' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;
    onAction('add-user', { name, email, phone, role });
    // Reset
    setName('');
    setEmail('');
    setPhone('');
    setRole('customer');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* View Header with Add Command Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">Security Operators & Clients</span>
          <h2 className="text-sm font-bold tracking-tight text-slate-800">Database Account Registry</h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New Account</span>
        </button>
      </div>

      {/* Conditionally Render Add User Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm space-y-4 max-w-xl animate-fade-in">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Account Provision Parameters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Full Identity Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Lewis Hamilton"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-950"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Email Coordinates</label>
              <input
                type="email"
                required
                placeholder="e.g. lewis@mercedes.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-955 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Mobile Contact Phone</label>
              <input
                type="text"
                required
                placeholder="e.g. 0811993344"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Permission Role Access</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
              >
                <option value="customer">Customer (Requests Detailing Wash)</option>
                <option value="shop_owner">Shop Owner (Runs Partner Station)</option>
                <option value="admin">Administrator (Supervisory Rights)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 text-xs">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
            >
              Commit Row (INSERT)
            </button>
          </div>
        </form>
      )}

      {/* Grid Filter and Search Controls */}
      <div className="flex flex-col md:flex-row gap-3 bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-450 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search account by Name, Email, or Telephone number coordinates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Account Roles</option>
            <option value="admin">Administrators</option>
            <option value="shop_owner">Shop Owners</option>
            <option value="customer">Customers</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Nodes</option>
            <option value="suspended">Suspended Nodes</option>
          </select>
        </div>
      </div>

      {/* Database Users Grid Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <th className="p-3 font-mono font-bold uppercase text-[9px] tracking-wider">Record ID</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Client Info</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Email Coordinates</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Phone number</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Security Clearance</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Status Gateway</th>
                <th className="p-3 font-bold uppercase text-[9px] tracking-wider">Joined At</th>
                <th className="p-3 text-right font-bold uppercase text-[9px] tracking-wider whitespace-nowrap">CRUD Command Panel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400 font-mono">
                    Empty Resultset. No client accounts indexed matching specifications.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSuspended = u.status === 'suspended';
                  return (
                    <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${isSuspended ? 'opacity-70 bg-red-55 bg-red-50/20' : ''}`}>
                      <td className="p-3 font-mono text-slate-400 font-bold">UID-{u.id}</td>
                      <td className="p-3 font-bold text-slate-900">{u.name}</td>
                      <td className="p-3 text-slate-600 font-mono">{u.email}</td>
                      <td className="p-3 text-slate-500 font-mono">{u.phone}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                          u.role === 'admin'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : u.role === 'shop_owner'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-115 bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold border ${
                          !isSuspended
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-400">{u.created_at}</td>
                      <td className="p-3 text-right space-x-1 whitespace-nowrap">
                        {u.role === 'shop_owner' && isSuspended && (
                          <span className="text-[9px] text-amber-600 font-mono mr-2 bg-amber-50 border border-amber-200 px-1 py-0.5 rounded animate-pulse">Suspended station cascades</span>
                        )}

                        {!isSuspended ? (
                          <button
                            onClick={() => onAction('user-status', { id: u.id, status: 'suspended' })}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2 py-1 rounded text-[10px] font-semibold cursor-pointer"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => onAction('user-status', { id: u.id, status: 'active' })}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-250 px-2 py-1 rounded text-[10px] font-semibold cursor-pointer"
                          >
                            Restore
                          </button>
                        )}

                        {u.role !== 'admin' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Cascade trigger WARNING: Deleting standard user "${u.name}" coordinates can delete linked garages! Continue?`)) {
                                onAction('user-delete', { id: u.id });
                              }
                            }}
                            className="bg-red-50 hover:bg-red-105 hover:bg-red-100 text-red-700 border border-red-200 px-2 py-1 rounded text-[10px] font-semibold cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
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
