import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';

export const DiagramContext = createContext(null);

export const initialErNodes = [
  {
    id: 'entity-1',
    type: 'entity',
    position: { x: 120, y: 190 },
    data: { label: 'Customer' },
  },
  {
    id: 'attr-1',
    type: 'attribute',
    position: { x: 100, y: 70 },
    data: { label: 'CustomerID', isPrimary: true },
  },
  {
    id: 'attr-1b',
    type: 'attribute',
    position: { x: 260, y: 70 },
    data: { label: 'CustomerName' },
  },
  {
    id: 'rel-1',
    type: 'relationship',
    position: { x: 370, y: 175 },
    data: { label: 'Places' },
  },
  {
    id: 'entity-2',
    type: 'entity',
    position: { x: 590, y: 190 },
    data: { label: 'Order' },
  },
  {
    id: 'attr-2',
    type: 'attribute',
    position: { x: 570, y: 70 },
    data: { label: 'OrderID', isPrimary: true },
  },
  {
    id: 'attr-2b',
    type: 'attribute',
    position: { x: 730, y: 70 },
    data: { label: 'OrderDate' },
  },
];

export const initialErEdges = [
  {
    id: 'e-attr1-entity1',
    source: 'attr-1',
    target: 'entity-1',
    type: 'cardinality',
    style: { strokeWidth: 2, stroke: '#64748b' },
  },
  {
    id: 'e-attr1b-entity1',
    source: 'attr-1b',
    target: 'entity-1',
    type: 'cardinality',
    style: { strokeWidth: 2, stroke: '#64748b' },
  },
  {
    id: 'e-entity1-rel1',
    source: 'entity-1',
    target: 'rel-1',
    type: 'cardinality',
    label: '1',
    data: { cardinality: '1' },
    style: { strokeWidth: 2, stroke: '#64748b' },
  },
  {
    id: 'e-rel1-entity2',
    source: 'rel-1',
    target: 'entity-2',
    type: 'cardinality',
    label: 'N',
    data: { cardinality: 'N' },
    style: { strokeWidth: 2, stroke: '#64748b' },
  },
  {
    id: 'e-attr2-entity2',
    source: 'attr-2',
    target: 'entity-2',
    type: 'cardinality',
    style: { strokeWidth: 2, stroke: '#64748b' },
  },
  {
    id: 'e-attr2b-entity2',
    source: 'attr-2b',
    target: 'entity-2',
    type: 'cardinality',
    style: { strokeWidth: 2, stroke: '#64748b' },
  },
];

export const initialEerNodes = [
  {
    id: 'eer-sup-1',
    type: 'entity',
    position: { x: 380, y: 70 },
    data: { label: 'Vehicle', isSuperclass: true },
  },
  {
    id: 'eer-attr-1',
    type: 'attribute',
    position: { x: 230, y: 0 },
    data: { label: 'VehicleID', isPrimary: true },
  },
  {
    id: 'eer-attr-2',
    type: 'attribute',
    position: { x: 380, y: -20 },
    data: { label: 'Model' },
  },
  {
    id: 'eer-attr-3',
    type: 'attribute',
    position: { x: 530, y: 0 },
    data: { label: 'Price' },
  },
  {
    id: 'eer-spec-1',
    type: 'specialization',
    position: { x: 430, y: 180 },
    data: { label: 'd', specType: 'disjoint', isTotal: true },
  },
  {
    id: 'eer-sub-1',
    type: 'entity',
    position: { x: 210, y: 310 },
    data: { label: 'Car', isSubclass: true },
  },
  {
    id: 'eer-sub-1-attr1',
    type: 'attribute',
    position: { x: 100, y: 410 },
    data: { label: 'MaxSpeed' },
  },
  {
    id: 'eer-sub-1-attr2',
    type: 'attribute',
    position: { x: 250, y: 410 },
    data: { label: 'NumDoors' },
  },
  {
    id: 'eer-sub-2',
    type: 'entity',
    position: { x: 570, y: 310 },
    data: { label: 'Truck', isSubclass: true },
  },
  {
    id: 'eer-sub-2-attr1',
    type: 'attribute',
    position: { x: 500, y: 410 },
    data: { label: 'Tonnage' },
  },
  {
    id: 'eer-sub-2-attr2',
    type: 'attribute',
    position: { x: 650, y: 410 },
    data: { label: 'NumAxles' },
  },
];

export const initialEerEdges = [
  {
    id: 'e-eer-attr1-sup1',
    source: 'eer-attr-1',
    target: 'eer-sup-1',
    type: 'cardinality',
    style: { strokeWidth: 2, stroke: '#64748b' },
  },
  {
    id: 'e-eer-attr2-sup1',
    source: 'eer-attr-2',
    target: 'eer-sup-1',
    type: 'cardinality',
    style: { strokeWidth: 2, stroke: '#64748b' },
  },
  {
    id: 'e-eer-attr3-sup1',
    source: 'eer-attr-3',
    target: 'eer-sup-1',
    type: 'cardinality',
    style: { strokeWidth: 2, stroke: '#64748b' },
  },
  {
    id: 'e-eer-sup1-spec1',
    source: 'eer-sup-1',
    target: 'eer-spec-1',
    type: 'cardinality',
    label: 'Total ISA',
    data: { cardinality: 'Total ISA', isTotal: true },
    style: { strokeWidth: 2.5, stroke: '#9333ea' },
  },
  {
    id: 'e-eer-spec1-sub1',
    source: 'eer-spec-1',
    target: 'eer-sub-1',
    type: 'cardinality',
    label: 'Subclass',
    data: { cardinality: 'Subclass' },
    style: { strokeWidth: 2, stroke: '#9333ea' },
  },
  {
    id: 'e-eer-spec1-sub2',
    source: 'eer-spec-1',
    target: 'eer-sub-2',
    type: 'cardinality',
    label: 'Subclass',
    data: { cardinality: 'Subclass' },
    style: { strokeWidth: 2, stroke: '#9333ea' },
  },
  {
    id: 'e-eer-sub1-attr1',
    source: 'eer-sub-1-attr1',
    target: 'eer-sub-1',
    type: 'cardinality',
    style: { strokeWidth: 2, stroke: '#64748b' },
  },
  {
    id: 'e-eer-sub1-attr2',
    source: 'eer-sub-1-attr2',
    target: 'eer-sub-1',
    type: 'cardinality',
    style: { strokeWidth: 2, stroke: '#64748b' },
  },
  {
    id: 'e-eer-sub2-attr1',
    source: 'eer-sub-2-attr1',
    target: 'eer-sub-2',
    type: 'cardinality',
    style: { strokeWidth: 2, stroke: '#64748b' },
  },
  {
    id: 'e-eer-sub2-attr2',
    source: 'eer-sub-2-attr2',
    target: 'eer-sub-2',
    type: 'cardinality',
    style: { strokeWidth: 2, stroke: '#64748b' },
  },
];

export function DiagramProvider({ children }) {
  // Mode can be 'er' (Classical Entity-Relationship) or 'eer' (Enhanced Entity-Relationship)
  const [diagramMode, setDiagramModeState] = useState(() => {
    return localStorage.getItem('diagram_mode') || 'er';
  });

  const [selectedNotation, setSelectedNotationState] = useState(() => {
    return localStorage.getItem('diagram_notation') || 'chen';
  });

  const setSelectedNotation = useCallback((newNotation) => {
    setSelectedNotationState(newNotation);
    localStorage.setItem('diagram_notation', newNotation);
  }, []);

  const [nodes, setNodes] = useState(() => {
    const savedMode = localStorage.getItem('diagram_mode');
    return savedMode === 'eer' ? initialEerNodes : initialErNodes;
  });

  const [edges, setEdges] = useState(() => {
    const savedMode = localStorage.getItem('diagram_mode');
    return savedMode === 'eer' ? initialEerEdges : initialErEdges;
  });

  const setDiagramMode = useCallback((newMode, shouldReset = false) => {
    setDiagramModeState(newMode);
    localStorage.setItem('diagram_mode', newMode);
    if (shouldReset) {
      if (newMode === 'eer') {
        setNodes(initialEerNodes);
        setEdges(initialEerEdges);
      } else {
        setNodes(initialErNodes);
        setEdges(initialErEdges);
      }
    }
  }, []);

  const switchMode = useCallback((newMode) => {
    setDiagramMode(newMode, true);
  }, [setDiagramMode]);

  const onNodesChange = useCallback((changes) => {
    const removedIds = new Set(
      changes.filter((c) => c.type === 'remove').map((c) => c.id)
    );
    if (removedIds.size > 0) {
      setEdges((eds) =>
        eds.filter((edge) => !removedIds.has(edge.source) && !removedIds.has(edge.target))
      );
    }
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback(
    (connection) => {
      if (!connection.source || !connection.target || connection.source === connection.target) {
        return;
      }
      setEdges((eds) => {
        const alreadyConnected = eds.some(
          (edge) =>
            (edge.source === connection.source && edge.target === connection.target) ||
            (edge.source === connection.target && edge.target === connection.source)
        );
        if (alreadyConnected) {
          return eds;
        }

        const sameHandleCount = eds.filter(
          (e) =>
            (e.source === connection.source && e.sourceHandle === connection.sourceHandle) ||
            (e.target === connection.target && e.targetHandle === connection.targetHandle)
        ).length;

        const sourceNode = nodes.find((n) => n.id === connection.source);
        const targetNode = nodes.find((n) => n.id === connection.target);

        let defaultLabel = '';
        let isTotal = false;

        const isEntityRel =
          (sourceNode?.type === 'entity' && targetNode?.type === 'relationship') ||
          (sourceNode?.type === 'relationship' && targetNode?.type === 'entity');

        const isSpecialization =
          sourceNode?.type === 'specialization' || targetNode?.type === 'specialization';

        if (isEntityRel) {
          const relNode = sourceNode?.type === 'relationship' ? sourceNode : targetNode;
          // Count existing entity edges to this relationship that have labels
          const relEdges = eds.filter(
            (e) => (e.source === relNode.id || e.target === relNode.id) && e.label
          );
          if (relEdges.length === 0) {
            defaultLabel = '1';
          } else if (relEdges.length === 1 && relEdges[0].label === '1') {
            defaultLabel = 'N';
          } else if (relEdges.length === 1 && relEdges[0].label === 'N') {
            defaultLabel = '1';
          } else {
            defaultLabel = 'M';
          }
        } else if (isSpecialization) {
          const specNode = sourceNode?.type === 'specialization' ? sourceNode : targetNode;
          const entNode = sourceNode?.type === 'entity' ? sourceNode : targetNode;
          if (entNode?.data?.isSuperclass || sourceNode?.id === entNode?.id) {
            defaultLabel = specNode?.data?.isTotal ? 'Total ISA' : 'ISA';
            isTotal = Boolean(specNode?.data?.isTotal);
          } else {
            defaultLabel = 'Subclass';
          }
        }

        return addEdge(
          {
            ...connection,
            type: 'cardinality',
            label: defaultLabel,
            data: {
              cardinality: defaultLabel,
              isTotal,
            },
            pathOptions: {
              offset: 20 + (sameHandleCount % 5) * 10,
              borderRadius: 8,
            },
            style: {
              strokeWidth: isTotal ? 2.5 : 2,
              stroke: isSpecialization ? '#9333ea' : '#64748b',
            },
          },
          eds
        );
      });
    },
    [nodes]
  );

  const updateEdgeCardinality = useCallback((edgeId, newLabel, extraData = {}) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          const isTotalPreset = newLabel === 'Total ISA' || Boolean(extraData?.isTotal);
          return {
            ...edge,
            label: newLabel,
            data: {
              ...edge.data,
              cardinality: newLabel,
              ...extraData,
              ...(isTotalPreset ? { isTotal: true } : {}),
            },
          };
        }
        return edge;
      })
    );
  }, []);

  const toggleEdgeParticipation = useCallback((edgeId) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          const currentTotal = Boolean(edge.data?.isTotal);
          return {
            ...edge,
            data: {
              ...edge.data,
              isTotal: !currentTotal,
            },
          };
        }
        return edge;
      })
    );
  }, []);

  const deleteEdge = useCallback((edgeId) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
  }, []);

  const onNodesDelete = useCallback((deletedNodes) => {
    const deletedIds = new Set(deletedNodes.map((n) => n.id));
    setEdges((eds) =>
      eds.filter((edge) => !deletedIds.has(edge.source) && !deletedIds.has(edge.target))
    );
  }, []);

  const onEdgesDelete = useCallback((deletedEdges) => {
    const deletedEdgeIds = new Set(deletedEdges.map((e) => e.id));
    setEdges((eds) => eds.filter((edge) => !deletedEdgeIds.has(edge.id)));
  }, []);

  const updateNodeLabel = useCallback((id, newLabel) => {
    const trimmed = typeof newLabel === 'string' ? newLabel.trim() : '';
    const validLabel = trimmed === '' ? 'Untitled' : trimmed;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              label: validLabel,
            },
          };
        }
        return node;
      })
    );
  }, []);

  const deleteSelected = useCallback(() => {
    setNodes((currentNodes) => {
      const selectedNodes = currentNodes.filter((node) => node.selected);
      const remainingNodes = currentNodes.filter((node) => !node.selected);

      if (selectedNodes.length > 0) {
        const deletedIds = new Set(selectedNodes.map((node) => node.id));
        setEdges((currentEdges) =>
          currentEdges.filter(
            (edge) =>
              !edge.selected &&
              !deletedIds.has(edge.source) &&
              !deletedIds.has(edge.target)
          )
        );
      } else {
        setEdges((currentEdges) => currentEdges.filter((edge) => !edge.selected));
      }

      return remainingNodes;
    });
  }, []);

  const addNode = useCallback((type, position, initialLabel, customData = {}) => {
    let fallbackLabel = 'Entity';
    if (type === 'attribute') fallbackLabel = 'Attribute';
    else if (type === 'relationship') fallbackLabel = 'Relationship';
    else if (type === 'specialization')
      fallbackLabel =
        customData.specType === 'overlapping'
          ? 'o'
          : customData.specType === 'union'
          ? 'U'
          : 'd';

    const label =
      initialLabel && initialLabel.trim() !== '' ? initialLabel.trim() : fallbackLabel;

    const newNodeId = `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newNode = {
      id: newNodeId,
      type,
      position,
      data: {
        label,
        ...customData,
      },
    };

    setNodes((nds) => {
      let updatedNodes = nds.concat(newNode);
      if (
        customData.defaultAttributes &&
        Array.isArray(customData.defaultAttributes) &&
        customData.defaultAttributes.length > 0
      ) {
        customData.defaultAttributes.forEach((attr, idx) => {
          const attrId = `attr-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`;
          const attrNode = {
            id: attrId,
            type: 'attribute',
            position: { x: position.x + (idx * 110 - 60), y: position.y - 80 },
            data: {
              label: attr.name || (attr.isPrimary ? 'id' : 'name'),
              isPrimary: Boolean(attr.isPrimary),
              isDerived: Boolean(attr.isDerived),
              isMultivalued: Boolean(attr.isMultivalued),
              dataType: attr.dataType || (attr.isPrimary ? 'INT' : 'VARCHAR'),
            },
          };
          const newEdge = {
            id: `e-${attrId}-${newNodeId}`,
            source: attrId,
            target: newNodeId,
            type: 'cardinality',
            style: { strokeWidth: 2, stroke: '#64748b' },
          };
          updatedNodes = updatedNodes.concat(attrNode);
          setEdges((eds) => eds.concat(newEdge));
        });
      }
      return updatedNodes;
    });

    return newNode;
  }, []);

  const addAttributeToEntity = useCallback((entityId, attrConfig = {}) => {
    setNodes((nds) => {
      const entity = nds.find((n) => n.id === entityId);
      const posX = entity ? entity.position.x + (Math.random() * 60 - 30) : 300;
      const posY = entity ? entity.position.y - 80 - Math.random() * 20 : 150;
      const name = attrConfig.name || (attrConfig.isPrimary ? 'id' : 'attr');
      const attrId = `attr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const attrNode = {
        id: attrId,
        type: 'attribute',
        position: { x: posX, y: posY },
        data: {
          label: name,
          isPrimary: Boolean(attrConfig.isPrimary),
          isDerived: Boolean(attrConfig.isDerived),
          isMultivalued: Boolean(attrConfig.isMultivalued),
          dataType: attrConfig.dataType || (attrConfig.isPrimary ? 'INT' : 'VARCHAR'),
        },
      };

      const newEdge = {
        id: `e-${attrId}-${entityId}`,
        source: attrId,
        target: entityId,
        type: 'cardinality',
        style: { strokeWidth: 2, stroke: '#64748b' },
      };

      setEdges((eds) => eds.concat(newEdge));
      return nds.concat(attrNode);
    });
  }, []);

  const deleteAttribute = useCallback((attrId) => {
    setNodes((nds) => nds.filter((n) => n.id !== attrId));
    setEdges((eds) => eds.filter((e) => e.source !== attrId && e.target !== attrId));
  }, []);

  const updateAttribute = useCallback((attrId, updates) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === attrId) {
          return {
            ...n,
            data: {
              ...n.data,
              ...updates,
              label:
                updates.name !== undefined
                  ? updates.name
                  : updates.label !== undefined
                  ? updates.label
                  : n.data.label,
            },
          };
        }
        return n;
      })
    );
  }, []);

  const resetDiagram = useCallback(() => {
    if (diagramMode === 'eer') {
      setNodes(initialEerNodes);
      setEdges(initialEerEdges);
    } else {
      setNodes(initialErNodes);
      setEdges(initialErEdges);
    }
  }, [diagramMode]);

  const clearDiagram = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Backspace' || event.key === 'Delete') {
        const activeElement = document.activeElement;
        const tagName = activeElement?.tagName?.toLowerCase();
        if (
          tagName === 'input' ||
          tagName === 'textarea' ||
          activeElement?.isContentEditable
        ) {
          return;
        }

        event.preventDefault();
        deleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected]);

  return (
    <DiagramContext.Provider
      value={{
        diagramMode,
        setDiagramMode,
        switchMode,
        selectedNotation,
        setSelectedNotation,
        nodes,
        edges,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onNodesDelete,
        onEdgesDelete,
        updateNodeLabel,
        updateEdgeCardinality,
        toggleEdgeParticipation,
        deleteEdge,
        deleteSelected,
        addNode,
        addAttributeToEntity,
        deleteAttribute,
        updateAttribute,
        resetDiagram,
        clearDiagram,
      }}
    >
      {children}
    </DiagramContext.Provider>
  );
}

export function useDiagram() {
  const context = useContext(DiagramContext);
  if (!context) {
    throw new Error('useDiagram must be used within a DiagramProvider');
  }
  return context;
}
