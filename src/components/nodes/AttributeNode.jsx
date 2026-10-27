import { useState, useEffect, useRef, memo } from 'react';
import { Key } from 'lucide-react';
import { useDiagram } from '../../context/DiagramContext.jsx';
import { NodeHandles } from './NodeHandles.jsx';

export const AttributeNode = memo(function AttributeNode({ id, data, selected }) {
  const { updateNodeLabel } = useDiagram();
  const [isEditing, setIsEditing] = useState(false);
  const [labelInput, setLabelInput] = useState(data?.label || 'Untitled');
  const inputRef = useRef(null);

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

  const isPk = Boolean(data?.isPrimary || data?.isKey);
  const isMultivalued = Boolean(data?.isMultivalued);
  const isDerived = Boolean(data?.isDerived);
  const isPartialKey = Boolean(data?.isPartialKey);

  const borderClass = isDerived
    ? 'border-dashed border-2 border-[#34C759] dark:border-[#30D158]'
    : 'border-[1.5px] border-[#34C759] dark:border-[#30D158]';

  return (
    <div
      id={`node-attribute-${id}`}
      onDoubleClick={() => setIsEditing(true)}
      title={
        isPk
          ? `Primary Key: ${data?.label}`
          : isMultivalued
          ? `Multivalued Attribute: ${data?.label}`
          : isDerived
          ? `Derived Attribute: ${data?.label}`
          : isPartialKey
          ? `Partial Key: ${data?.label}`
          : `Attribute: ${data?.label}`
      }
      className={`relative min-w-[110px] max-w-[175px] min-h-[34px] px-3.5 py-1 rounded-full ${borderClass} bg-white dark:bg-[#1C1C1E] shadow-2xs hover:shadow-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer select-none ${
        selected ? 'ring-2 ring-[#34C759]/50 ring-offset-2 dark:ring-offset-[#000000] shadow-md' : ''
      }`}
    >
      <NodeHandles colorClass="!bg-[#34C759] dark:!bg-[#30D158]" />

      {/* Multivalued Double Oval Border */}
      {isMultivalued && (
        <div className="absolute inset-1 rounded-full border border-[#34C759]/80 dark:border-[#30D158]/80 pointer-events-none" />
      )}

      {isPk && (
        <Key className="w-2.5 h-2.5 text-amber-500 shrink-0" />
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
          className="nodrag nopan w-full text-center text-[11px] font-medium text-zinc-900 dark:text-zinc-50 bg-transparent border-b border-[#34C759] outline-none px-1 py-0.5"
        />
      ) : (
        <div
          className={`text-[11px] font-medium text-zinc-900 dark:text-zinc-100 tracking-tight break-words text-center leading-tight ${
            isPk
              ? 'underline decoration-amber-500/90 decoration-1 underline-offset-2 font-semibold'
              : isPartialKey
              ? 'underline decoration-dashed decoration-zinc-400 decoration-1 underline-offset-2'
              : ''
          }`}
        >
          {data?.label || 'Untitled'}
        </div>
      )}
    </div>
  );
});

export default AttributeNode;
