import { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Database,
  RotateCcw,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutGrid,
  MessageSquare,
  Layers,
  Sparkles,
  ArrowLeftRight,
  BookOpen,
  FolderArchive,
} from 'lucide-react';

import { useDiagram } from '../context/DiagramContext.jsx';
import { useNavbar } from '../context/NavContext.jsx';
import Sidebar from '../components/Sidebar.jsx';
import SqlModal from '../components/SqlModal.jsx';
import ImportAI from '../components/ImportAI.jsx';
import ChatBuilder from '../components/ChatBuilder.jsx';
import SavedSchemasModal from '../components/SavedSchemasModal.jsx';
import EntityNode from '../components/nodes/EntityNode.jsx';
import AttributeNode from '../components/nodes/AttributeNode.jsx';
import RelationshipNode from '../components/nodes/RelationshipNode.jsx';
import SpecializationNode from '../components/nodes/SpecializationNode.jsx';
import CrowsFootNode from '../components/nodes/CrowsFootNode.jsx';
import UmlClassNode from '../components/nodes/UmlClassNode.jsx';
import CardinalityEdge from '../components/edges/CardinalityEdge.jsx';
import { generateSqlSchema } from '../utils/schemaGenerator.js';
import { getLayoutedElements } from '../utils/layoutEngine.js';
import { validateEdges } from '../utils/validateEdges.js';
import { exportDiagramToPng, exportDiagramToSvg } from '../utils/imageExporter.js';
import { exportDiagramToPdfReport } from '../utils/reportExporter.js';
import { transformToNotation, NOTATION_DEFINITIONS } from '../utils/notationAdapter.ts';
import NotationLegendModal from '../components/NotationLegendModal.jsx';

const NODE_TYPES = {
  entity: EntityNode,
  crowsfootEntity: CrowsFootNode,
  umlClass: UmlClassNode,
  attribute: AttributeNode,
  relationship: RelationshipNode,
  specialization: SpecializationNode,
};

const EDGE_TYPES = {
  cardinality: CardinalityEdge,
  smoothstep: CardinalityEdge,
  default: CardinalityEdge,
};

function DiagramFlow({ sidebarOpen, setSidebarOpen }) {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isImportAiOpen, setIsImportAiOpen] = useState(false);
  const [generatedSql, setGeneratedSql] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isSchemasModalOpen, setIsSchemasModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const prevNotationRef = useRef(null);

  const {
    diagramMode,
    setDiagramMode,
    selectedNotation,
    setSelectedNotation,
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange: canonicalNodesChange,
    onEdgesChange: canonicalEdgesChange,
    onConnect,
    onNodesDelete,
    onEdgesDelete,
    addNode,
    resetDiagram,
  } = useDiagram();

  const { setStudioConfig } = useNavbar();

  // Sync mode with URL param if present
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode && (urlMode === 'er' || urlMode === 'eer') && urlMode !== diagramMode) {
      setDiagramMode(urlMode, false);
    }
  }, [searchParams, diagramMode, setDiagramMode]);

  // Transform canonical nodes/edges according to active notation
  const transformed = useMemo(() => {
    return transformToNotation(nodes, edges, selectedNotation || 'chen');
  }, [nodes, edges, selectedNotation]);

  const displayNodes = transformed.nodes;
  const displayEdges = useMemo(() => {
    return validateEdges(displayNodes, transformed.edges);
  }, [displayNodes, transformed.edges]);

  // Recalibrate layout when notation paradigm switches (e.g. separated vs consolidated)
  useEffect(() => {
    if (!prevNotationRef.current) {
      prevNotationRef.current = selectedNotation;
      return;
    }
    const prev = prevNotationRef.current;
    prevNotationRef.current = selectedNotation;

    const isConsolidated = (not) => not === 'crowsfoot' || not === 'uml';
    if (isConsolidated(prev) !== isConsolidated(selectedNotation)) {
      const layouted = getLayoutedElements(nodes, edges);
      const layoutedNodes = layouted.nodes || layouted[0] || nodes;
      const layoutedEdges = layouted.edges || layouted[1] || edges;
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      if (reactFlowInstance) {
        setTimeout(() => {
          reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
        }, 80);
      }
    }
  }, [selectedNotation, nodes, edges, setNodes, setEdges, reactFlowInstance]);

  const handleAutoLayout = useCallback(() => {
    const layouted = getLayoutedElements(nodes, edges);
    const layoutedNodes = layouted.nodes || layouted[0] || nodes;
    const layoutedEdges = layouted.edges || layouted[1] || edges;
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    if (reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
      }, 60);
    }
  }, [nodes, edges, setNodes, setEdges, reactFlowInstance]);

  const handleOpenSql = useCallback(() => {
    const sql = generateSqlSchema(nodes, edges);
    setGeneratedSql(sql);
    setIsSqlModalOpen(true);
  }, [nodes, edges]);

  const handleExportPng = useCallback(async () => {
    try {
      await exportDiagramToPng({
        containerId: 'er-canvas-container',
        backgroundColor: '#ffffff',
        scale: 2,
        cropToContent: true,
        padding: 50,
        fileName: `${diagramMode}-${selectedNotation}-diagram.png`,
      });
    } catch (err) {
      console.error(err);
    }
  }, [diagramMode, selectedNotation]);

  const handleExportSvg = useCallback(() => {
    try {
      exportDiagramToSvg({
        nodes: displayNodes,
        edges: displayEdges,
        backgroundColor: '#ffffff',
        fileName: `${diagramMode}-${selectedNotation}-diagram.svg`,
        padding: 60,
      });
    } catch (err) {
      console.error(err);
    }
  }, [displayNodes, displayEdges, diagramMode, selectedNotation]);

  const handleExportPdf = useCallback(async () => {
    try {
      await exportDiagramToPdfReport({
        nodes: displayNodes,
        edges: displayEdges,
        diagramMode,
      });
    } catch (err) {
      console.error(err);
    }
  }, [displayNodes, displayEdges, diagramMode]);

  useEffect(() => {
    setStudioConfig({
      onGenerate: () => setIsImportAiOpen(true),
      onAutoLayout: handleAutoLayout,
      onOpenSql: handleOpenSql,
      onExportPng: handleExportPng,
      onExportSvg: handleExportSvg,
      onExportPdf: handleExportPdf,
      onOpenSavedSchemas: () => setIsSchemasModalOpen(true),
      onToggleChat: () => setIsChatOpen((prev) => !prev),
    });
  }, [handleAutoLayout, handleOpenSql, handleExportPng, handleExportSvg, handleExportPdf, setStudioConfig]);

  useEffect(() => {
    const onRelayout = () => {
      if (reactFlowInstance) {
        setTimeout(() => {
          reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
        }, 60);
      }
    };
    window.addEventListener('er-diagram-relayout', onRelayout);
    return () => window.removeEventListener('er-diagram-relayout', onRelayout);
  }, [reactFlowInstance]);

  // Sync position changes back to canonical nodes
  const handleNodesChange = useCallback(
    (changes) => {
      if (selectedNotation === 'chen' || selectedNotation === 'minmax') {
        canonicalNodesChange(changes);
      } else {
        // In consolidated mode (Crow's Foot / UML), map entity position changes back
        const posChanges = changes.filter((c) => c.type === 'position' && c.position);
        if (posChanges.length > 0) {
          setNodes((prevNodes) => {
            const updated = [...prevNodes];
            posChanges.forEach((change) => {
              const targetNode = updated.find((n) => n.id === change.id);
              if (targetNode) {
                targetNode.position = change.position;
              }
            });
            return updated;
          });
        }
      }
    },
    [selectedNotation, canonicalNodesChange, setNodes]
  );

  const isEer = diagramMode === 'eer';

  const entityCount = useMemo(
    () => nodes.filter((n) => n.type === 'entity').length,
    [nodes]
  );
  const attributeCount = useMemo(
    () => nodes.filter((n) => n.type === 'attribute').length,
    [nodes]
  );
  const relationshipCount = useMemo(
    () => nodes.filter((n) => n.type === 'relationship').length,
    [nodes]
  );
  const specializationCount = useMemo(
    () => nodes.filter((n) => n.type === 'specialization').length,
    [nodes]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow/type') || event.dataTransfer.getData('application/reactflow');
      const customRaw = event.dataTransfer.getData('application/reactflow/custom');
      let customData = {};
      try {
        if (customRaw) customData = JSON.parse(customRaw);
      } catch (e) {
        // ignore parse error
      }

      if (!type || !reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition
        ? reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          })
        : reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          });

      addNode(type, position, customData.label, customData);
    },
    [reactFlowInstance, addNode]
  );

  const currentNotationDef = NOTATION_DEFINITIONS[selectedNotation] || NOTATION_DEFINITIONS.chen;

  return (
    <div id="er-canvas-container" className="relative flex-1 h-full w-full bg-[#F5F5F7] dark:bg-[#000000]" ref={reactFlowWrapper}>
      {/* On-canvas floating status & quick action bar */}
      <div
        id="canvas-top-toolbar"
        className="absolute top-3 left-4 right-4 z-10 pointer-events-none flex items-center justify-between gap-2"
      >
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            id="toggle-sidebar-btn"
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl text-zinc-700 dark:text-zinc-200 shadow-2xs hover:bg-white dark:hover:bg-[#2C2C2E] cursor-pointer transition-all duration-200 active:scale-95"
            title={sidebarOpen ? 'Hide Component Palette' : 'Show Component Palette'}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </button>

          {/* Notation Badge & Switcher */}
          <div
            id="canvas-notation-indicator"
            className="flex items-center gap-1.5 px-2 py-1 bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.08] rounded-xl shadow-2xs"
          >
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider hidden md:inline">
              Format:
            </span>
            <span
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                selectedNotation === 'chen'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                  : selectedNotation === 'crowsfoot'
                  ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300'
                  : selectedNotation === 'uml'
                  ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
              }`}
            >
              {currentNotationDef.name}
            </span>
            <button
              type="button"
              onClick={() => setIsLegendOpen(true)}
              title="Open Notation Quick Reference Guide"
              className="p-1 rounded-md text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3 h-3" />
            </button>
          </div>

          <div
            id="diagram-stats-group"
            className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.08] rounded-xl shadow-2xs"
          >
            <span
              id="stat-entities"
              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/40"
            >
              {entityCount} {entityCount === 1 ? 'Entity' : 'Entities'}
            </span>
            <span
              id="stat-attributes"
              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/40"
            >
              {attributeCount} {attributeCount === 1 ? 'Attribute' : 'Attributes'}
            </span>
            <span
              id="stat-relationships"
              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/50 dark:border-amber-900/40"
            >
              {relationshipCount} {relationshipCount === 1 ? 'Rel' : 'Rels'}
            </span>
            {isEer && specializationCount > 0 && (
              <span
                id="stat-specializations"
                className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/50 dark:border-purple-900/40"
              >
                {specializationCount} ISA
              </span>
            )}
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            id="canvas-saved-schemas-btn"
            type="button"
            onClick={() => setIsSchemasModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-white/90 dark:bg-[#1C1C1E]/90 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-2xs hover:bg-white dark:hover:bg-[#2C2C2E] cursor-pointer transition-all duration-200 active:scale-[0.98]"
            title="Open Cloud Schema Manager"
          >
            <FolderArchive className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Saved Schemas</span>
          </button>
          <button
            id="canvas-chat-builder-btn"
            type="button"
            onClick={() => setIsChatOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#5856D6] hover:bg-[#4A48C8] shadow-2xs cursor-pointer transition-all duration-200 active:scale-[0.98]"
            title="Toggle AI ER Modeling Assistant"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>
        </div>
      </div>

      {nodes.length === 0 && (
        <div
          id="empty-canvas-banner"
          className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center p-4"
        >
          <div className="pointer-events-auto max-w-sm rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl p-6 text-center space-y-3 shadow-lg">
            <div className={`w-10 h-10 rounded-2xl ${isEer ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200/60 dark:border-purple-900/40 text-purple-600 dark:text-purple-400' : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/60 dark:border-blue-900/40 text-blue-600 dark:text-blue-400'} border mx-auto flex items-center justify-center`}>
              {isEer ? <Layers className="w-5 h-5" /> : <Database className="w-5 h-5" />}
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {isEer ? 'EER Canvas is Empty' : 'ER Canvas is Empty'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {isEer
                ? 'Drag superclasses, subclasses, or disjoint/overlap constraint circles from the palette, or click below to load the Vehicle hierarchy template.'
                : 'Drag entities, attributes, and relationships from the palette or click below to load the Customer-Order starter schema.'}
            </p>
            <button
              id="empty-load-sample-btn"
              type="button"
              onClick={resetDiagram}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white ${
                isEer ? 'bg-[#9333EA] hover:bg-[#7E22CE]' : 'bg-[#0071E3] hover:bg-[#0077ED]'
              } shadow-2xs cursor-pointer transition-all duration-200 active:scale-[0.98]`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Load {isEer ? 'EER' : 'ER'} Sample Diagram</span>
            </button>
          </div>
        </div>
      )}

      <ReactFlow
        id="react-flow-instance"
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={canonicalEdgesChange}
        onConnect={onConnect}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        connectionMode={ConnectionMode.Loose}
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
        defaultEdgeOptions={{
          type: 'cardinality',
          style: { strokeWidth: 2, stroke: isEer ? '#a855f7' : '#94a3b8' },
        }}
        className="bg-[#F5F5F7] dark:bg-[#000000] transition-colors"
      >
        <Background gap={20} size={1.2} color="#8E8E93" className="opacity-25 dark:opacity-20" />
        <Controls
          id="react-flow-controls"
          className="!bg-white/80 dark:!bg-[#1C1C1E]/80 !border-black/[0.06] dark:!border-white/[0.08] !shadow-sm rounded-2xl backdrop-blur-xl dark:!text-zinc-200 [&>button]:!border-black/[0.06] dark:[&>button]:!border-white/[0.08] dark:[&>button]:!fill-zinc-300"
        />
        <MiniMap
          id="react-flow-minimap"
          nodeStrokeWidth={2}
          nodeColor={(node) => {
            if (node.type === 'specialization') return '#9333ea';
            if (node.type === 'entity' || node.type === 'crowsfootEntity' || node.type === 'umlClass') {
              return node.data?.isSuperclass ? '#2563eb' : node.data?.isSubclass ? '#0891b2' : '#0071E3';
            }
            if (node.type === 'attribute') return '#34C759';
            if (node.type === 'relationship') return '#FF9500';
            return '#8E8E93';
          }}
          className="!bg-white/80 dark:!bg-[#1C1C1E]/80 !border-black/[0.06] dark:!border-white/[0.08] rounded-2xl shadow-sm backdrop-blur-xl"
        />
      </ReactFlow>

      <SqlModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
        sqlContent={generatedSql}
      />

      <ImportAI
        isOpen={isImportAiOpen}
        onClose={() => setIsImportAiOpen(false)}
      />

      <ChatBuilder
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen((prev) => !prev)}
      />

      <NotationLegendModal
        isOpen={isLegendOpen}
        onClose={() => setIsLegendOpen(false)}
        selectedNotation={selectedNotation}
        onSelectNotation={setSelectedNotation}
      />

      <SavedSchemasModal
        isOpen={isSchemasModalOpen}
        onClose={() => setIsSchemasModalOpen(false)}
      />
    </div>
  );
}

export default function DiagramBuilder() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div id="diagram-builder-view" className="flex flex-row flex-1 h-full w-full overflow-hidden">
      {sidebarOpen && <Sidebar />}
      <ReactFlowProvider>
        <DiagramFlow sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </ReactFlowProvider>
    </div>
  );
}
