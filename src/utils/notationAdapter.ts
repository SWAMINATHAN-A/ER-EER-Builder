export type NotationType = 'chen' | 'crowsfoot' | 'uml' | 'minmax';

export interface BaseSchemaNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
  selected?: boolean;
}

export interface BaseSchemaEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  data?: any;
  style?: any;
  markerStart?: any;
  markerEnd?: any;
  selected?: boolean;
}

export interface NotationInfo {
  id: NotationType;
  name: string;
  shortLabel: string;
  description: string;
  standard: string;
  entityShape: string;
  attributeStyle: string;
  relationshipStyle: string;
  cardinalityStyle: string;
}

export const NOTATION_DEFINITIONS: Record<NotationType, NotationInfo> = {
  chen: {
    id: 'chen',
    name: 'Chen Notation',
    shortLabel: 'Chen',
    description: 'Classic ER notation using rectangles for entities, diamonds for relationships, and ovals for attributes.',
    standard: 'Peter Chen (1976)',
    entityShape: 'Rectangles (double border for weak)',
    attributeStyle: 'Separate oval nodes connected by lines',
    relationshipStyle: 'Diamonds (double diamond for identifying)',
    cardinalityStyle: 'Single ratio markers (1, N, M)',
  },
  crowsfoot: {
    id: 'crowsfoot',
    name: "Crow's Foot Notation",
    shortLabel: "Crow's Foot",
    description: 'Martin notation condensing attributes into table boxes with graphical fork/tick terminal cardinality markers.',
    standard: 'James Martin / Gordon Everest',
    entityShape: 'Table-like box with header and attribute list',
    attributeStyle: 'Embedded inside entity box with PK / FK indicators',
    relationshipStyle: 'Direct entity-to-entity lines (no diamond)',
    cardinalityStyle: 'Terminal fork markers (||, o|, >|, o<)',
  },
  uml: {
    id: 'uml',
    name: 'UML Class Diagram',
    shortLabel: 'UML',
    description: 'Object-oriented notation featuring 3-compartment class rectangles and multiplicity bounds.',
    standard: 'OMG UML 2.5 Standard',
    entityShape: '3-compartment class rectangle (Name, Attributes, Methods)',
    attributeStyle: 'Typed attributes with + visibility inside class box',
    relationshipStyle: 'Direct association lines with multiplicity spans (0..1, 1..*)',
    cardinalityStyle: 'Multiplicities (0..1, 1..1, 0..*, 1..*)',
  },
  minmax: {
    id: 'minmax',
    name: 'Min-Max (ISO/Merise)',
    shortLabel: 'Min-Max',
    description: 'ISO conceptual ER modeling with explicit (min, max) participation constraints on relationship edges.',
    standard: 'ISO/IEC & Merise Method',
    entityShape: 'Rectangles with diamonds for relationships',
    attributeStyle: 'Separate oval nodes',
    relationshipStyle: 'Diamond nodes with participating entity connections',
    cardinalityStyle: 'Explicit constraint tuples (0,1), (1,1), (0,N), (1,N)',
  },
};

export function parseCardinalityToMinMax(cardinality: string | undefined, isTotal: boolean = false): string {
  const c = (cardinality || '').trim().toUpperCase();
  if (c === '1' || c === '1:1') {
    return isTotal ? '(1, 1)' : '(0, 1)';
  }
  if (c === 'N' || c === 'M' || c === '1:N' || c === 'N:1' || c === 'M:N') {
    return isTotal ? '(1, N)' : '(0, N)';
  }
  if (c.startsWith('(') && c.endsWith(')')) {
    return c;
  }
  if (c === '0..1') return '(0, 1)';
  if (c === '1..1') return '(1, 1)';
  if (c === '0..*' || c === '0..N') return '(0, N)';
  if (c === '1..*' || c === '1..N') return '(1, N)';
  if (c === 'TOTAL ISA') return '(1, 1)';
  if (c === 'ISA' || c === 'SUBCLASS') return '(0, 1)';
  return isTotal ? '(1, 1)' : '(0, 1)';
}

export function parseCardinalityToUml(cardinality: string | undefined, isTotal: boolean = false): string {
  const c = (cardinality || '').trim().toUpperCase();
  if (c === '0..1' || c === '1..1' || c === '0..*' || c === '1..*') {
    return c.toLowerCase();
  }
  if (c === '1') {
    return isTotal ? '1..1' : '0..1';
  }
  if (c === 'N' || c === 'M') {
    return isTotal ? '1..*' : '0..*';
  }
  if (c === '(0,1)' || c === '(0, 1)') return '0..1';
  if (c === '(1,1)' || c === '(1, 1)') return '1..1';
  if (c === '(0,N)' || c === '(0, N)' || c === '(0,M)' || c === '(0, M)') return '0..*';
  if (c === '(1,N)' || c === '(1, N)' || c === '(1,M)' || c === '(1, M)') return '1..*';
  if (c === 'TOTAL ISA') return '{total}';
  if (c === 'ISA') return '{partial}';
  return isTotal ? '1..1' : '0..1';
}

export function getCrowsFootMarkerType(cardinality: string | undefined, isTotal: boolean = false): {
  markerType: 'one' | 'zeroOrOne' | 'oneOrMany' | 'zeroOrMany';
  label: string;
} {
  const c = (cardinality || '').trim().toUpperCase();

  if (c === '1' || c === '1..1' || c === '(1,1)' || c === '(1, 1)') {
    return isTotal ? { markerType: 'one', label: '1' } : { markerType: 'zeroOrOne', label: '0..1' };
  }
  if (c === '0..1' || c === '(0,1)' || c === '(0, 1)') {
    return { markerType: 'zeroOrOne', label: '0..1' };
  }
  if (c === 'N' || c === 'M' || c === '1..*' || c === '(1,N)' || c === '(1, N)') {
    return isTotal ? { markerType: 'oneOrMany', label: '1..N' } : { markerType: 'zeroOrMany', label: '0..N' };
  }
  if (c === '0..*' || c === '(0,N)' || c === '(0, N)') {
    return { markerType: 'zeroOrMany', label: '0..N' };
  }

  return isTotal ? { markerType: 'one', label: '1' } : { markerType: 'zeroOrMany', label: 'N' };
}

export interface ConsolidatedEntityAttribute {
  id: string;
  name: string;
  isPrimary?: boolean;
  isMulti?: boolean;
  isDerived?: boolean;
  isForeign?: boolean;
  dataType?: string;
}

export function buildEntityAttributesMap(
  nodes: BaseSchemaNode[],
  edges: BaseSchemaEdge[]
): Map<string, ConsolidatedEntityAttribute[]> {
  const result = new Map<string, ConsolidatedEntityAttribute[]>();
  const entityNodes = nodes.filter((n) => n.type === 'entity');
  const attributeNodes = nodes.filter((n) => n.type === 'attribute');

  entityNodes.forEach((ent) => {
    result.set(ent.id, []);
  });

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  edges.forEach((edge) => {
    const src = nodeMap.get(edge.source);
    const tgt = nodeMap.get(edge.target);
    if (!src || !tgt) return;

    if (src.type === 'attribute' && tgt.type === 'entity') {
      const list = result.get(tgt.id);
      if (list && !list.some((a) => a.id === src.id)) {
        list.push({
          id: src.id,
          name: src.data?.label || 'Attribute',
          isPrimary: Boolean(src.data?.isPrimary),
          isMulti: Boolean(src.data?.isMulti),
          isDerived: Boolean(src.data?.isDerived),
          isForeign: Boolean(src.data?.isForeign),
          dataType: src.data?.dataType || (src.data?.isPrimary ? 'INT' : 'VARCHAR(100)'),
        });
      }
    } else if (src.type === 'entity' && tgt.type === 'attribute') {
      const list = result.get(src.id);
      if (list && !list.some((a) => a.id === tgt.id)) {
        list.push({
          id: tgt.id,
          name: tgt.data?.label || 'Attribute',
          isPrimary: Boolean(tgt.data?.isPrimary),
          isMulti: Boolean(tgt.data?.isMulti),
          isDerived: Boolean(tgt.data?.isDerived),
          isForeign: Boolean(tgt.data?.isForeign),
          dataType: tgt.data?.dataType || (tgt.data?.isPrimary ? 'INT' : 'VARCHAR(100)'),
        });
      }
    }
  });

  return result;
}

export function transformToNotation(
  nodes: BaseSchemaNode[],
  edges: BaseSchemaEdge[],
  notation: NotationType
): { nodes: BaseSchemaNode[]; edges: BaseSchemaEdge[] } {
  if (!nodes || nodes.length === 0) {
    return { nodes: [], edges: edges || [] };
  }

  const entityAttrMap = buildEntityAttributesMap(nodes, edges);

  if (notation === 'chen') {
    const transformedNodes = nodes.map((n) => ({
      ...n,
      type: n.type,
      data: {
        ...n.data,
        notation: 'chen',
        embeddedAttributes: entityAttrMap.get(n.id) || [],
      },
    }));

    const transformedEdges = edges.map((e) => {
      const card = e.data?.cardinality || e.label || '';
      return {
        ...e,
        type: 'cardinality',
        label: card,
        data: {
          ...e.data,
          notation: 'chen',
          cardinality: card,
        },
      };
    });

    return { nodes: transformedNodes, edges: transformedEdges };
  }

  if (notation === 'minmax') {
    const transformedNodes = nodes.map((n) => ({
      ...n,
      type: n.type,
      data: {
        ...n.data,
        notation: 'minmax',
        embeddedAttributes: entityAttrMap.get(n.id) || [],
      },
    }));

    const transformedEdges = edges.map((e) => {
      const isTotal = Boolean(e.data?.isTotal || e.data?.doubleLine);
      const minMaxLabel = parseCardinalityToMinMax(e.data?.cardinality || e.label, isTotal);
      return {
        ...e,
        type: 'cardinality',
        label: minMaxLabel,
        data: {
          ...e.data,
          notation: 'minmax',
          cardinality: minMaxLabel,
          minMax: minMaxLabel,
        },
      };
    });

    return { nodes: transformedNodes, edges: transformedEdges };
  }

  if (notation === 'crowsfoot') {
    const entityNodes = nodes.filter((n) => n.type === 'entity');
    const specNodes = nodes.filter((n) => n.type === 'specialization');
    const relNodes = nodes.filter((n) => n.type === 'relationship');
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    const directEdges: BaseSchemaEdge[] = [];
    const directEdgeIds = new Set<string>();

    relNodes.forEach((rel) => {
      const connectedEdges = edges.filter(
        (e) => e.source === rel.id || e.target === rel.id
      );

      const connectedEntities: { entityId: string; edge: BaseSchemaEdge; isSource: boolean }[] = [];
      connectedEdges.forEach((edge) => {
        const otherId = edge.source === rel.id ? edge.target : edge.source;
        const otherNode = nodeMap.get(otherId);
        if (otherNode && otherNode.type === 'entity') {
          connectedEntities.push({
            entityId: otherId,
            edge,
            isSource: edge.source === otherId,
          });
        }
      });

      if (connectedEntities.length === 2) {
        const [first, second] = connectedEntities;
        const edgeId = `crows-rel-${rel.id}-${first.entityId}-${second.entityId}`;
        if (!directEdgeIds.has(edgeId)) {
          directEdgeIds.add(edgeId);

          const firstTotal = Boolean(first.edge.data?.isTotal);
          const secondTotal = Boolean(second.edge.data?.isTotal);
          const firstMarker = getCrowsFootMarkerType(first.edge.data?.cardinality || first.edge.label, firstTotal);
          const secondMarker = getCrowsFootMarkerType(second.edge.data?.cardinality || second.edge.label, secondTotal);

          directEdges.push({
            id: edgeId,
            source: first.entityId,
            target: second.entityId,
            type: 'cardinality',
            label: rel.data?.label || '',
            data: {
              notation: 'crowsfoot',
              relationshipName: rel.data?.label || '',
              sourceMarker: firstMarker.markerType,
              targetMarker: secondMarker.markerType,
              sourceLabel: firstMarker.label,
              targetLabel: secondMarker.label,
              isIdentifying: Boolean(rel.data?.isIdentifying),
            },
            style: {
              strokeWidth: rel.data?.isIdentifying ? 2.5 : 2,
              stroke: rel.data?.isIdentifying ? '#4f46e5' : '#0284c7',
            },
          });
        }
      } else if (connectedEntities.length > 2) {
        connectedEntities.forEach((conn, idx) => {
          const edgeId = `crows-edge-${rel.id}-${conn.entityId}-${idx}`;
          if (!directEdgeIds.has(edgeId)) {
            directEdgeIds.add(edgeId);
            const isTot = Boolean(conn.edge.data?.isTotal);
            const marker = getCrowsFootMarkerType(conn.edge.data?.cardinality || conn.edge.label, isTot);
            directEdges.push({
              ...conn.edge,
              id: edgeId,
              data: {
                ...conn.edge.data,
                notation: 'crowsfoot',
                targetMarker: marker.markerType,
                cardinality: marker.label,
              },
            });
          }
        });
      }
    });

    edges.forEach((edge) => {
      const src = nodeMap.get(edge.source);
      const tgt = nodeMap.get(edge.target);
      if (!src || !tgt) return;

      const isSpecConnection =
        src.type === 'specialization' || tgt.type === 'specialization';
      if (isSpecConnection) {
        directEdges.push({
          ...edge,
          data: {
            ...edge.data,
            notation: 'crowsfoot',
          },
        });
      }
    });

    const activeNodes = [...entityNodes, ...specNodes].map((n) => {
      if (n.type === 'entity') {
        const attrs = entityAttrMap.get(n.id) || [];
        return {
          ...n,
          type: 'crowsfootEntity',
          data: {
            ...n.data,
            notation: 'crowsfoot',
            embeddedAttributes: attrs,
          },
        };
      }
      return {
        ...n,
        data: {
          ...n.data,
          notation: 'crowsfoot',
        },
      };
    });

    return { nodes: activeNodes, edges: directEdges };
  }

  if (notation === 'uml') {
    const entityNodes = nodes.filter((n) => n.type === 'entity');
    const specNodes = nodes.filter((n) => n.type === 'specialization');
    const relNodes = nodes.filter((n) => n.type === 'relationship');
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    const directEdges: BaseSchemaEdge[] = [];
    const directEdgeIds = new Set<string>();

    relNodes.forEach((rel) => {
      const connectedEdges = edges.filter(
        (e) => e.source === rel.id || e.target === rel.id
      );

      const connectedEntities: { entityId: string; edge: BaseSchemaEdge }[] = [];
      connectedEdges.forEach((edge) => {
        const otherId = edge.source === rel.id ? edge.target : edge.source;
        const otherNode = nodeMap.get(otherId);
        if (otherNode && otherNode.type === 'entity') {
          connectedEntities.push({ entityId: otherId, edge });
        }
      });

      if (connectedEntities.length === 2) {
        const [first, second] = connectedEntities;
        const edgeId = `uml-rel-${rel.id}-${first.entityId}-${second.entityId}`;
        if (!directEdgeIds.has(edgeId)) {
          directEdgeIds.add(edgeId);

          const firstTotal = Boolean(first.edge.data?.isTotal);
          const secondTotal = Boolean(second.edge.data?.isTotal);
          const firstMult = parseCardinalityToUml(first.edge.data?.cardinality || first.edge.label, firstTotal);
          const secondMult = parseCardinalityToUml(second.edge.data?.cardinality || second.edge.label, secondTotal);
          const isComposition = Boolean(rel.data?.isIdentifying);

          directEdges.push({
            id: edgeId,
            source: first.entityId,
            target: second.entityId,
            type: 'cardinality',
            label: `${firstMult}  —  ${rel.data?.label || ''}  —  ${secondMult}`,
            data: {
              notation: 'uml',
              relationshipName: rel.data?.label || '',
              sourceMultiplicity: firstMult,
              targetMultiplicity: secondMult,
              isComposition,
            },
            style: {
              strokeWidth: isComposition ? 2.5 : 2,
              stroke: isComposition ? '#1e293b' : '#334155',
            },
          });
        }
      }
    });

    edges.forEach((edge) => {
      const src = nodeMap.get(edge.source);
      const tgt = nodeMap.get(edge.target);
      if (!src || !tgt) return;

      const isSpec = src.type === 'specialization' || tgt.type === 'specialization';
      if (isSpec) {
        directEdges.push({
          ...edge,
          data: {
            ...edge.data,
            notation: 'uml',
            isGeneralization: true,
          },
          style: {
            strokeWidth: 2,
            stroke: '#7c3aed',
          },
        });
      }
    });

    const activeNodes = [...entityNodes, ...specNodes].map((n) => {
      if (n.type === 'entity') {
        const attrs = entityAttrMap.get(n.id) || [];
        return {
          ...n,
          type: 'umlClass',
          data: {
            ...n.data,
            notation: 'uml',
            embeddedAttributes: attrs,
            methods: [`+ get${n.data?.label || 'Entity'}Data()`, `+ validate()`].filter(Boolean),
            constraints: n.data?.isWeak ? ['{existence_dependent}'] : [],
          },
        };
      }
      return {
        ...n,
        data: {
          ...n.data,
          notation: 'uml',
        },
      };
    });

    return { nodes: activeNodes, edges: directEdges };
  }

  return { nodes, edges };
}
