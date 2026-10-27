import { useState, useEffect, useRef, memo } from 'react';
import { useDiagram } from '../../context/DiagramContext.jsx';
import { NodeHandles } from './NodeHandles.jsx';

export const RelationshipNode = memo(function RelationshipNode({ id, data, selected }) {
  const { updateNodeLabel } = useDiagram();
  const [isEditing, setIsEditing] = useState(false);
  const [labelInput, setLabelInput] = useState(data?.label || 'Untitled');
  const inputRef = useRef(null);

  const isIdentifying = Boolean(data?.isIdentifying);

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

  const tooltipText = data?.description
    ? `${data?.label || 'Relationship'}: ${data.description}`
    : isIdentifying
    ? `Identifying Relationship (Weak Entity): ${data?.label || 'Relationship'}`
    : data?.label || 'Relationship';

  return (
    <div
      id={`node-relationship-${id}`}
      onDoubleClick={() => setIsEditing(true)}
      title={tooltipText}
      className="relative flex items-center justify-center w-22 h-22 cursor-pointer select-none"
    >
      <NodeHandles colorClass="!bg-[#FF9500] dark:!bg-[#FF9F0A]" />

      {/* Outer Diamond */}
      <div
        className={`absolute w-[56px] h-[56px] rotate-45 rounded-[6px] border-[1.5px] border-[#FF9500] dark:border-[#FF9F0A] bg-white dark:bg-[#1C1C1E] shadow-2xs transition-all duration-200 ${
          selected ? 'ring-2 ring-[#FF9500]/50 ring-offset-2 dark:ring-offset-[#000000] shadow-md' : ''
        }`}
      />

      {/* Inner Diamond for Identifying Relationship (Double Diamond) */}
      {isIdentifying && (
        <div className="absolute w-[44px] h-[44px] rotate-45 rounded-[4px] border border-[#FF9500]/80 dark:border-[#FF9F0A]/80 pointer-events-none" />
      )}

      <div className="relative z-10 max-w-[60px] px-0.5 text-center flex flex-col items-center justify-center pointer-events-auto">
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
            className="nodrag nopan w-full text-center text-[11px] font-semibold text-zinc-900 dark:text-zinc-50 bg-transparent border-b border-[#FF9500] outline-none px-0.5 py-0.5"
          />
        ) : (
          <>
            <div className="text-[10px] font-semibold text-zinc-900 dark:text-zinc-50 break-words tracking-tight leading-tight line-clamp-2">
              {data?.label || 'Untitled'}
            </div>
            {data?.description && data.description !== data?.label && (
              <div className="text-[7.5px] text-amber-700 dark:text-amber-300 font-medium tracking-tight line-clamp-1 max-w-[54px]">
                {data.description}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

export default RelationshipNode;
