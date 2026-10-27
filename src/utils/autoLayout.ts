import dagre from '@dagrejs/dagre';
import { validateEdges } from './validateEdges.js';

export interface NodeDimension {
  width: number;
  height: number;
}

export interface LayoutOptions {
  direction?: 'TB' | 'LR' | 'BT' | 'RL';
  nodesep?: number;
  ranksep?: number;
  marginx?: number;
  marginy?: number;
}

export function getNodeDimensions(node: any): NodeDimension {
  if (!node) {
    return { width: 160, height: 80 };
  }

  if (
    node.measured &&
    typeof node.measured.width === 'number' &&
    typeof node.measured.height === 'number' &&
    node.measured.width > 0 &&
    node.measured.height > 0
  ) {
    return { width: Math.round(node.measured.width), height: Math.round(node.measured.height) };
  }

  if (
    typeof node.width === 'number' &&
    typeof node.height === 'number' &&
    node.width > 0 &&
    node.height > 0
  ) {
    return { width: Math.round(node.width), height: Math.round(node.height) };
  }

  const type = node.type || '';
  const notation = (node.data?.notation || '').toLowerCase();
  const isUmlOrCrows =
    type === 'umlClass' ||
    type === 'crowsfootEntity' ||
    notation === 'uml' ||
    notation === 'crowsfoot' ||
    notation === 'crows_foot';

  if (isUmlOrCrows) {
    const rawAttrs =
      node.data?.attributes ||
      node.data?.embeddedAttributes ||
      node.data?.defaultAttributes ||
      [];
    const rawMethods = node.data?.methods || [];
    const attrCount = Array.isArray(rawAttrs) ? rawAttrs.length : 0;
    const methodCount = Array.isArray(rawMethods) ? rawMethods.length : 0;
    const width = 280;
    const height = Math.max(220, 100 + attrCount * 28 + methodCount * 24);
    return { width, height };
  }

  if (type === 'specialization') {
    return { width: 70, height: 70 };
  }

  if (type === 'entity' || type === 'relationship') {
    return { width: 160, height: 80 };
  }

  if (type === 'attribute') {
    return { width: 130, height: 45 };
  }

  return { width: 160, height: 80 };
}

export function getLayoutedElements(nodes: any[] = [], edges: any[] = [], options: LayoutOptions | string = {}) {
  if (!nodes || nodes.length === 0) {
    const emptyResult: any = { nodes: [], edges: edges || [] };
    emptyResult[Symbol.iterator] = function* () {
      yield emptyResult.nodes;
      yield emptyResult.edges;
    };
    return emptyResult;
  }

  const opts: LayoutOptions = typeof options === 'string' ? { direction: options as any } : (options || {});

  const safeEdges = (edges || []).filter((edge, idx, arr) => {
    if (!edge || !edge.source || !edge.target || edge.source === edge.target) return false;
    const firstIdx = arr.findIndex(
      (e) =>
        (e.source === edge.source && e.target === edge.target) ||
        (e.source === edge.target && e.target === edge.source)
    );
    return firstIdx === idx;
  });

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const dimsMap = new Map<string, NodeDimension>();

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));

  g.setGraph({
    rankdir: opts.direction || 'TB',
    nodesep: typeof opts.nodesep === 'number' ? opts.nodesep : 120,
    ranksep: typeof opts.ranksep === 'number' ? opts.ranksep : 140,
    marginx: typeof opts.marginx === 'number' ? opts.marginx : 50,
    marginy: typeof opts.marginy === 'number' ? opts.marginy : 50,
  });

  nodes.forEach((node) => {
    const dims = getNodeDimensions(node);
    dimsMap.set(node.id, dims);
    g.setNode(node.id, { width: dims.width, height: dims.height });
  });

  const specializationNodes = nodes.filter((n) => n.type === 'specialization');
  const specializationIds = new Set(specializationNodes.map((n) => n.id));
  const processedEdges = new Set<string>();

  specializationNodes.forEach((specNode) => {
    const connectedEdges = safeEdges.filter(
      (e) => e.source === specNode.id || e.target === specNode.id
    );

    connectedEdges.forEach((edge) => {
      const otherId = edge.source === specNode.id ? edge.target : edge.source;
      const otherNode = nodeMap.get(otherId);
      if (!otherNode) return;

      const isSuper =
        Boolean(otherNode.data?.isSuperclass) ||
        edge.source === otherId && !otherNode.data?.isSubclass;
      const isSub =
        Boolean(otherNode.data?.isSubclass) ||
        edge.target === otherId && !otherNode.data?.isSuperclass;

      if (isSuper && !isSub) {
        g.setEdge(otherId, specNode.id);
        processedEdges.add(edge.id);
      } else if (isSub) {
        g.setEdge(specNode.id, otherId);
        processedEdges.add(edge.id);
      } else {
        if (edge.source === otherId) {
          g.setEdge(otherId, specNode.id);
        } else {
          g.setEdge(specNode.id, otherId);
        }
        processedEdges.add(edge.id);
      }
    });
  });

  safeEdges.forEach((edge) => {
    if (processedEdges.has(edge.id)) return;

    const src = nodeMap.get(edge.source);
    const tgt = nodeMap.get(edge.target);
    if (!src || !tgt) return;

    if (src.type === 'attribute' && tgt.type !== 'attribute') {
      g.setEdge(tgt.id, src.id);
    } else if (src.type !== 'attribute' && tgt.type === 'attribute') {
      g.setEdge(src.id, tgt.id);
    } else if (src.type === 'attribute' && tgt.type === 'attribute') {
      g.setEdge(src.id, tgt.id);
    } else if (src.type === 'entity' && tgt.type === 'relationship') {
      g.setEdge(src.id, tgt.id);
    } else if (src.type === 'relationship' && tgt.type === 'entity') {
      g.setEdge(tgt.id, src.id);
    } else {
      g.setEdge(edge.source, edge.target);
    }
  });

  try {
    dagre.layout(g);
  } catch (err) {
    console.error(err);
  }

  const rawPositions = new Map<string, { x: number; y: number }>();
  let minCalculatedX = Infinity;
  let minCalculatedY = Infinity;

  nodes.forEach((node) => {
    const dagreNode = g.node(node.id);
    const dims = dimsMap.get(node.id) || { width: 160, height: 80 };

    if (dagreNode && typeof dagreNode.x === 'number' && typeof dagreNode.y === 'number') {
      const x = Math.round(dagreNode.x - dims.width / 2);
      const y = Math.round(dagreNode.y - dims.height / 2);
      rawPositions.set(node.id, { x, y });
      minCalculatedX = Math.min(minCalculatedX, x);
      minCalculatedY = Math.min(minCalculatedY, y);
    } else {
      const fallbackX = node.position?.x || 50;
      const fallbackY = node.position?.y || 50;
      rawPositions.set(node.id, { x: fallbackX, y: fallbackY });
      minCalculatedX = Math.min(minCalculatedX, fallbackX);
      minCalculatedY = Math.min(minCalculatedY, fallbackY);
    }
  });

  const targetMarginX = typeof opts.marginx === 'number' ? opts.marginx : 50;
  const targetMarginY = typeof opts.marginy === 'number' ? opts.marginy : 50;
  const shiftX = isFinite(minCalculatedX) && minCalculatedX < targetMarginX ? targetMarginX - minCalculatedX : 0;
  const shiftY = isFinite(minCalculatedY) && minCalculatedY < targetMarginY ? targetMarginY - minCalculatedY : 0;

  const layoutedNodes = nodes.map((node) => {
    const rawPos = rawPositions.get(node.id) || { x: 50, y: 50 };
    return {
      ...node,
      position: {
        x: Math.round(rawPos.x + shiftX),
        y: Math.round(rawPos.y + shiftY),
      },
    };
  });

  const finalPosMap = new Map(layoutedNodes.map((n) => [n.id, n.position]));
  const handleUsageMap = new Map<string, number>();

  const layoutedEdges = safeEdges.map((edge) => {
    const srcNode = nodeMap.get(edge.source);
    const tgtNode = nodeMap.get(edge.target);
    const srcPos = finalPosMap.get(edge.source);
    const tgtPos = finalPosMap.get(edge.target);

    if (!srcNode || !tgtNode || !srcPos || !tgtPos) {
      return edge;
    }

    const srcDims = dimsMap.get(edge.source) || { width: 160, height: 80 };
    const tgtDims = dimsMap.get(edge.target) || { width: 160, height: 80 };

    const srcCenter = {
      x: srcPos.x + srcDims.width / 2,
      y: srcPos.y + srcDims.height / 2,
    };
    const tgtCenter = {
      x: tgtPos.x + tgtDims.width / 2,
      y: tgtPos.y + tgtDims.height / 2,
    };

    const dx = tgtCenter.x - srcCenter.x;
    const dy = tgtCenter.y - srcCenter.y;

    let sourceHandle = 'bottom';
    let targetHandle = 'top';

    if (Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx >= 0) {
        sourceHandle = 'right';
        targetHandle = 'left';
      } else {
        sourceHandle = 'left';
        targetHandle = 'right';
      }
    } else {
      if (dy >= 0) {
        sourceHandle = 'bottom';
        targetHandle = 'top';
      } else {
        sourceHandle = 'top';
        targetHandle = 'bottom';
      }
    }

    const srcKey = `${edge.source}:${sourceHandle}`;
    const tgtKey = `${edge.target}:${targetHandle}`;
    const srcCount = handleUsageMap.get(srcKey) || 0;
    const tgtCount = handleUsageMap.get(tgtKey) || 0;
    handleUsageMap.set(srcKey, srcCount + 1);
    handleUsageMap.set(tgtKey, tgtCount + 1);

    const offsetIndex = Math.max(srcCount, tgtCount);
    const offset = 20 + (offsetIndex % 5) * 10;

    return {
      ...edge,
      sourceHandle,
      targetHandle,
      type: edge.type || 'smoothstep',
      pathOptions: {
        offset,
        borderRadius: 8,
      },
    };
  });

  const cleanLayoutedEdges = validateEdges(layoutedNodes, layoutedEdges);

  const result: any = {
    nodes: layoutedNodes,
    edges: cleanLayoutedEdges,
  };

  result[Symbol.iterator] = function* () {
    yield layoutedNodes;
    yield cleanLayoutedEdges;
  };

  return result;
}

export default getLayoutedElements;
