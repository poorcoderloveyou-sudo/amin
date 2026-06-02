/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { SqlLog } from '../types';
import { Terminal, Send, Trash2, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';

interface SqlConsoleProps {
  sqlLogs: SqlLog[];
  onAction: (endpoint: string, payload?: any) => Promise<any>;
  onClearLogs?: () => void;
}

export default function SqlConsole({ sqlLogs, onAction }: SqlConsoleProps) {
  const [query, setQuery] = useState('SELECT * FROM users;');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const handleRunSql = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setError(null);
    setResult(null);
    setRunning(true);

    try {
      const resp = await fetch('/api/action/run-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await resp.json();
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Syntax execution logic exception');
      }
    } catch (err: any) {
      setError(err.message || 'Fatal execution gate crash');
    } finally {
      setRunning(false);
    }
  };

  const loadPresetQuery = (preset: string) => {
    setQuery(preset);
    setError(null);
    setResult(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
      {/* Terminal query compiler prompt */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <span className="p-1.5 bg-blue-50 text-blue-600 border border-blue-105 border-blue-200 rounded-md">
                <Terminal className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest leading-none">Simulated SQL Shell</h3>
                <span className="text-[10px] text-slate-455 font-mono mt-1 block">Live RDBMS engine inspector (autocare_db)</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 font-mono text-[9px]">
              <button
                onClick={() => loadPresetQuery('SELECT * FROM users;')}
                className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-blue-600 border border-slate-200 rounded cursor-pointer"
              >
                users
              </button>
              <button
                onClick={() => loadPresetQuery('SELECT * FROM shops;')}
                className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-blue-600 border border-slate-200 rounded cursor-pointer"
              >
                shops
              </button>
              <button
                onClick={() => loadPresetQuery('SELECT * FROM bookings;')}
                className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-blue-600 border border-slate-200 rounded cursor-pointer"
              >
                bookings
              </button>
            </div>
          </div>

          <form onSubmit={handleRunSql} className="space-y-3">
            <div className="relative font-mono">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 font-mono text-xs text-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-500 h-24 leading-relaxed resize-none shadow-none"
                style={{ color: '#1e40af' }}
              />
              <span className="absolute bottom-2 right-3 text-[10px] text-slate-400 font-mono">Simulated DB Engine</span>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span>● Simulated queries: SELECT statements are supported.</span>
              <button
                type="submit"
                disabled={running}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-[0.98] disabled:opacity-50"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>{running ? 'Compiling...' : 'Run query (EXE)'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Console outputs */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Command Output Prompt</h4>
          
          <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 font-mono select-text min-h-[140px] overflow-auto text-slate-805 text-slate-800">
            {error && (
              <div className="text-red-700 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">MySQL Server syntax exception:</p>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
            )}

            {!error && !result && (
              <p className="text-slate-400 italic text-[11px]">No statement compiled today. Input custom SQL schemas or view preset tables to start.</p>
            )}

            {!error && result && (
              <div className="space-y-4">
                {result.message && (
                  <p className="text-emerald-700 flex items-center gap-2 font-bold select-text text-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>{result.message}</span>
                  </p>
                )}

                {result.rows && (
                  <div className="space-y-2 text-[11px]">
                    <p className="text-slate-500 font-sans font-medium">Query OK. {result.rows.length} row(s) returned.</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] border-collapse min-w-max">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-150 bg-slate-100 text-slate-600">
                            {result.columns.map((col: string) => (
                              <th key={col} className="p-2 py-1 font-bold uppercase text-[9px] tracking-wider">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.rows.map((row: any, rIdx: number) => (
                            <tr key={rIdx} className="border-b border-slate-100 hover:bg-slate-50 text-slate-700">
                              {result.columns.map((col: string) => (
                                <td key={col} className="p-2 py-1 max-w-xs truncate">{String(row[col] ?? 'NULL')}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Database live trigger queries history log (Right Bar) */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col justify-between max-h-[580px] overflow-hidden">
        <div className="space-y-4 h-full flex flex-col overflow-hidden">
          <div className="border-b border-slate-100 pb-2.5 flex justify-between items-center shrink-0">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest block leading-none">Admin Action SQL logs</h3>
              <span className="text-[10px] text-slate-450 font-mono mt-1 block">Live PDO translation trace history</span>
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto pr-1 flex-1">
            {sqlLogs.length === 0 ? (
              <p className="text-slate-400 italic py-12 text-center text-[11px]">No trace queries processed yet.</p>
            ) : (
              sqlLogs.map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-md space-y-1.5 select-text group hover:border-slate-200 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono text-slate-500 font-bold leading-none">{log.description}</span>
                    <span className="text-[8px] text-slate-400 font-mono leading-none">{log.timestamp.substring(10)}</span>
                  </div>

                  <pre className="bg-white p-2 border border-slate-150 border-slate-200 rounded-md text-[10px] text-blue-700 font-mono leading-normal whitespace-pre-wrap select-all">
                    {log.sql}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
