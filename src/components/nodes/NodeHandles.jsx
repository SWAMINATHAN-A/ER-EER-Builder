import { memo } from 'react';
import { Handle, Position } from 'reactflow';

const POSITIONS = [
  { position: Position.Top, id: 'top' },
  { position: Position.Bottom, id: 'bottom' },
  { position: Position.Left, id: 'left' },
  { position: Position.Right, id: 'right' },
];

export const NodeHandles = memo(function NodeHandles({
  colorClass = '!bg-[#0071E3] dark:!bg-[#0A84FF]',
}) {
  return (
    <>
      {POSITIONS.map(({ position, id }) => (
        <span key={id} className="contents pointer-events-auto">
          <Handle
            type="source"
            position={position}
            id={id}
            isConnectable={true}
            className={`!w-2 !h-2 hover:!scale-125 transition-transform ${colorClass} !border !border-white dark:!border-[#1C1C1E] cursor-crosshair z-20`}
          />
          <Handle
            type="target"
            position={position}
            id={id}
            isConnectable={true}
            className={`!w-2 !h-2 hover:!scale-125 transition-transform ${colorClass} !border !border-white dark:!border-[#1C1C1E] cursor-crosshair z-20`}
          />
        </span>
      ))}
    </>
  );
});

export default NodeHandles;
