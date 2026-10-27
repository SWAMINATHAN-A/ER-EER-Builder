import { useState, useEffect, useRef, memo } from 'react';
import { useDiagram } from '../../context/DiagramContext.jsx';
import { NodeHandles } from './NodeHandles.jsx';

export const EntityNode = memo(function EntityNode({ id, data, selected }) {
  const { updateNodeLabel } = useDiagram();
  const [isEditing, setIsEditing] = useState(false);
  const [labelInput, setLabelInput] = useState(data?.label || 'Untitled');
  const inputRef = useRef(null);

  const isWeak = Boolean(data?.isWeak);
  const isSuperclass = Boolean(data?.isSuperclass);
  const isSubclass = Boolean(data?.isSubclass);

  useEffect(() => {
    setLabelInput(data?.label || 'Untitled');
  }, [data?.label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commitEdit = () => {
    const trimmed = labelInput.trim();
    const finalLabel = trimmed === '' ? 'Untitled' : trimmed;
    setLabelInput(finalLabel);
    setIsEditing(false);
    updateNodeLabel(id, finalLabel);
  };

  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      setLabelInput(data?.label || 'Untitled');
      setIsEditing(false);
    }
  };

  const handleColor = isWeak
    ? '!bg-indigo-500 dark:!bg-indigo-400'
    : isSuperclass
    ? '!bg-blue-600 dark:!bg-blue-400'
    : isSubclass
    ? '!bg-cyan-600 dark:!bg-cyan-400'
    : '!bg-[#0071E3] dark:!bg-[#0A84FF]';

  return (
    <div
      id={`node-entity-${id}`}
      onDoubleClick={() => setIsEditing(true)}
      title={isWeak ? `Weak Entity: ${data?.label}` : isSuperclass ? `Superclass Entity: ${data?.label}` : isSubclass ? `Subclass Entity: ${data?.label}` : `Entity: ${data?.label}`}
      className={`relative min-w-[130px] max-w-[200px] px-4 py-2.5 rounded-xl border-[1.5px] ${
        isWeak
          ? 'border-indigo-500 dark:border-indigo-400 bg-white dark:bg-[#1C1C1E]'
          : isSuperclass
          ? 'border-blue-600 dark:border-blue-400 bg-gradient-to-b from-blue-50/40 to-white dark:from-blue-950/20 dark:to-[#1C1C1E]'
          : isSubclass
          ? 'border-cyan-600 dark:border-cyan-400 bg-gradient-to-b from-cyan-50/40 to-white dark:from-cyan-950/20 dark:to-[#1C1C1E]'
          : 'border-[#0071E3] dark:border-[#0A84FF] bg-white dark:bg-[#1C1C1E]'
      } shadow-xs hover:shadow-sm transition-all duration-200 text-center cursor-pointer select-none ${
        selected ? 'ring-2 ring-[#0071E3]/50 ring-offset-2 dark:ring-offset-[#000000] shadow-md' : ''
      }`}
    >
      <NodeHandles colorClass={handleColor} />

      {/* Weak Entity Inner Border for double-rectangle representation */}
      {isWeak && (
        <div className="absolute inset-1 rounded-lg border border-indigo-400/80 dark:border-indigo-500/80 pointer-events-none" />
      )}

      {/* Superclass / Subclass Badge */}
      {isSuperclass && (
        <span className="absolute -top-2.5 left-2 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-200 dark:border-blue-800 uppercase tracking-wider">
          Superclass
        </span>
      )}
      {isSubclass && (
        <span className="absolute -top-2.5 left-2 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200 border border-cyan-200 dark:border-cyan-800 uppercase tracking-wider">
          Subclass
        </span>
      )}

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
          onDoubleClick={(e) => e.stopPropagation()}
          className="nodrag nopan w-full text-center text-xs font-semibold text-zinc-900 dark:text-zinc-50 bg-transparent border-b border-[#0071E3] outline-none px-1 py-0.5"
        />
      ) : (
        <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight break-words leading-snug">
          {data?.label || 'Untitled'}
          {isWeak && <span className="block text-[9px] font-normal text-indigo-600 dark:text-indigo-400 mt-0.5">(Weak)</span>}
        </div>
      )}
    </div>
  );
});

export default EntityNode;
