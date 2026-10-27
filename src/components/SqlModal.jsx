import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Check, Database, Sparkles } from 'lucide-react';
import GenerateSQL from './GenerateSQL.jsx';

export default function SqlModal({ isOpen, onClose, sqlContent }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('instant');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(sqlContent);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = sqlContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return createPortal(
    <div
      id="sql-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6 overflow-y-auto"
    >
      <div
        id="sql-modal-container"
        className="w-full max-w-2xl my-auto rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#1C1C1E] shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-2.5rem)]"
      >
        <div
          id="sql-modal-header"
          className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1C1C1E] shrink-0"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-center text-[#0071E3] dark:text-blue-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3
                id="sql-modal-title"
                className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
              >
                SQL DDL Generator
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Relational schema mapped from your ER diagram
              </p>
            </div>
          </div>
          <button
            id="close-sql-modal-btn"
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pt-3 pb-2 flex border-b border-black/[0.06] dark:border-white/[0.08] bg-[#F5F5F7]/60 dark:bg-[#161618]/60">
          <div className="flex items-center p-0.5 bg-black/[0.05] dark:bg-white/[0.06] rounded-full border border-black/[0.04] dark:border-white/[0.04]">
            <button
              type="button"
              onClick={() => setActiveTab('instant')}
              className={`px-3.5 py-1.5 text-xs rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === 'instant'
                  ? 'bg-white dark:bg-[#2C2C2E] text-zinc-900 dark:text-zinc-50 font-semibold shadow-2xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Instant DDL
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-white dark:bg-[#2C2C2E] text-zinc-900 dark:text-zinc-50 font-semibold shadow-2xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#0071E3]" />
              <span>AI Multi-Dialect</span>
            </button>
          </div>
        </div>

        <div id="sql-modal-body" className="p-5 flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'instant' ? (
            <pre className="p-4 rounded-2xl bg-[#1C1C1E] text-zinc-100 font-mono text-xs overflow-x-auto custom-scrollbar leading-relaxed border border-white/[0.08] shadow-inner">
              <code>{sqlContent}</code>
            </pre>
          ) : (
            <div className="py-1">
              <GenerateSQL />
            </div>
          )}
        </div>

        <div
          id="sql-modal-footer"
          className="px-5 py-3.5 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between bg-[#F5F5F7]/60 dark:bg-[#161618]/60"
        >
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 hidden sm:inline">
            Compatible with PostgreSQL, MySQL, and SQLite.
          </span>
          <div className="flex items-center gap-2 ml-auto">
            {activeTab === 'instant' && (
              <button
                id="copy-sql-btn"
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#0071E3] hover:bg-[#0077ED] cursor-pointer transition-all duration-200 active:scale-[0.98] shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy SQL'}</span>
              </button>
            )}
            <button
              id="dismiss-sql-modal-btn"
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
