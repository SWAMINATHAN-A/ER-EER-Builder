import { useState, useEffect } from 'react';
import {
  FolderArchive,
  X,
  Save,
  Trash2,
  Download,
  Calendar,
  Layers,
  Database,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  Cloud,
  CloudOff,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useDiagram } from '../context/DiagramContext.jsx';
import {
  saveUserSchema,
  getUserSchemas,
  deleteUserSchema,
  subscribeToUserSchemas,
} from '../utils/databaseService.js';

export default function SavedSchemasModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const {
    nodes,
    edges,
    diagramMode,
    setNodes,
    setEdges,
    setDiagramMode,
    diagramTitle,
    setDiagramTitle,
  } = useDiagram();

  const [schemas, setSchemas] = useState([]);
  const [saveTitleInput, setSaveTitleInput] = useState(diagramTitle || 'My ER Schema');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setSaveTitleInput(diagramTitle || 'My ER Schema');
    setSaveSuccess(false);
    setError('');

    const unsubscribe = subscribeToUserSchemas(user?.uid, (list) => {
      setSchemas(list);
    });

    return () => unsubscribe();
  }, [isOpen, user?.uid, diagramTitle]);

  if (!isOpen) return null;

  const handleSaveCurrent = async () => {
    if (!saveTitleInput.trim()) {
      setError('Please provide a title for your schema.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await saveUserSchema(user?.uid, {
        title: saveTitleInput.trim(),
        mode: diagramMode,
        nodes,
        edges,
      });
      setDiagramTitle(saveTitleInput.trim());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setError(err?.message || 'Failed to save schema to database.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadSchema = (schema) => {
    if (schema.mode && schema.mode !== diagramMode) {
      setDiagramMode(schema.mode, false);
    }
    setNodes(schema.nodes || []);
    setEdges(schema.edges || []);
    setDiagramTitle(schema.title || 'Untitled Schema');
    onClose();
  };

  const handleDeleteSchema = async (e, schemaId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this saved schema?')) return;
    try {
      await deleteUserSchema(user?.uid, schemaId);
    } catch (err) {
      alert('Failed to delete schema: ' + err.message);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Cloud Schema Manager
                </h3>
                {user ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <Cloud className="w-3 h-3" />
                    Firebase Sync Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <CloudOff className="w-3 h-3" />
                    Local Device Storage
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Save current diagram to Firebase Realtime Database or load previous versions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Unauthenticated notice */}
          {!user && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <strong>Guest Mode:</strong> Your diagrams are saved in your browser's local storage.
                <a href="/login" className="underline font-semibold ml-1 hover:text-amber-950 dark:hover:text-amber-100">
                  Sign in to your Firebase account
                </a>{' '}
                to securely sync and backup diagrams in the cloud.
              </div>
            </div>
          )}

          {/* Save Current Diagram Section */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
              <span className="flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Save Current Canvas Diagram
              </span>
              <span className="text-[11px] font-mono text-zinc-500">
                {nodes.length} nodes • {edges.length} edges • {diagramMode.toUpperCase()}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={saveTitleInput}
                onChange={(e) => setSaveTitleInput(e.target.value)}
                placeholder="Enter schema title (e.g. E-Commerce Order Model)"
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={handleSaveCurrent}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-xs transition-all disabled:opacity-60 cursor-pointer shrink-0"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save to Cloud'}
                  </>
                )}
              </button>
            </div>

            {error && (
              <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
            )}
          </div>

          {/* Saved Schemas List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <span>Saved Diagrams ({schemas.length})</span>
            </div>

            {schemas.length === 0 ? (
              <div className="py-10 text-center space-y-2 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <FolderArchive className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600" />
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  No saved schemas found yet
                </p>
                <p className="text-[11px] text-zinc-400">
                  Type a title above and click "Save to Cloud" to store your first diagram!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {schemas.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleLoadSchema(s)}
                    className="group flex items-center justify-between p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-500/60 dark:hover:border-blue-500/60 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 group-hover:text-blue-600 transition-colors shrink-0">
                        {s.mode === 'eer' ? (
                          <Layers className="w-4 h-4" />
                        ) : (
                          <Database className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {s.title}
                          </h4>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shrink-0">
                            {s.mode || 'er'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(s.updatedAt || s.createdAt)}
                          </span>
                          <span>•</span>
                          <span>{(s.nodes || []).length} nodes</span>
                          <span>•</span>
                          <span>{(s.edges || []).length} edges</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadSchema(s);
                        }}
                        className="px-2.5 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors cursor-pointer"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSchema(e, s.id)}
                        title="Delete saved diagram"
                        className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between text-xs">
          <span className="text-[11px] text-zinc-400">
            Powered by Firebase Realtime Database
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
