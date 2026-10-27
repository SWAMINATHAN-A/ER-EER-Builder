import { useState, useEffect, useRef, memo } from 'react';
import { useDiagram } from '../../context/DiagramContext.jsx';
import { NodeHandles } from './NodeHandles.jsx';
import { Plus, Trash2 } from 'lucide-react';

export const UmlClassNode = memo(function UmlClassNode({ id, data, selected }) {
  const { updateNodeLabel, addAttributeToEntity, deleteAttribute } = useDiagram();
  const [isEditing, setIsEditing] = useState(false);
  const [labelInput, setLabelInput] = useState(data?.label || 'Class');
  const inputRef = useRef(null);

  const isWeak = Boolean(data?.isWeak);
  const isSuperclass = Boolean(data?.isSuperclass);
  const isSubclass = Boolean(data?.isSubclass);
  const attributes = data?.embeddedAttributes || [];
  const methods = data?.methods || [`+ get${data?.label || 'Entity'}Data()`, `+ validate()`];
  const constraints = data?.constraints || [];

  useEffect(() => {
    setLabelInput(data?.label || 'Class');
  }, [data?.label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commitEdit = () => {
    const trimmed = labelInput.trim();
    const finalLabel = trimmed === '' ? 'Class' : trimmed;
    setLabelInput(finalLabel);
    setIsEditing(false);
    updateNodeLabel(id, finalLabel);
  };

  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      setLabelInput(data?.label || 'Class');
      setIsEditing(false);
    }
  };

  return (
    <div
      id={`uml-class-node-${id}`}
      onDoubleClick={() => setIsEditing(true)}
      className={`min-w-[200px] max-w-[280px] rounded-lg border-2 bg-white dark:bg-[#18181B] text-zinc-900 dark:text-zinc-100 shadow-sm select-none overflow-hidden transition-all duration-200 ${
        isWeak
          ? 'border-indigo-600 dark:border-indigo-400'
          : isSuperclass
          ? 'border-blue-700 dark:border-blue-400'
          : isSubclass
          ? 'border-cyan-700 dark:border-cyan-400'
          : 'border-zinc-800 dark:border-zinc-400'
      } ${selected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-black shadow-md' : ''}`}
    >
      <NodeHandles colorClass="!bg-zinc-800 dark:!bg-zinc-300" />

      {/* 1. Header Compartment: Stereotype & Class Name */}
      <div className="px-3 py-2 text-center bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-300 dark:border-zinc-700">
        <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 tracking-wider">
          {isWeak
            ? '«Weak Entity»'
            : isSuperclass
            ? '«Abstract / Superclass»'
            : isSubclass
            ? '«Subclass»'
            : '«Entity»'}
        </div>
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
            className="nodrag nopan w-full text-center text-xs font-bold bg-transparent border-b border-blue-500 outline-none px-1"
          />
        ) : (
          <div className="text-xs font-bold tracking-tight">{data?.label || 'Class'}</div>
        )}
      </div>

      {/* 2. Attributes Compartment */}
      <div className="px-3 py-2 text-[11px] font-mono space-y-1 border-b border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#18181B]">
        {attributes.length > 0 ? (
          attributes.map((attr) => (
            <div key={attr.id} className="group/item flex items-center justify-between gap-1">
              <span className={`truncate ${attr.isPrimary ? 'font-bold text-amber-600 dark:text-amber-400' : ''}`}>
                {attr.isPrimary ? '+ {id} ' : '+ '}
                {attr.name}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-zinc-400 shrink-0">
                  : {attr.dataType?.toLowerCase() || (attr.isPrimary ? 'int' : 'string')}
                </span>
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
          ))
        ) : (
          <div className="text-[10px] text-zinc-400 italic text-center py-0.5">
            + id: int
          </div>
        )}

        {/* Quick Add Attribute Bar */}
        <div className="pt-1 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between gap-1">
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
              const name = `${(data?.label || 'class').toLowerCase()}_id`;
              addAttributeToEntity(id, { name, isPrimary: true, dataType: 'INT' });
            }}
            className="flex-1 flex items-center justify-center gap-1 py-0.5 px-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[9px] font-semibold cursor-pointer transition-colors"
          >
            <Plus className="w-2.5 h-2.5" />
            <span>+ PK</span>
          </button>
        </div>
      </div>

      {/* 3. Operations & Constraints Compartment */}
      <div className="px-3 py-1.5 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 space-y-0.5 bg-zinc-50/50 dark:bg-zinc-900/50">
        {methods.map((method, idx) => (
          <div key={idx} className="truncate">
            {method}
          </div>
        ))}
        {constraints.map((c, idx) => (
          <div key={`c-${idx}`} className="text-purple-600 dark:text-purple-400 font-bold italic">
            {c}
          </div>
        ))}
      </div>
    </div>
  );
});

export default UmlClassNode;
