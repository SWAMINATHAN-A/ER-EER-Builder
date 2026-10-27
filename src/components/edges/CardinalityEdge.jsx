import { useState, useRef, useEffect, memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
} from 'reactflow';
import {
  Trash2,
  Check,
  X,
  Layers,
  ArrowRight,
  Hash,
} from 'lucide-react';
import { useDiagram } from '../../context/DiagramContext.jsx';

const CARDINALITY_PRESETS = [
  { group: 'Standard ER (Chen)', items: ['1', 'N', 'M', 'P'] },
  { group: 'Min-Max (ISO/Merise)', items: ['(0,1)', '(1,1)', '(0,N)', '(1,N)', '(0,M)', '(1,M)'] },
  { group: 'Crow\'s Foot Markers', items: ['|| (1)', 'o| (0..1)', '>| (1..N)', 'o< (0..N)'] },
  { group: 'UML Multiplicity', items: ['0..1', '1..1', '0..*', '1..*'] },
  { group: 'EER Hierarchy', items: ['ISA', 'Total ISA', 'Subclass', 'Superclass'] },
];

function CrowsFootMarkerSvg({ type, x, y, angle = 0, color = '#0284c7' }) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${angle})`}>
      {type === 'one' && (
        <g stroke={color} strokeWidth="2" strokeLinecap="round">
          <line x1="-12" y1="-7" x2="-12" y2="7" />
          <line x1="-6" y1="-7" x2="-6" y2="7" />
        </g>
      )}
      {type === 'zeroOrOne' && (
        <g stroke={color} strokeWidth="2" strokeLinecap="round">
          <circle cx="-14" cy="0" r="5" fill="white" className="dark:fill-[#161618]" />
          <line x1="-5" y1="-7" x2="-5" y2="7" />
        </g>
      )}
      {type === 'oneOrMany' && (
        <g stroke={color} strokeWidth="2" strokeLinecap="round">
          <line x1="-16" y1="-7" x2="-16" y2="7" />
          <path d="M -10 -7 L 0 0 L -10 7 M 0 0 L -10 0" fill="none" />
        </g>
      )}
      {type === 'zeroOrMany' && (
        <g stroke={color} strokeWidth="2" strokeLinecap="round">
          <circle cx="-16" cy="0" r="4.5" fill="white" className="dark:fill-[#161618]" />
          <path d="M -8 -7 L 0 0 L -8 7 M 0 0 L -8 0" fill="none" />
        </g>
      )}
    </g>
  );
}

export const CardinalityEdge = memo(function CardinalityEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data = {},
  label,
  selected,
  markerEnd,
  pathOptions,
}) {
  const { setEdges, nodes } = useDiagram();
  const [isOpen, setIsOpen] = useState(false);
  const [customInput, setCustomInput] = useState(label || '');
  const [isHovered, setIsHovered] = useState(false);
  const popoverRef = useRef(null);
  const inputRef = useRef(null);

  const notation = data?.notation || 'chen';
  const isCrowsFoot = notation === 'crowsfoot';
  const isUml = notation === 'uml';
  const isMinMax = notation === 'minmax';

  const isTotal = Boolean(data?.isTotal || data?.participation === 'total' || data?.doubleLine);
  const strokeColor = selected
    ? '#0071E3'
    : isTotal
    ? '#9333ea'
    : isCrowsFoot
    ? '#0284c7'
    : isUml
    ? '#475569'
    : style.stroke || '#64748b';

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: pathOptions?.borderRadius || 8,
    offset: pathOptions?.offset || 20,
  });

  let secondPath = null;
  if (isTotal && !isCrowsFoot && !isUml) {
    const [offsetPath] = getSmoothStepPath({
      sourceX: sourceX + (sourcePosition === 'left' || sourcePosition === 'right' ? 0 : 4),
      sourceY: sourceY + (sourcePosition === 'top' || sourcePosition === 'bottom' ? 0 : 4),
      sourcePosition,
      targetX: targetX + (targetPosition === 'left' || targetPosition === 'right' ? 0 : 4),
      targetY: targetY + (targetPosition === 'top' || targetPosition === 'bottom' ? 0 : 4),
      borderRadius: pathOptions?.borderRadius || 8,
      offset: (pathOptions?.offset || 20) + 4,
    });
    secondPath = offsetPath;
  }

  useEffect(() => {
    setCustomInput(label || '');
  }, [label]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelectCardinality = (newLabel) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === id) {
          const isTotalPreset = newLabel === 'Total ISA';
          return {
            ...edge,
            label: newLabel,
            data: {
              ...edge.data,
              cardinality: newLabel,
              ...(isTotalPreset ? { isTotal: true } : {}),
            },
          };
        }
        return edge;
      })
    );
    setCustomInput(newLabel);
    setIsOpen(false);
  };

  const handleToggleTotal = (e) => {
    e.stopPropagation();
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === id) {
          return {
            ...edge,
            data: {
              ...edge.data,
              isTotal: !isTotal,
            },
          };
        }
        return edge;
      })
    );
  };

  const handleSaveCustom = (e) => {
    e?.preventDefault();
    const trimmed = customInput.trim();
    handleSelectCardinality(trimmed);
  };

  const handleClearLabel = (e) => {
    e.stopPropagation();
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === id) {
          const { cardinality, ...restData } = edge.data || {};
          return {
            ...edge,
            label: '',
            data: restData,
          };
        }
        return edge;
      })
    );
    setCustomInput('');
    setIsOpen(false);
  };

  const handleDeleteEdge = (e) => {
    e.stopPropagation();
    setEdges((eds) => eds.filter((edge) => edge.id !== id));
  };

  const sourceNode = nodes.find((n) => n.id === source);
  const targetNode = nodes.find((n) => n.id === target);
  const sourceName = sourceNode?.data?.label || source;
  const targetName = targetNode?.data?.label || target;

  const currentLabel = label || data?.cardinality || '';

  let badgeColorClass =
    'bg-white/95 dark:bg-[#1C1C1E]/95 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700';
  if (isMinMax) {
    badgeColorClass =
      'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-mono font-bold';
  } else if (isCrowsFoot) {
    badgeColorClass =
      'bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700 font-bold';
  } else if (isUml) {
    badgeColorClass =
      'bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700 font-mono text-[10px] font-bold';
  } else if (currentLabel === '1' || currentLabel === '(1,1)' || currentLabel === '1..1') {
    badgeColorClass =
      'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 font-bold';
  } else if (
    currentLabel === 'N' ||
    currentLabel === 'M' ||
    currentLabel === 'P' ||
    currentLabel.includes('N') ||
    currentLabel.includes('M') ||
    currentLabel.includes('*')
  ) {
    badgeColorClass =
      'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-bold';
  } else if (currentLabel.toLowerCase().includes('isa') || currentLabel.toLowerCase().includes('sub') || currentLabel.toLowerCase().includes('super')) {
    badgeColorClass =
      'bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700 font-bold';
  }

  const getTargetAngle = () => {
    if (targetPosition === 'left') return 0;
    if (targetPosition === 'right') return 180;
    if (targetPosition === 'top') return 90;
    return -90;
  };

  const getSourceAngle = () => {
    if (sourcePosition === 'left') return 180;
    if (sourcePosition === 'right') return 0;
    if (sourcePosition === 'top') return -90;
    return 90;
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth: selected ? 2.5 : isTotal ? 2.5 : style.strokeWidth || 2,
        }}
      />

      {isTotal && secondPath && !isCrowsFoot && !isUml && (
        <path
          d={secondPath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={selected ? 2.5 : 2}
          className="react-flow__edge-path"
        />
      )}

      {/* Crow's Foot Terminal SVG Markers */}
      {isCrowsFoot && data?.targetMarker && (
        <CrowsFootMarkerSvg
          type={data.targetMarker}
          x={targetX}
          y={targetY}
          angle={getTargetAngle()}
          color={strokeColor}
        />
      )}
      {isCrowsFoot && data?.sourceMarker && (
        <CrowsFootMarkerSvg
          type={data.sourceMarker}
          x={sourceX}
          y={sourceY}
          angle={getSourceAngle()}
          color={strokeColor}
        />
      )}

      {/* UML Generalization Hollow Triangle */}
      {isUml && data?.isGeneralization && (
        <g transform={`translate(${targetX}, ${targetY}) rotate(${getTargetAngle()})`}>
          <polygon
            points="-14,-8 0,0 -14,8"
            fill="white"
            stroke="#7c3aed"
            strokeWidth="2"
            className="dark:fill-[#18181B]"
          />
        </g>
      )}

      {/* UML Composition Solid Diamond */}
      {isUml && data?.isComposition && (
        <g transform={`translate(${sourceX}, ${sourceY}) rotate(${getSourceAngle()})`}>
          <polygon
            points="0,0 -8,-5 -16,0 -8,5"
            fill="#1e293b"
            stroke="#1e293b"
            strokeWidth="1.5"
            className="dark:fill-zinc-300 dark:stroke-zinc-300"
          />
        </g>
      )}

      {/* Interactive Cardinality Chip */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan z-30"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {currentLabel ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen((prev) => !prev);
              }}
              title={`Notation: ${notation.toUpperCase()} | Cardinality: ${currentLabel} between ${sourceName} and ${targetName}`}
              className={`group flex items-center gap-1 px-2.5 py-0.5 rounded-full border shadow-sm backdrop-blur-md transition-all duration-150 cursor-pointer select-none active:scale-95 ${badgeColorClass} ${
                selected ? 'ring-2 ring-[#0071E3] ring-offset-1 dark:ring-offset-black' : 'hover:scale-105'
              }`}
            >
              <span>{currentLabel}</span>
              {isTotal && !isCrowsFoot && !isUml && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 ring-1 ring-purple-300 dark:ring-purple-700" title="Total Participation" />
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
              }}
              title={`Add cardinality between ${sourceName} and ${targetName}`}
              className={`flex items-center justify-center h-5 px-1.5 rounded-full border border-dashed text-[10px] font-medium backdrop-blur-md transition-all duration-150 cursor-pointer ${
                isHovered || selected
                  ? 'opacity-100 bg-white dark:bg-[#1C1C1E] border-blue-400 text-blue-600 dark:text-blue-400 shadow-sm scale-100'
                  : 'opacity-0 hover:opacity-100 scale-90 hover:scale-100 bg-white/80 dark:bg-[#1C1C1E]/80 border-zinc-300 dark:border-zinc-700 text-zinc-500'
              }`}
            >
              <span>+ card</span>
            </button>
          )}

          {/* Cardinality Selector Popover */}
          {isOpen && (
            <div
              ref={popoverRef}
              onClick={(e) => e.stopPropagation()}
              className="absolute left-1/2 top-7 -translate-x-1/2 w-64 p-3 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/[0.08] dark:border-white/[0.08] shadow-xl backdrop-blur-2xl z-50 text-left space-y-2.5 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-black/[0.06] dark:border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  <Hash className="w-3.5 h-3.5 text-blue-500" />
                  <span>Set Cardinality</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 px-1">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[85px]">{sourceName}</span>
                <ArrowRight className="w-2.5 h-2.5 shrink-0" />
                <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[85px]">{targetName}</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {CARDINALITY_PRESETS.map((group) => (
                  <div key={group.group} className="space-y-1">
                    <div className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      {group.group}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {group.items.map((item) => {
                        const cleanVal = item.split(' ')[0];
                        const isActive = currentLabel === item || currentLabel === cleanVal;
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => handleSelectCardinality(cleanVal)}
                            className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                              isActive
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-black/[0.06] dark:border-white/[0.08] hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300'
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-1.5 border-t border-black/[0.06] dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={handleToggleTotal}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    isTotal
                      ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                      : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-black/[0.06] dark:border-white/[0.08] hover:bg-zinc-100 dark:hover:bg-zinc-750'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Total Participation (Double Line)</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isTotal ? 'bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-200' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'}`}>
                    {isTotal ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>

              <form onSubmit={handleSaveCustom} className="flex gap-1.5 pt-1">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Custom (e.g. 1..5, (1,N))"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="flex-1 px-2.5 py-1 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.08] text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="flex items-center justify-between pt-1 border-t border-black/[0.06] dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={handleClearLabel}
                  className="text-[11px] font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
                >
                  Clear Label
                </button>
                <button
                  type="button"
                  onClick={handleDeleteEdge}
                  className="flex items-center gap-1 text-[11px] font-medium text-red-600 hover:text-red-700 dark:text-red-400 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete Line</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

export default CardinalityEdge;
