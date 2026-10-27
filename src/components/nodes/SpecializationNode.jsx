import { useState, useEffect, useRef, memo } from 'react';
import { useDiagram } from '../../context/DiagramContext.jsx';
import { NodeHandles } from './NodeHandles.jsx';

export const SpecializationNode = memo(function SpecializationNode({ id, data, selected }) {
  const { updateNodeLabel, setNodes } = useDiagram();
  const [isEditing, setIsEditing] = useState(false);
  const specType = data?.specType || 'disjoint'; // 'disjoint' (d), 'overlapping' (o), 'union' (U)
  const isTotal = Boolean(data?.isTotal); // Total specialization (double circle/line)
  const [labelInput, setLabelInput] = useState(data?.label || (specType === 'disjoint' ? 'd' : specType === 'overlapping' ? 'o' : 'U'));
  const inputRef = useRef(null);

  useEffect(() => {
    if (data?.label) {
      setLabelInput(data.label);
    } else {
      setLabelInput(specType === 'disjoint' ? 'd' : specType === 'overlapping' ? 'o' : 'U');
    }
  }, [data?.label, specType]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commitEdit = () => {
    const trimmed = labelInput.trim();
    const finalLabel = trimmed === '' ? (specType === 'disjoint' ? 'd' : specType === 'overlapping' ? 'o' : 'U') : trimmed;
    setLabelInput(finalLabel);
    setIsEditing(false);
    updateNodeLabel(id, finalLabel);
  };

  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      setLabelInput(data?.label || (specType === 'disjoint' ? 'd' : 'o'));
      setIsEditing(false);
    }
  };

  const toggleSpecType = (e) => {
    e.stopPropagation();
    const nextType = specType === 'disjoint' ? 'overlapping' : specType === 'overlapping' ? 'union' : 'disjoint';
    const nextLabel = nextType === 'disjoint' ? 'd' : nextType === 'overlapping' ? 'o' : 'U';
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            data: {
              ...n.data,
              specType: nextType,
              label: nextLabel,
            },
          };
        }
        return n;
      })
    );
  };

  const toggleTotalCompleteness = (e) => {
    e.stopPropagation();
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            data: {
              ...n.data,
              isTotal: !isTotal,
            },
          };
        }
        return n;
      })
    );
  };

  const displayChar = specType === 'disjoint' ? 'd' : specType === 'overlapping' ? 'o' : 'U';
  const typeName = specType === 'disjoint' ? 'Disjoint (d)' : specType === 'overlapping' ? 'Overlapping (o)' : 'Union / Category (U)';
  const completenessName = isTotal ? 'Total Specialization (Double Line)' : 'Partial Specialization';

  return (
    <div
      id={`node-specialization-${id}`}
      onDoubleClick={() => setIsEditing(true)}
      title={`EER Specialization: ${typeName} • ${completenessName} (Double-click to edit label, click icons to switch constraint)`}
      className="relative flex items-center justify-center w-14 h-14 cursor-pointer select-none group"
    >
      <NodeHandles colorClass="!bg-purple-600 dark:!bg-purple-400" />

      {/* Outer circle (for total specialization double circle) */}
      {isTotal && (
        <div
          className={`absolute w-13 h-13 rounded-full border-[1.5px] border-purple-500/60 dark:border-purple-400/60 pointer-events-none transition-all ${
            selected ? 'scale-105' : ''
          }`}
        />
      )}

      {/* Main circle */}
      <div
        className={`w-10 h-10 rounded-full border-[2px] border-purple-600 dark:border-purple-400 bg-white dark:bg-[#1C1C1E] flex items-center justify-center shadow-xs transition-all duration-200 ${
          selected ? 'ring-2 ring-purple-500/60 ring-offset-2 dark:ring-offset-[#000000] shadow-md' : ''
        }`}
      >
        <div className="relative z-10 flex flex-col items-center justify-center">
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
              className="nodrag nopan w-7 text-center font-serif text-sm font-bold text-purple-700 dark:text-purple-300 bg-transparent border-b border-purple-500 outline-none"
            />
          ) : (
            <span className="font-serif text-sm font-bold text-purple-700 dark:text-purple-300">
              {data?.label || displayChar}
            </span>
          )}
        </div>
      </div>

      {/* Quick toggle controls floating when selected or hovered */}
      <div className="nodrag nopan absolute -bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1 bg-zinc-900/90 dark:bg-zinc-800/95 text-white px-1.5 py-0.5 rounded-full text-[9px] font-mono shadow-md z-30 whitespace-nowrap">
        <button
          type="button"
          onClick={toggleSpecType}
          title={`Click to toggle constraint: current is ${specType}`}
          className="hover:text-purple-300 transition-colors px-1"
        >
          {specType === 'disjoint' ? 'd' : specType === 'overlapping' ? 'o' : 'U'}
        </button>
        <span className="text-zinc-500">|</span>
        <button
          type="button"
          onClick={toggleTotalCompleteness}
          title={`Click to toggle total / partial constraint (Current: ${isTotal ? 'Total / Double' : 'Partial / Single'})`}
          className={`hover:text-purple-300 transition-colors px-1 ${isTotal ? 'font-bold text-amber-300' : 'text-zinc-400'}`}
        >
          {isTotal ? 'total (double)' : 'partial'}
        </button>
      </div>
    </div>
  );
});

export default SpecializationNode;
