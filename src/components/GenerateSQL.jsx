import { useState } from 'react';
import { Database, Loader2, Copy, Check } from 'lucide-react';
import { useDiagram } from '../context/DiagramContext.jsx';
import { generateWithModelFallback, formatGeminiError } from '../utils/geminiClient.js';

export default function GenerateSQL() {
  const { nodes, edges } = useDiagram();
  const [sqlResult, setSqlResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateSQL = async () => {
    setLoading(true);
    setError(null);
    try {
      const erDataJson = JSON.stringify({ nodes, edges }, null, 2);

      const prompt = `Convert the following Entity-Relationship (ER) diagram structure into standard SQL CREATE TABLE statements.
Include appropriate primary keys, foreign key constraints with ON DELETE CASCADE, NOT NULL constraints, and data types (e.g., INT, VARCHAR, TIMESTAMP).

Return ONLY the raw SQL statements. Do not wrap in markdown quotes.

ER Diagram Data:
${erDataJson}`;

      const response = await generateWithModelFallback({
        contents: prompt,
      });

      const text = response.text || '';
      const cleanSql = text.replace(/^```(sql)?/i, '').replace(/```$/, '').trim();
      setSqlResult(cleanSql);
    } catch (err) {
      setError(formatGeminiError(err));
      setSqlResult('');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!sqlResult) return;
    navigator.clipboard.writeText(sqlResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="generate-sql-container" className="flex flex-col gap-3 w-full">
      <button
        id="generate-sql-ai-btn"
        type="button"
        onClick={handleGenerateSQL}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-xs cursor-pointer transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating SQL...</span>
          </>
        ) : (
          <>
            <Database className="w-4 h-4" />
            <span>Generate SQL</span>
          </>
        )}
      </button>

      {error && (
        <div
          id="generate-sql-error"
          className="p-3 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-lg"
        >
          {error}
        </div>
      )}

      {sqlResult && (
        <div id="sql-result-wrapper" className="relative mt-2 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-zinc-100 shadow-md">
          <div className="flex items-center justify-between px-3 py-2 bg-zinc-800/80 border-b border-zinc-700/60 text-xs text-zinc-300">
            <span className="font-mono font-medium">Generated SQL</span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-[11px] cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre
            id="generated-sql-pre"
            className="p-4 font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed"
          >
            {sqlResult}
          </pre>
        </div>
      )}
    </div>
  );
}
