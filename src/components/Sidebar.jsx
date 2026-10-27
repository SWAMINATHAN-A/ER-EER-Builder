import { useState } from 'react';
import { useDiagram } from '../context/DiagramContext.jsx';
import {
  Boxes,
  Key,
  Layers,
  Database,
  Diamond,
  RotateCcw,
  Trash2,
  Hash,
  ArrowRight,
  Check,
  Table,
  Plus,
  Code2,
  GitMerge,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  Tag,
  GitFork,
  Component,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const {
    addNode,
    resetDiagram,
    clearDiagram,
    diagramMode,
    switchMode,
    selectedNotation,
    nodes,
    edges,
    updateEdgeCardinality,
    toggleEdgeParticipation,
    deleteEdge,
  } = useDiagram();
  const navigate = useNavigate();

  const isEer = diagramMode === 'eer';
  const selectedEdge = edges.find((e) => e.selected);
  const [customInput, setCustomInput] = useState('');
  const [isEerSectionOpen, setIsEerSectionOpen] = useState(true);

  const notation = (selectedNotation || 'chen').toLowerCase();
  const isChen = notation === 'chen';
  const isCrowsFoot = notation === 'crows_foot' || notation === 'crowsfoot';
  const isUml = notation === 'uml';
  const isMinMax = notation === 'min_max' || notation === 'minmax';

  const onDragStart = (event, nodeType, customData = {}) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.setData('application/reactflow/custom', JSON.stringify(customData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleQuickAdd = (type, label, customData = {}) => {
    const x = 300 + Math.floor(Math.random() * 100);
    const y = 180 + Math.floor(Math.random() * 100);
    addNode(type, { x, y }, label, customData);
  };

  const sourceNode = selectedEdge ? nodes.find((n) => n.id === selectedEdge.source) : null;
  const targetNode = selectedEdge ? nodes.find((n) => n.id === selectedEdge.target) : null;
  const isSelectedEdgeTotal = Boolean(
    selectedEdge?.data?.isTotal || selectedEdge?.data?.participation === 'total' || selectedEdge?.data?.doubleLine
  );

  return (
    <aside
      id="builder-sidebar"
      className="w-64 border-r border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#161618] flex flex-col h-full select-none z-10 shrink-0"
    >
      <div className="p-3 border-b border-black/[0.06] dark:border-white/[0.06] bg-zinc-50 dark:bg-zinc-900/40 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {isEer ? (
              <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            ) : (
              <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            )}
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Toolbox
            </span>
          </div>
          <button
            type="button"
            onClick={() => switchMode(isEer ? 'er' : 'eer')}
            title={`Switch modeling mode`}
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
              isEer
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-200'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-200'
            }`}
          >
            {isEer ? 'Set Mode: ER' : 'Set Mode: EER'}
          </button>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
            {isChen
              ? 'Chen'
              : isCrowsFoot
              ? "Crow's Foot"
              : isUml
              ? 'UML'
              : 'Min-Max'}
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isEer
                ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20'
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
            }`}
          >
            {isEer ? 'Mode: EER (Extended)' : 'Mode: ER'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {selectedEdge && (
          <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-200">
                <Hash className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Selected Line</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold">
                {selectedEdge.label || 'No label'}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-zinc-600 dark:text-zinc-400 px-0.5">
              <span className="font-semibold text-zinc-900 dark:text-zinc-200 truncate max-w-[80px]">
                {sourceNode?.data?.label || selectedEdge.source}
              </span>
              <ArrowRight className="w-2.5 h-2.5 shrink-0 text-zinc-400" />
              <span className="font-semibold text-zinc-900 dark:text-zinc-200 truncate max-w-[80px]">
                {targetNode?.data?.label || selectedEdge.target}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {isMinMax
                  ? 'Min-Max Constraints'
                  : isUml
                  ? 'UML Multiplicity / Rel.'
                  : isCrowsFoot
                  ? 'Crow’s Foot Cardinality'
                  : 'Quick Cardinality'}
              </span>
              <div className="grid grid-cols-4 gap-1">
                {(isMinMax
                  ? ['(0,1)', '(1,1)', '(0,N)', '(1,N)', '(0,M)', '(1,M)', '1', 'N']
                  : isUml
                  ? ['1', '0..1', '1..*', '*', '0..*', 'ISA', 'Comp.', 'Aggr.']
                  : isCrowsFoot
                  ? ['1', 'N', 'M', '1..1', '1..N', '0..1', '0..N', 'M..N']
                  : ['1', 'N', 'M', 'P', '(0,1)', '(1,1)', '(0,N)', '(1,N)']
                ).map((card) => (
                  <button
                    key={card}
                    type="button"
                    onClick={() => updateEdgeCardinality(selectedEdge.id, card)}
                    className={`py-1 px-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${
                      selectedEdge.label === card
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-black/[0.08] dark:border-white/[0.08] hover:bg-blue-100 dark:hover:bg-blue-950/50'
                    }`}
                  >
                    {card}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleEdgeParticipation(selectedEdge.id)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                isSelectedEdgeTotal
                  ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-700'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-black/[0.08] dark:border-white/[0.08] hover:bg-zinc-100'
              }`}
            >
              <span className="text-[11px]">
                {isUml ? 'Composition (Filled Diamond)' : 'Total (Double Line)'}
              </span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  isSelectedEdgeTotal
                    ? 'bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {isSelectedEdgeTotal ? 'ON' : 'OFF'}
              </span>
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (customInput.trim()) {
                  updateEdgeCardinality(selectedEdge.id, customInput.trim());
                  setCustomInput('');
                }
              }}
              className="flex gap-1"
            >
              <input
                type="text"
                placeholder={isMinMax ? 'e.g. (1, 10)' : isUml ? 'e.g. 1..10' : 'Custom'}
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="flex-1 px-2 py-1 rounded-lg text-xs bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.08] text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="flex items-center justify-between pt-1 border-t border-blue-200/60 dark:border-blue-900/60">
              <button
                type="button"
                onClick={() => updateEdgeCardinality(selectedEdge.id, '')}
                className="text-[10px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
              >
                Clear Label
              </button>
              <button
                type="button"
                onClick={() => deleteEdge(selectedEdge.id)}
                className="text-[10px] text-red-600 hover:text-red-700 dark:text-red-400 font-semibold cursor-pointer flex items-center gap-0.5"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete Line</span>
              </button>
            </div>
          </div>
        )}

        {isEer && (
          <div className="border border-purple-200 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/15 rounded-2xl p-2.5 space-y-2.5 transition-all">
            <button
              type="button"
              onClick={() => setIsEerSectionOpen((prev) => !prev)}
              className="w-full flex items-center justify-between text-left cursor-pointer group"
            >
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span className="text-[11px] font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wider">
                  EER Hierarchies & Constraints
                </span>
              </div>
              {isEerSectionOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 transition-transform" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 transition-transform" />
              )}
            </button>

            {isEerSectionOpen && (
              <div className="space-y-3 pt-1 border-t border-purple-200/60 dark:border-purple-900/40">
                {(isChen || isMinMax) && (
                  <>
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 block">
                        Specialization Circles
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div
                          draggable
                          onDragStart={(e) =>
                            onDragStart(e, 'specialization', { specType: 'disjoint', isTotal: false, label: 'd' })
                          }
                          onClick={() => handleQuickAdd('specialization', 'd', { specType: 'disjoint', isTotal: false })}
                          className="group flex items-center gap-1.5 p-1.5 rounded-lg border border-purple-200 dark:border-purple-900/50 bg-white dark:bg-[#1C1C1E] hover:border-purple-500 cursor-grab active:cursor-grabbing text-xs"
                        >
                          <div className="w-4.5 h-4.5 rounded-full border border-purple-600 bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center font-serif text-[9px] font-bold text-purple-700 dark:text-purple-300 shrink-0">
                            d
                          </div>
                          <span className="text-[10px] font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                            Disjoint (d)
                          </span>
                        </div>

                        <div
                          draggable
                          onDragStart={(e) =>
                            onDragStart(e, 'specialization', { specType: 'overlapping', isTotal: false, label: 'o' })
                          }
                          onClick={() => handleQuickAdd('specialization', 'o', { specType: 'overlapping', isTotal: false })}
                          className="group flex items-center gap-1.5 p-1.5 rounded-lg border border-purple-200 dark:border-purple-900/50 bg-white dark:bg-[#1C1C1E] hover:border-purple-500 cursor-grab active:cursor-grabbing text-xs"
                        >
                          <div className="w-4.5 h-4.5 rounded-full border border-purple-600 bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center font-serif text-[9px] font-bold text-purple-700 dark:text-purple-300 shrink-0">
                            o
                          </div>
                          <span className="text-[10px] font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                            Overlap (o)
                          </span>
                        </div>

                        <div
                          draggable
                          onDragStart={(e) =>
                            onDragStart(e, 'specialization', { specType: 'union', isTotal: false, label: 'U' })
                          }
                          onClick={() => handleQuickAdd('specialization', 'U', { specType: 'union', isTotal: false })}
                          className="group flex items-center gap-1.5 p-1.5 rounded-lg border border-purple-200 dark:border-purple-900/50 bg-white dark:bg-[#1C1C1E] hover:border-purple-500 cursor-grab active:cursor-grabbing text-xs"
                        >
                          <div className="w-4.5 h-4.5 rounded-full border border-purple-600 bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center font-serif text-[9px] font-bold text-purple-700 dark:text-purple-300 shrink-0">
                            U
                          </div>
                          <span className="text-[10px] font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                            Union (U)
                          </span>
                        </div>

                        <div
                          draggable
                          onDragStart={(e) =>
                            onDragStart(e, 'specialization', { specType: 'disjoint', isTotal: true, label: 'd' })
                          }
                          onClick={() => handleQuickAdd('specialization', 'd', { specType: 'disjoint', isTotal: true })}
                          className="group flex items-center gap-1.5 p-1.5 rounded-lg border border-purple-200 dark:border-purple-900/50 bg-white dark:bg-[#1C1C1E] hover:border-purple-500 cursor-grab active:cursor-grabbing text-xs"
                        >
                          <div className="relative w-4.5 h-4.5 rounded-full border border-purple-700 p-[1px] shrink-0">
                            <div className="w-full h-full rounded-full border border-purple-500 flex items-center justify-center font-serif text-[8px] font-bold text-purple-700 dark:text-purple-300">
                              d
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                            Total (d)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 block">
                        Hierarchy Entities & Attributes
                      </span>
                      <div className="space-y-1">
                        <div
                          draggable
                          onDragStart={(e) => onDragStart(e, 'entity', { isSuperclass: true, label: 'Superclass' })}
                          onClick={() => handleQuickAdd('entity', 'Superclass', { isSuperclass: true })}
                          className="group flex items-center justify-between p-1.5 rounded-lg border border-blue-200 dark:border-blue-900/50 bg-white dark:bg-[#1C1C1E] hover:border-blue-400 cursor-grab active:cursor-grabbing text-xs"
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-3 rounded border border-blue-600 bg-blue-100 dark:bg-blue-900/80 text-[6px] font-bold text-blue-700 dark:text-blue-300 flex items-center justify-center">
                              SUP
                            </div>
                            <span className="text-[10px] font-semibold text-zinc-800 dark:text-zinc-200">
                              Superclass Entity
                            </span>
                          </div>
                          <Plus className="w-3 h-3 text-blue-500 opacity-60 group-hover:opacity-100" />
                        </div>

                        <div
                          draggable
                          onDragStart={(e) => onDragStart(e, 'entity', { isSubclass: true, label: 'Subclass' })}
                          onClick={() => handleQuickAdd('entity', 'Subclass', { isSubclass: true })}
                          className="group flex items-center justify-between p-1.5 rounded-lg border border-cyan-200 dark:border-cyan-900/50 bg-white dark:bg-[#1C1C1E] hover:border-cyan-400 cursor-grab active:cursor-grabbing text-xs"
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-3 rounded border border-cyan-600 bg-cyan-100 dark:bg-cyan-900/80 text-[6px] font-bold text-cyan-700 dark:text-cyan-300 flex items-center justify-center">
                              SUB
                            </div>
                            <span className="text-[10px] font-semibold text-zinc-800 dark:text-zinc-200">
                              Subclass Entity
                            </span>
                          </div>
                          <Plus className="w-3 h-3 text-cyan-500 opacity-60 group-hover:opacity-100" />
                        </div>

                        <div
                          draggable
                          onDragStart={(e) => onDragStart(e, 'attribute', { isMultivalued: true, label: 'phones' })}
                          onClick={() => handleQuickAdd('attribute', 'phones', { isMultivalued: true })}
                          className="group flex items-center justify-between p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-[#1C1C1E] hover:border-emerald-400 cursor-grab active:cursor-grabbing text-xs"
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="relative w-4 h-2.5 rounded-full border border-emerald-500 p-[1px]">
                              <div className="w-full h-full rounded-full border border-emerald-400" />
                            </div>
                            <span className="text-[10px] font-semibold text-zinc-800 dark:text-zinc-200">
                              Multivalued Attribute
                            </span>
                          </div>
                          <Plus className="w-3 h-3 text-emerald-500 opacity-60 group-hover:opacity-100" />
                        </div>

                        <div
                          draggable
                          onDragStart={(e) => onDragStart(e, 'attribute', { isDerived: true, label: 'age' })}
                          onClick={() => handleQuickAdd('attribute', 'age', { isDerived: true })}
                          className="group flex items-center justify-between p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-[#1C1C1E] hover:border-emerald-400 cursor-grab active:cursor-grabbing text-xs"
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-2 rounded-full border border-dashed border-emerald-500" />
                            <span className="text-[10px] font-semibold text-zinc-800 dark:text-zinc-200">
                              Derived Attribute
                            </span>
                          </div>
                          <Plus className="w-3 h-3 text-emerald-500 opacity-60 group-hover:opacity-100" />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {isCrowsFoot && (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 block">
                        Hierarchy Tables
                      </span>
                      <div
                        draggable
                        onDragStart={(e) =>
                          onDragStart(e, 'entity', {
                            label: 'Vehicle',
                            isSuperclass: true,
                            defaultAttributes: [
                              { name: 'vin', isPrimary: true, dataType: 'VARCHAR' },
                              { name: 'vehicle_type', isDiscriminator: true, dataType: 'VARCHAR' },
                              { name: 'make', dataType: 'VARCHAR' },
                            ],
                          })
                        }
                        onClick={() =>
                          handleQuickAdd('entity', 'Vehicle', {
                            isSuperclass: true,
                            defaultAttributes: [
                              { name: 'vin', isPrimary: true, dataType: 'VARCHAR' },
                              { name: 'vehicle_type', isDiscriminator: true, dataType: 'VARCHAR' },
                              { name: 'make', dataType: 'VARCHAR' },
                            ],
                          })
                        }
                        className="group flex items-center justify-between p-2 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-white dark:bg-[#1C1C1E] hover:border-sky-400 transition-all cursor-grab active:cursor-grabbing text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-4.5 rounded border border-sky-600 bg-sky-100 dark:bg-sky-900/60 text-[6px] font-black text-sky-700 dark:text-sky-300 flex items-center justify-center">
                            SUP
                          </div>
                          <div>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 block text-[10px]">
                              Supertype Table
                            </span>
                            <span className="text-[8px] text-zinc-500">Includes Discriminator</span>
                          </div>
                        </div>
                        <Plus className="w-3 h-3 text-sky-500 opacity-60 group-hover:opacity-100" />
                      </div>

                      <div
                        draggable
                        onDragStart={(e) =>
                          onDragStart(e, 'entity', {
                            label: 'Car',
                            isSubclass: true,
                            defaultAttributes: [
                              { name: 'vin', isPrimary: true, dataType: 'VARCHAR' },
                              { name: 'num_doors', dataType: 'INT' },
                            ],
                          })
                        }
                        onClick={() =>
                          handleQuickAdd('entity', 'Car', {
                            isSubclass: true,
                            defaultAttributes: [
                              { name: 'vin', isPrimary: true, dataType: 'VARCHAR' },
                              { name: 'num_doors', dataType: 'INT' },
                            ],
                          })
                        }
                        className="group flex items-center justify-between p-2 rounded-xl border border-cyan-200 dark:border-cyan-900/60 bg-white dark:bg-[#1C1C1E] hover:border-cyan-400 transition-all cursor-grab active:cursor-grabbing text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-4.5 rounded border border-cyan-600 bg-cyan-100 dark:bg-cyan-900/60 text-[6px] font-black text-cyan-700 dark:text-cyan-300 flex items-center justify-center">
                            SUB
                          </div>
                          <div>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 block text-[10px]">
                              Subtype Table
                            </span>
                            <span className="text-[8px] text-zinc-500">Inherited FK/PK</span>
                          </div>
                        </div>
                        <Plus className="w-3 h-3 text-cyan-500 opacity-60 group-hover:opacity-100" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-purple-500" />
                        Constraint Tags
                      </span>
                      <div className="grid grid-cols-2 gap-1">
                        {[
                          '{disjoint, complete}',
                          '{overlapping, incomplete}',
                          '{disjoint, incomplete}',
                          '{overlapping, complete}',
                        ].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              if (selectedEdge) {
                                updateEdgeCardinality(selectedEdge.id, tag);
                              }
                            }}
                            title="Click to apply to selected connector line"
                            className="p-1 rounded-md text-[9px] font-mono font-semibold bg-white dark:bg-zinc-800 border border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950/60 transition-colors text-center cursor-pointer truncate"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {isUml && (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 block">
                        Advanced Class Types
                      </span>
                      <div
                        draggable
                        onDragStart={(e) =>
                          onDragStart(e, 'entity', {
                            label: 'Account',
                            isSuperclass: true,
                            defaultAttributes: [
                              { name: 'accountNo', isPrimary: true, dataType: 'VARCHAR' },
                              { name: 'balance', dataType: 'DECIMAL' },
                            ],
                            methods: ['+ getBalance(): decimal'],
                          })
                        }
                        onClick={() =>
                          handleQuickAdd('entity', 'Account', {
                            isSuperclass: true,
                            defaultAttributes: [
                              { name: 'accountNo', isPrimary: true, dataType: 'VARCHAR' },
                              { name: 'balance', dataType: 'DECIMAL' },
                            ],
                            methods: ['+ getBalance(): decimal'],
                          })
                        }
                        className="group flex items-center justify-between p-2 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-[#1C1C1E] hover:border-blue-400 transition-all cursor-grab active:cursor-grabbing text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-4.5 rounded border border-blue-600 bg-blue-100 dark:bg-blue-900/60 text-[6px] font-bold text-blue-700 dark:text-blue-300 flex items-center justify-center">
                            ABS
                          </div>
                          <div>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 block text-[10px]">
                              «Abstract» Class
                            </span>
                            <span className="text-[8px] text-zinc-500">Root inheritance class</span>
                          </div>
                        </div>
                        <Plus className="w-3 h-3 text-blue-500 opacity-60 group-hover:opacity-100" />
                      </div>

                      <div
                        draggable
                        onDragStart={(e) =>
                          onDragStart(e, 'entity', {
                            label: 'SavingsAccount',
                            isSubclass: true,
                            defaultAttributes: [
                              { name: 'interestRate', dataType: 'DECIMAL' },
                            ],
                            methods: ['+ calculateInterest()'],
                          })
                        }
                        onClick={() =>
                          handleQuickAdd('entity', 'SavingsAccount', {
                            isSubclass: true,
                            defaultAttributes: [
                              { name: 'interestRate', dataType: 'DECIMAL' },
                            ],
                            methods: ['+ calculateInterest()'],
                          })
                        }
                        className="group flex items-center justify-between p-2 rounded-xl border border-cyan-200 dark:border-cyan-900/60 bg-white dark:bg-[#1C1C1E] hover:border-cyan-400 transition-all cursor-grab active:cursor-grabbing text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-4.5 rounded border border-cyan-600 bg-cyan-100 dark:bg-cyan-900/60 text-[6px] font-bold text-cyan-700 dark:text-cyan-300 flex items-center justify-center">
                            SUB
                          </div>
                          <div>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 block text-[10px]">
                              «Subclass» Spec.
                            </span>
                            <span className="text-[8px] text-zinc-500">Derived specialized class</span>
                          </div>
                        </div>
                        <Plus className="w-3 h-3 text-cyan-500 opacity-60 group-hover:opacity-100" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-indigo-500" />
                        Generalization Set Constraints
                      </span>
                      <div className="grid grid-cols-2 gap-1">
                        {[
                          '{disjoint, complete}',
                          '{overlapping, complete}',
                          '{disjoint, incomplete}',
                          '{overlapping, incomplete}',
                        ].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              if (selectedEdge) {
                                updateEdgeCardinality(selectedEdge.id, tag);
                              }
                            }}
                            title="Click to apply to selected connector line"
                            className="p-1 rounded-md text-[9px] font-mono font-semibold bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition-colors text-center cursor-pointer truncate"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {(isChen || isMinMax) && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Boxes className="w-3 h-3 text-blue-500" />
              Entity Types
            </h4>
            <div className="space-y-1.5">
              <div
                draggable
                onDragStart={(e) => onDragStart(e, 'entity', { label: 'Entity' })}
                onClick={() => handleQuickAdd('entity', 'Entity')}
                className="group flex items-center justify-between p-2 rounded-xl border border-black/[0.08] dark:border-white/[0.08] hover:border-[#0071E3] dark:hover:border-[#0A84FF] bg-white dark:bg-[#1C1C1E] transition-all cursor-grab active:cursor-grabbing text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-3.5 rounded border border-[#0071E3] dark:border-[#0A84FF] bg-blue-50/50 dark:bg-blue-950/30" />
                  <div>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 block text-[11px]">
                      Regular Entity
                    </span>
                    <span className="text-[9px] text-zinc-500">Standard table node</span>
                  </div>
                </div>
                <span className="text-[9px] text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 font-medium">
                  + Add
                </span>
              </div>

              <div
                draggable
                onDragStart={(e) => onDragStart(e, 'entity', { isWeak: true, label: 'WeakEntity' })}
                onClick={() => handleQuickAdd('entity', 'WeakEntity', { isWeak: true })}
                className="group flex items-center justify-between p-2 rounded-xl border border-black/[0.08] dark:border-white/[0.08] hover:border-indigo-500 bg-white dark:bg-[#1C1C1E] transition-all cursor-grab active:cursor-grabbing text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="relative w-4.5 h-3.5 rounded border border-indigo-500 p-0.5">
                    <div className="w-full h-full rounded-xs border border-indigo-400" />
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 block text-[11px]">
                      Weak Entity
                    </span>
                    <span className="text-[9px] text-zinc-500">Double rectangle</span>
                  </div>
                </div>
                <span className="text-[9px] text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 font-medium">
                  + Add
                </span>
              </div>
            </div>
          </div>
        )}

        {(isChen || isMinMax) && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Key className="w-3 h-3 text-emerald-500" />
              Attributes
            </h4>
            <div className="space-y-1.5">
              <div
                draggable
                onDragStart={(e) => onDragStart(e, 'attribute', { isPrimary: true, label: 'id' })}
                onClick={() => handleQuickAdd('attribute', 'id', { isPrimary: true })}
                className="group flex items-center justify-between p-2 rounded-xl border border-black/[0.08] dark:border-white/[0.08] hover:border-emerald-500 bg-white dark:bg-[#1C1C1E] transition-all cursor-grab active:cursor-grabbing text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-2.5 rounded-full border border-emerald-500 flex items-center justify-center">
                    <Key className="w-2 h-2 text-amber-500" />
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 block text-[11px]">
                      Primary Key
                    </span>
                    <span className="text-[9px] text-zinc-500">Underlined identifier</span>
                  </div>
                </div>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 font-medium">
                  + Add
                </span>
              </div>

              <div
                draggable
                onDragStart={(e) => onDragStart(e, 'attribute', { label: 'name' })}
                onClick={() => handleQuickAdd('attribute', 'name')}
                className="group flex items-center justify-between p-2 rounded-xl border border-black/[0.08] dark:border-white/[0.08] hover:border-emerald-500 bg-white dark:bg-[#1C1C1E] transition-all cursor-grab active:cursor-grabbing text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-2.5 rounded-full border border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30" />
                  <div>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 block text-[11px]">
                      Simple Attribute
                    </span>
                    <span className="text-[9px] text-zinc-500">Normal oval</span>
                  </div>
                </div>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 font-medium">
                  + Add
                </span>
              </div>
            </div>
          </div>
        )}

        {(isChen || isMinMax) && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Diamond className="w-3 h-3 text-amber-500" />
              Relationships
            </h4>
            <div className="space-y-1.5">
              <div
                draggable
                onDragStart={(e) => onDragStart(e, 'relationship', { label: 'Relates' })}
                onClick={() => handleQuickAdd('relationship', 'Relates')}
                className="group flex items-center justify-between p-2 rounded-xl border border-black/[0.08] dark:border-white/[0.08] hover:border-amber-500 bg-white dark:bg-[#1C1C1E] transition-all cursor-grab active:cursor-grabbing text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rotate-45 border border-amber-500 bg-amber-50/50 dark:bg-amber-950/30" />
                  <div>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 block text-[11px]">
                      Relationship
                    </span>
                    <span className="text-[9px] text-zinc-500">Diamond node</span>
                  </div>
                </div>
                <span className="text-[9px] text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 font-medium">
                  + Add
                </span>
              </div>

              <div
                draggable
                onDragStart={(e) =>
                  onDragStart(e, 'relationship', { isIdentifying: true, label: 'Identifies' })
                }
                onClick={() => handleQuickAdd('relationship', 'Identifies', { isIdentifying: true })}
                className="group flex items-center justify-between p-2 rounded-xl border border-black/[0.08] dark:border-white/[0.08] hover:border-amber-500 bg-white dark:bg-[#1C1C1E] transition-all cursor-grab active:cursor-grabbing text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="relative w-4 h-4 rotate-45 border border-amber-500 p-0.5">
                    <div className="w-full h-full border border-amber-400" />
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 block text-[11px]">
                      Identifying Rel.
                    </span>
                    <span className="text-[9px] text-zinc-500">Double diamond</span>
                  </div>
                </div>
                <span className="text-[9px] text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 font-medium">
                  + Add
                </span>
              </div>
            </div>
          </div>
        )}

        {isCrowsFoot && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1">
                <Table className="w-3.5 h-3.5" />
                Crow's Foot Tables
              </h4>
              <div className="space-y-1.5">
                <div
                  draggable
                  onDragStart={(e) =>
                    onDragStart(e, 'entity', {
                      label: 'Customer',
                      defaultAttributes: [
                        { name: 'customer_id', isPrimary: true, dataType: 'INT' },
                        { name: 'name', dataType: 'VARCHAR' },
                        { name: 'email', dataType: 'VARCHAR' },
                      ],
                    })
                  }
                  onClick={() =>
                    handleQuickAdd('entity', 'Customer', {
                      defaultAttributes: [
                        { name: 'customer_id', isPrimary: true, dataType: 'INT' },
                        { name: 'name', dataType: 'VARCHAR' },
                        { name: 'email', dataType: 'VARCHAR' },
                      ],
                    })
                  }
                  className="group flex items-center justify-between p-2.5 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/20 hover:border-sky-400 transition-all cursor-grab active:cursor-grabbing text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-5 rounded-md border border-sky-600 bg-sky-100 dark:bg-sky-900/60 flex flex-col justify-between p-0.5">
                      <div className="w-full h-1 bg-sky-600 rounded-2xs" />
                      <div className="w-full h-0.5 bg-sky-400" />
                    </div>
                    <div>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 block text-[11px]">
                        Entity Table Card
                      </span>
                      <span className="text-[9px] text-zinc-500">Header + Attributes</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-sky-600 dark:text-sky-400 opacity-0 group-hover:opacity-100 font-semibold">
                    + Add
                  </span>
                </div>

                <div
                  draggable
                  onDragStart={(e) =>
                    onDragStart(e, 'entity', {
                      label: 'OrderItem',
                      isWeak: true,
                      defaultAttributes: [
                        { name: 'item_no', isPrimary: true, dataType: 'INT' },
                        { name: 'quantity', dataType: 'INT' },
                        { name: 'unit_price', dataType: 'DECIMAL' },
                      ],
                    })
                  }
                  onClick={() =>
                    handleQuickAdd('entity', 'OrderItem', {
                      isWeak: true,
                      defaultAttributes: [
                        { name: 'item_no', isPrimary: true, dataType: 'INT' },
                        { name: 'quantity', dataType: 'INT' },
                        { name: 'unit_price', dataType: 'DECIMAL' },
                      ],
                    })
                  }
                  className="group flex items-center justify-between p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 hover:border-indigo-400 transition-all cursor-grab active:cursor-grabbing text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-5 rounded-md border border-indigo-600 bg-indigo-100 dark:bg-indigo-900/60 flex flex-col justify-between p-0.5">
                      <div className="w-full h-1 bg-indigo-600 rounded-2xs" />
                      <div className="w-full h-0.5 bg-indigo-400" />
                    </div>
                    <div>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 block text-[11px]">
                        Dependent Table (Weak)
                      </span>
                      <span className="text-[9px] text-zinc-500">Child relation with composite PK</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 font-semibold">
                    + Add
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <GitMerge className="w-3.5 h-3.5 text-sky-500" />
                Binary Association Connectors
              </h4>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-black/[0.06] dark:border-white/[0.06] space-y-2 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">|| — ||</span>
                  <span className="text-zinc-500">Exactly One to One (1:1)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">|| — &gt;|</span>
                  <span className="text-zinc-500">One to Many (1:N Mandatory)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">|| — o&lt;</span>
                  <span className="text-zinc-500">One to Many (1:N Optional)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">o&lt; — o&lt;</span>
                  <span className="text-zinc-500">Many to Many (M:N Optional)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {isUml && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5" />
                UML Class Elements
              </h4>
              <div className="space-y-1.5">
                <div
                  draggable
                  onDragStart={(e) =>
                    onDragStart(e, 'entity', {
                      label: 'Customer',
                      defaultAttributes: [
                        { name: 'id', isPrimary: true, dataType: 'INT' },
                        { name: 'name', dataType: 'VARCHAR' },
                      ],
                      methods: ['+ getId(): int', '+ getName(): string'],
                    })
                  }
                  onClick={() =>
                    handleQuickAdd('entity', 'Customer', {
                      defaultAttributes: [
                        { name: 'id', isPrimary: true, dataType: 'INT' },
                        { name: 'name', dataType: 'VARCHAR' },
                      ],
                      methods: ['+ getId(): int', '+ getName(): string'],
                    })
                  }
                  className="group flex items-center justify-between p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/60 hover:border-indigo-400 transition-all cursor-grab active:cursor-grabbing text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-5 rounded border border-zinc-700 bg-white dark:bg-zinc-800 flex flex-col justify-between p-0.5">
                      <div className="w-full h-1 bg-zinc-300 dark:bg-zinc-600 rounded-2xs" />
                      <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-700 rounded-2xs" />
                    </div>
                    <div>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 block text-[11px]">
                        Standard Class Box
                      </span>
                      <span className="text-[9px] text-zinc-500">Name + Attributes + Ops</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 font-semibold">
                    + Add
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                Binary Association & Multiplicity
              </h4>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-black/[0.06] dark:border-white/[0.06] space-y-2 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">1</span>
                  <span className="text-zinc-500">Exactly One</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">0 .. 1</span>
                  <span className="text-zinc-500">Zero or One (Optional)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">1 .. *</span>
                  <span className="text-zinc-500">One or More (Mandatory)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">* (0..*)</span>
                  <span className="text-zinc-500">Many (Zero or More)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {isMinMax && (
          <div className="space-y-2 pt-1 border-t border-black/[0.06] dark:border-white/[0.06]">
            <h4 className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1">
              <Hash className="w-3 h-3 text-purple-500" />
              Min-Max (min, max) Constraints
            </h4>
            <div className="p-2.5 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 space-y-1.5 text-[10px] text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-800 dark:text-zinc-200">(0, 1)</span>
                <span className="text-zinc-500">Optional Single (0 or 1)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-800 dark:text-zinc-200">(1, 1)</span>
                <span className="text-zinc-500">Mandatory Single (Exact 1)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-800 dark:text-zinc-200">(0, N)</span>
                <span className="text-zinc-500">Optional Multiple (0 to N)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-800 dark:text-zinc-200">(1, N)</span>
                <span className="text-zinc-500">Mandatory Multiple (1 to N)</span>
              </div>
            </div>
          </div>
        )}

        {isChen && (
          <div className="space-y-2 pt-1 border-t border-black/[0.06] dark:border-white/[0.06]">
            <h4 className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Hash className="w-3 h-3 text-blue-500" />
              Chen Cardinality Guide
            </h4>
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-black/[0.06] dark:border-white/[0.06] space-y-1.5 text-[10px] text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">1:1, 1:N, M:N</span>
                <span className="text-zinc-500">Mapping Constraints</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">Double Line</span>
                <span className="text-purple-600 dark:text-purple-400 font-medium">Total Participation</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-black/[0.08] dark:border-white/[0.08] bg-zinc-50 dark:bg-[#161618] space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={resetDiagram}
            title={`Reset to default sample template`}
            className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.08] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-zinc-500" />
            <span>Load Sample</span>
          </button>
          <button
            type="button"
            onClick={clearDiagram}
            title="Clear canvas"
            className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.08] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
