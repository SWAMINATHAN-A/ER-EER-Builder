import { useState } from 'react';
import {
  X,
  BookOpen,
  Layers,
  Table,
  Boxes,
  HelpCircle,
  CheckCircle2,
  GitBranch,
  ArrowRight,
  Info,
} from 'lucide-react';
import { NOTATION_DEFINITIONS } from '../utils/notationAdapter.ts';

export function NotationLegendModal({ isOpen, onClose, selectedNotation, onSelectNotation }) {
  const [activeTab, setActiveTab] = useState(selectedNotation || 'chen');

  if (!isOpen) return null;

  return (
    <div
      id="notation-legend-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="notation-legend-container"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.08] shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.06] bg-zinc-50/70 dark:bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">ER & EER Multi-Notation Reference</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Compare Chen, Crow&apos;s Foot, UML Class Diagram, and Min-Max modeling notations
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notation Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-3 border-b border-black/[0.06] dark:border-white/[0.06] bg-zinc-100/40 dark:bg-zinc-900/40 overflow-x-auto">
          {Object.values(NOTATION_DEFINITIONS).map((def) => {
            const isActive = activeTab === def.id;
            return (
              <button
                key={def.id}
                type="button"
                onClick={() => setActiveTab(def.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-black/[0.04] dark:border-white/[0.04]'
                }`}
              >
                <span>{def.name}</span>
                {selectedNotation === def.id && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${isActive ? 'bg-white/25 text-white' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Notation Spotlight Card */}
          {activeTab === 'chen' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-blue-950 dark:text-blue-200">
                    Peter Chen Notation (1976)
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold">
                    Conceptual Academic Standard
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  The classical foundation of conceptual database modeling. Features separate geometric symbols for entities (rectangles), relationships (diamonds), and attributes (ovals), linked via labeled edges with 1:1, 1:N, or M:N ratios.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400">Entity Types</div>
                  <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-3 rounded border border-blue-600 inline-block" />
                      <span><strong>Strong Entity:</strong> Single rectangle</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-3 rounded border-2 border-indigo-500 inline-block" />
                      <span><strong>Weak Entity:</strong> Double rectangle</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400">Attributes</div>
                  <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                    <div><strong>PK:</strong> Underlined text in oval</div>
                    <div><strong>Multivalued:</strong> Double oval</div>
                    <div><strong>Derived:</strong> Dashed oval border</div>
                    <div><strong>Composite:</strong> Branched hierarchy</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400">Relationships</div>
                  <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                    <div><strong>Standard:</strong> Diamond shape</div>
                    <div><strong>Identifying:</strong> Double diamond</div>
                    <div><strong>Cardinality:</strong> 1, N, M on edges</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400">Participation</div>
                  <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                    <div><strong>Partial:</strong> Single line</div>
                    <div><strong>Total:</strong> Double line (mandatory existence)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'crowsfoot' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-sky-950 dark:text-sky-200">
                    Crow&apos;s Foot Notation (Martin / Everest)
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 font-bold">
                    Industry & Physical Modeling
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  The standard in enterprise software, relational database design tools, and IDEs. Entities are rendered as compact relational table cards with embedded attributes. Relationships connect tables directly with graphic terminal fork and tick markers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                  <div className="text-xs font-bold text-sky-600 dark:text-sky-400">Exactly One (1:1)</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1">
                    <div className="font-mono font-bold text-sky-700 dark:text-sky-300 text-sm">|| (Two Ticks)</div>
                    <p className="text-[11px]">Mandatory single occurrence. Exactly one row in target table.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                  <div className="text-xs font-bold text-sky-600 dark:text-sky-400">Zero or One (0..1)</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1">
                    <div className="font-mono font-bold text-sky-700 dark:text-sky-300 text-sm">o| (Ring + Tick)</div>
                    <p className="text-[11px]">Optional single occurrence. Zero or at most one matching record.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                  <div className="text-xs font-bold text-sky-600 dark:text-sky-400">One or Many (1..N)</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1">
                    <div className="font-mono font-bold text-sky-700 dark:text-sky-300 text-sm">&gt;| (Fork + Tick)</div>
                    <p className="text-[11px]">Mandatory plural occurrence. At least one, up to many records.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                  <div className="text-xs font-bold text-sky-600 dark:text-sky-400">Zero or Many (0..N)</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1">
                    <div className="font-mono font-bold text-sky-700 dark:text-sky-300 text-sm">o&lt; (Ring + Fork)</div>
                    <p className="text-[11px]">Optional plural occurrence. Zero, one, or multiple records.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'uml' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-purple-950 dark:text-purple-200">
                    UML Class Diagram Notation (OMG UML 2.5)
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-bold">
                    Object-Oriented Standard
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  Used across Object-Oriented Software Engineering and Domain-Driven Design (DDD). Uses 3-compartment class rectangles (Stereotype & Name, Attributes, Operations & Constraints) with explicit multiplicity bounds.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                  <div className="text-xs font-bold text-purple-600 dark:text-purple-400">3-Compartment Class Box</div>
                  <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300 font-mono text-[11px]">
                    <div className="p-1 rounded bg-zinc-200/50 dark:bg-zinc-800">«Entity» Customer</div>
                    <div className="p-1 rounded bg-zinc-200/50 dark:bg-zinc-800">+ id: int<br />+ name: string</div>
                    <div className="p-1 rounded bg-zinc-200/50 dark:bg-zinc-800">+ validate()</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                  <div className="text-xs font-bold text-purple-600 dark:text-purple-400">Multiplicity Bounds</div>
                  <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                    <div><code>0..1</code> : Zero or one</div>
                    <div><code>1..1</code> : Exactly one</div>
                    <div><code>0..*</code> : Zero or many</div>
                    <div><code>1..*</code> : One or many</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                  <div className="text-xs font-bold text-purple-600 dark:text-purple-400">Inheritance & Composition</div>
                  <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                    <div><strong>Generalization:</strong> Hollow triangle pointing to Superclass</div>
                    <div><strong>Composition:</strong> Filled diamond for Weak entity relationship</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'minmax' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                    Min-Max Notation (ISO / Merise)
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold">
                    ISO Conceptual Constraint Standard
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  Explicitly states the minimum and maximum participation constraint pair <code>(min, max)</code> next to each participating entity. <code>min = 0</code> denotes partial participation; <code>min = 1</code> denotes total participation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">(0, 1)</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-300">
                    <strong>Partial + Single:</strong> Entity may participate at most once (optional).
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">(1, 1)</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-300">
                    <strong>Total + Single:</strong> Entity must participate exactly once (mandatory).
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">(0, N)</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-300">
                    <strong>Partial + Many:</strong> Optional participation in zero to unbounded instances.
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">(1, N)</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-300">
                    <strong>Total + Many:</strong> Mandatory participation in at least one or more instances.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Comparison Cross-Table */}
          <div className="space-y-2.5 pt-2">
            <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              Cross-Notation Equivalence Reference Matrix
            </div>
            <div className="overflow-x-auto rounded-2xl border border-black/[0.08] dark:border-white/[0.08]">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 dark:bg-zinc-900 font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
                  <tr>
                    <th className="p-2.5">Constraint Meaning</th>
                    <th className="p-2.5">Chen ER</th>
                    <th className="p-2.5">Crow&apos;s Foot</th>
                    <th className="p-2.5">UML</th>
                    <th className="p-2.5">Min-Max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06] font-mono text-[11px]">
                  <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                    <td className="p-2.5 font-sans font-medium text-zinc-800 dark:text-zinc-200">Mandatory 1 (Total One)</td>
                    <td className="p-2.5 text-blue-600 dark:text-blue-400">1 + double line</td>
                    <td className="p-2.5 text-sky-600 dark:text-sky-400">|| (two ticks)</td>
                    <td className="p-2.5 text-purple-600 dark:text-purple-400">1..1</td>
                    <td className="p-2.5 text-emerald-600 dark:text-emerald-400">(1, 1)</td>
                  </tr>
                  <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                    <td className="p-2.5 font-sans font-medium text-zinc-800 dark:text-zinc-200">Optional 1 (Partial One)</td>
                    <td className="p-2.5 text-blue-600 dark:text-blue-400">1 + single line</td>
                    <td className="p-2.5 text-sky-600 dark:text-sky-400">o| (ring + tick)</td>
                    <td className="p-2.5 text-purple-600 dark:text-purple-400">0..1</td>
                    <td className="p-2.5 text-emerald-600 dark:text-emerald-400">(0, 1)</td>
                  </tr>
                  <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                    <td className="p-2.5 font-sans font-medium text-zinc-800 dark:text-zinc-200">Mandatory Many (Total Many)</td>
                    <td className="p-2.5 text-blue-600 dark:text-blue-400">N + double line</td>
                    <td className="p-2.5 text-sky-600 dark:text-sky-400">&gt;| (fork + tick)</td>
                    <td className="p-2.5 text-purple-600 dark:text-purple-400">1..*</td>
                    <td className="p-2.5 text-emerald-600 dark:text-emerald-400">(1, N)</td>
                  </tr>
                  <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                    <td className="p-2.5 font-sans font-medium text-zinc-800 dark:text-zinc-200">Optional Many (Partial Many)</td>
                    <td className="p-2.5 text-blue-600 dark:text-blue-400">N + single line</td>
                    <td className="p-2.5 text-sky-600 dark:text-sky-400">o&lt; (ring + fork)</td>
                    <td className="p-2.5 text-purple-600 dark:text-purple-400">0..*</td>
                    <td className="p-2.5 text-emerald-600 dark:text-emerald-400">(0, N)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-black/[0.06] dark:border-white/[0.06] bg-zinc-50 dark:bg-zinc-900/70">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>Switch notations at any time in Studio or Practice from the top taskbar</span>
          </div>

          <div className="flex items-center gap-2">
            {onSelectNotation && (
              <button
                type="button"
                onClick={() => {
                  onSelectNotation(activeTab);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all cursor-pointer"
              >
                <span>Switch to {NOTATION_DEFINITIONS[activeTab].shortLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-black/[0.08] dark:border-white/[0.08] hover:bg-zinc-100 dark:hover:bg-zinc-750 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotationLegendModal;
