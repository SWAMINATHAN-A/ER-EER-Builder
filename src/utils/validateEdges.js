const VALID_CARDINAL_HANDLES = new Set(['top', 'bottom', 'left', 'right']);

const HANDLE_ALIAS_MAP = {
  'top-source': 'top',
  'top-target': 'top',
  'bottom-source': 'bottom',
  'bottom-target': 'bottom',
  'left-source': 'left',
  'left-target': 'left',
  'right-source': 'right',
  'right-target': 'right',
};

export function cleanHandleId(handleId) {
  if (!handleId || typeof handleId !== 'string') return null;
  const trimmed = handleId.trim();
  if (VALID_CARDINAL_HANDLES.has(trimmed)) return trimmed;
  if (HANDLE_ALIAS_MAP[trimmed]) return HANDLE_ALIAS_MAP[trimmed];
  return null;
}

export function validateEdges(nodes = [], edges = []) {
  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    return [];
  }

  const nodeMap = new Map();
  for (const node of nodes) {
    if (node && node.id) {
      nodeMap.set(node.id, node);
    }
  }

  const validatedEdges = [];
  const edgeKeys = new Set();

  for (const edge of edges) {
    if (!edge || !edge.id || !edge.source || !edge.target) {
      continue;
    }

    if (!nodeMap.has(edge.source) || !nodeMap.has(edge.target)) {
      continue;
    }

    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);

    let cleanSourceHandle = cleanHandleId(edge.sourceHandle);
    let cleanTargetHandle = cleanHandleId(edge.targetHandle);

    if (!cleanSourceHandle || !cleanTargetHandle) {
      const srcPos = sourceNode.position || { x: 0, y: 0 };
      const tgtPos = targetNode.position || { x: 0, y: 0 };
      const dx = tgtPos.x - srcPos.x;
      const dy = tgtPos.y - srcPos.y;

      if (Math.abs(dx) >= Math.abs(dy)) {
        if (!cleanSourceHandle) {
          cleanSourceHandle = dx >= 0 ? 'right' : 'left';
        }
        if (!cleanTargetHandle) {
          cleanTargetHandle = dx >= 0 ? 'left' : 'right';
        }
      } else {
        if (!cleanSourceHandle) {
          cleanSourceHandle = dy >= 0 ? 'bottom' : 'top';
        }
        if (!cleanTargetHandle) {
          cleanTargetHandle = dy >= 0 ? 'top' : 'bottom';
        }
      }
    }

    const edgeKey = `${edge.source}:${cleanSourceHandle}->${edge.target}:${cleanTargetHandle}`;
    if (edgeKeys.has(edgeKey)) {
      continue;
    }
    edgeKeys.add(edgeKey);

    validatedEdges.push({
      ...edge,
      sourceHandle: cleanSourceHandle,
      targetHandle: cleanTargetHandle,
    });
  }

  return validatedEdges;
}

export default validateEdges;
