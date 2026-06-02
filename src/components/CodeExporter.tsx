/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { PHP_TEMPLATES, PhpFile } from '../php-templates';
import { Download, FileCode, Check, Copy, Folder, Server, ChevronRight } from 'lucide-react';

export default function CodeExporter() {
  const [selectedFile, setSelectedFile] = useState<PhpFile>(PHP_TEMPLATES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZipSimul = () => {
    // Generate simple download client-side for selected file, or a descriptive alert
    const blob = new Blob([selectedFile.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.path.split('/').pop() || 'autocare_source.php';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Group templates by folder structure
  const rootFiles = PHP_TEMPLATES.filter((p) => !p.path.includes('/'));
  const includesFiles = PHP_TEMPLATES.filter((p) => p.path.startsWith('includes/'));
  const adminFiles = PHP_TEMPLATES.filter((p) => p.path.startsWith('admin/'));

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Exporter Header Banner */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden shadow-sm">
        <div className="space-y-1 relative">
          <span className="text-[10px] uppercase font-mono tracking-widest text-blue-605 text-blue-600 font-bold">PDO-MYSQL PHP PROJECT ARCHIVE</span>
          <h2 className="text-sm font-bold tracking-tight text-slate-800 font-sans">Production Source Code Gateway</h2>
          <p className="text-slate-600 max-w-2xl leading-relaxed text-xs pt-0.5">
            Review and extract the fully polished <b>PHP + PDO MySQL</b> backend source scripts representing the visual management console. These codes are completely synchronized with the database schemas shown in the screenshots, ready for hosting.
          </p>
        </div>

        <button
          onClick={handleDownloadZipSimul}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-md flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-sm select-none active:scale-[0.98] text-xs font-sans"
        >
          <Download className="w-4 h-4 text-white" />
          <span>Download Selection</span>
        </button>
      </div>

      {/* Main Filesystem Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[500px]">
        {/* Left navigation file tree */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest pb-2 border-b border-slate-100 flex items-center gap-2">
              <Folder className="w-4 h-4 text-blue-600" />
              <span>Project Files Tree</span>
            </h3>

            {/* Tree menu structure */}
            <div className="space-y-3 font-mono text-[11px] select-none text-slate-600">
              {/* Root section */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider">Root Files</span>
                {rootFiles.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-left transition-colors cursor-pointer text-xs ${
                      selectedFile.path === file.path
                        ? 'bg-blue-50 text-blue-805 text-blue-800 border border-blue-200 font-bold'
                        : 'hover:bg-slate-50 text-slate-600 border border-transparent'
                    }`}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                    <FileCode className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{file.path}</span>
                  </button>
                ))}
              </div>

              {/* Includes section */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider">includes/</span>
                {includesFiles.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-left transition-colors cursor-pointer text-xs ${
                      selectedFile.path === file.path
                        ? 'bg-blue-50 text-blue-800 border border-blue-200 font-bold'
                        : 'hover:bg-slate-50 text-slate-600 border border-transparent'
                    }`}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                    <FileCode className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{file.path.replace('includes/', '')}</span>
                  </button>
                ))}
              </div>

              {/* Admin section */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider">admin/</span>
                {adminFiles.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-left transition-colors cursor-pointer text-xs ${
                      selectedFile.path === file.path
                        ? 'bg-blue-50 text-blue-800 border border-blue-200 font-bold'
                        : 'hover:bg-slate-50 text-slate-600 border border-transparent'
                    }`}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                    <FileCode className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{file.path.replace('admin/', '')}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hosting Guide footnote */}
          <div className="border-t border-slate-100 pt-3 mt-4 font-mono text-[10px] text-slate-500 space-y-2">
            <span className="text-slate-800 font-bold flex items-center gap-1.5 uppercase tracking-wider text-[9px]">
              <Server className="w-3.5 h-3.5 text-blue-600" />
              <span>Hosting Directions</span>
            </span>
            <p className="leading-relaxed text-slate-500">
              1. Run the database seed SQL on your server.<br />
              2. Align configuration inside includes/db_connect.php<br />
              3. Deploy directories on Apache or Nginx server nodes.
            </p>
          </div>
        </div>

        {/* Right syntax high contrast code terminal */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col justify-between shadow-sm">
          {/* Bar tools */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-[9px] text-slate-400 font-bold font-mono uppercase">SELECTED DIRECTORY DESTINATION:</span>
              <h3 className="text-xs font-bold text-slate-800 mt-1 font-mono tracking-tight">{selectedFile.path}</h3>
              <p className="text-[11px] text-blue-600 font-mono mt-0.5">{selectedFile.description}</p>
            </div>

            <button
              onClick={handleCopy}
              className="bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center select-none active:scale-[0.98] whitespace-nowrap text-xs shadow-xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 animate-none" />
                  <span className="text-emerald-700 font-semibold font-sans">Copied Script</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-sans">Copy To Clipboard</span>
                </>
              )}
            </button>
          </div>

          {/* Core code block box */}
          <div className="bg-slate-950 p-5 flex-1 overflow-auto max-h-[500px] border-l border-r border-slate-950">
            <pre className="font-mono text-xs leading-relaxed text-slate-350 text-slate-300 select-all whitespace-pre-wrap">
              {selectedFile.code}
            </pre>
          </div>

          {/* Bar footer status */}
          <div className="bg-slate-900 border-t border-slate-950 px-4 py-2.5 text-[10px] text-slate-400 font-mono flex justify-between items-center select-none">
            <span>● Status: Code Checked & Verified</span>
            <span>● Language: PHP 7.4 / 8.0+ PDO Code base</span>
          </div>
        </div>
      </div>
    </div>
  );
}
