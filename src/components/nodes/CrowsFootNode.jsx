import { useState, useEffect, useRef, memo } from 'react';
import { useDiagram } from '../../context/DiagramContext.jsx';
import { NodeHandles } from './NodeHandles.jsx';
import { Table, Plus, Trash2 } from 'lucide-react';

export const CrowsFootNode = memo(function CrowsFootNode({ id, data, selected }) {
  const { updateNodeLabel, addAttributeToEntity, deleteAttribute } = useDiagram();
  const [isEditing, setIsEditing] = useState(false);
  const [labelInput, setLabelInput] = useState(data?.label || 'Entity');
  const inputRef = useRef(null);

  const isWeak = Boolean(data?.isWeak);
  const isSuperclass = Boolean(data?.isSuperclass);
  const isSubclass = Boolean(data?.isSubclass);
  const attributes = data?.embeddedAttributes || [];

  useEffect(() => {
    setLabelInput(data?.label || 'Entity');
  }, [data?.label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commitEdit = () => {
    const trimmed = labelInput.trim();
    const finalLabel = trimmed === '' ? 'Entity' : trimmed;
    setLabelInput(finalLabel);
    setIsEditing(false);
    updateNodeLabel(id, finalLabel);
  };

  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      setLabelInput(data?.label || 'Entity');
      setIsEditing(false);
    }
  };

  const pkAttributes = attributes.filter((a) => a.isPrimary);
  const nonPkAttributes = attributes.filter((a) => !a.isPrimary);

  return (
    <div
      id={`crowsfoot-node-${id}`}
      onDoubleClick={() => setIsEditing(true)}
      className={`min-w-[190px] max-w-[260px] rounded-2xl border-[1.5px] bg-white dark:bg-[#161618] shadow-sm select-none overflow-hidden transition-all duration-200 ${
        isWeak
          ? 'border-indigo-500 dark:border-indigo-400 ring-1 ring-indigo-400/30'
          : isSuperclass
          ? 'border-blue-600 dark:border-blue-400'
          : isSubclass
          ? 'border-cyan-600 dark:border-cyan-400'
          : 'border-sky-600 dark:border-sky-500'
      } ${selected ? 'ring-2 ring-sky-500 ring-offset-2 dark:ring-offset-black shadow-md' : ''}`}
    >
      <NodeHandles colorClass="!bg-sky-600 dark:!bg-sky-400" />

      {/* Table Header */}
      <div
        className={`px-3 py-2 border-b flex items-center justify-between gap-2 ${
          isWeak
            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-900/60 text-indigo-950 dark:text-indigo-100'
            : isSuperclass
            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900/60 text-blue-950 dark:text-blue-100'
            : isSubclass
            ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-900/60 text-cyan-950 dark:text-cyan-100'
            : 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-900/60 text-sky-950 dark:text-sky-100'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <Table className="w-3.5 h-3.5 shrink-0 opacity-70" />
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="nodrag nopan w-full text-xs font-bold bg-transparent border-b border-sky-600 outline-none px-1"
            />
          ) : (
            <span className="text-xs font-extrabold truncate uppercase tracking-tight">
              {data?.label || 'Entity'}
            </span>
          )}
        </div>

        {/* Classification Tag */}
        {isWeak && (
          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-200/80 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200">
            WEAK
          </span>
        )}
        {isSuperclass && (
          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-blue-200/80 dark:bg-blue-900 text-blue-900 dark:text-blue-200">
            SUP
          </span>
        )}
        {isSubclass && (
          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-cyan-200/80 dark:bg-cyan-900 text-cyan-900 dark:text-cyan-200">
            SUB
          </span>
        )}
      </div>

      {/* Attributes Compartment */}
      <div className="p-2 space-y-1 text-[11px] font-mono">
        {pkAttributes.length > 0 && (
          <div className="space-y-0.5 pb-1 border-b border-black/[0.06] dark:border-white/[0.06]">
            {pkAttributes.map((attr) => (
              <div
                key={attr.id}
                className="group/item flex items-center justify-between gap-1.5 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-900 dark:text-amber-200 font-bold"
              >
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-[9px] font-black px-1 rounded bg-amber-500 text-white dark:text-zinc-900">
                    PK
                  </span>
                  <span className="truncate underline decoration-amber-500/60">{attr.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-zinc-400 font-normal">{attr.dataType || 'INT'}</span>
                  {attr.id && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAttribute(attr.id);
                      }}
                      className="opacity-0 group-hover/item:opacity-100 hover:text-rose-500 text-zinc-400 p-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {nonPkAttributes.length > 0 ? (
          <div className="space-y-0.5 pt-0.5">
            {nonPkAttributes.map((attr) => (
              <div
                key={attr.id}
                className="group/item flex items-center justify-between gap-1.5 px-1.5 py-0.5 rounded hover:bg-black/[0.02] dark:hover:bg-white/[0.02] text-zinc-700 dark:text-zinc-300"
              >
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-[9px] text-zinc-400 font-normal">•</span>
                  <span className={`truncate ${attr.isDerived ? 'italic text-zinc-500' : ''}`}>
                    {attr.name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-zinc-400">{attr.dataType || 'VARCHAR'}</span>
                  {attr.id && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAttribute(attr.id);
                      }}
                      className="opacity-0 group-hover/item:opacity-100 hover:text-rose-500 text-zinc-400 p-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          pkAttributes.length === 0 && (
            <div className="py-1 text-center text-[10px] text-zinc-400 italic">
              No attributes connected
            </div>
          )
        )}

        {/* Quick Add Attribute Bar */}
        <div className="pt-1.5 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const name = `attr_${attributes.length + 1}`;
              addAttributeToEntity(id, { name, isPrimary: false, dataType: 'VARCHAR' });
            }}
            className="flex-1 flex items-center justify-center gap-1 py-0.5 px-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[9px] font-semibold text-zinc-600 dark:text-zinc-300 cursor-pointer transition-colors"
          >
            <Plus className="w-2.5 h-2.5" />
            <span>Attribute</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const name = `${(data?.label || 'entity').toLowerCase()}_id`;
              addAttributeToEntity(id, { name, isPrimary: true, dataType: 'INT' });
            }}
            className="flex-1 flex items-center justify-center gap-1 py-0.5 px-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[9px] font-semibold cursor-pointer transition-colors"
          >
            <Plus className="w-2.5 h-2.5" />
            <span>+ PK</span>
          </button>
        </div>
      </div>
    </div>
  );
});

export default CrowsFootNode;
