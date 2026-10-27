import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  ConnectionMode,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useNavbar } from '../context/NavContext.jsx';
import {
  GraduationCap,
  Award,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  LayoutGrid,
  Table,
  BookOpen,
  Layers,
  Boxes,
  Key,
  Diamond,
  Eye,
  PanelLeftClose,
  PanelLeftOpen,
  Hash,
  X,
  Trash2,
  Search,
  Maximize2,
  Minimize2,
  Plus,
  HelpCircle as QuestionIcon,
  Wand2,
  RefreshCw,
  Sliders,
  Check,
  Compass,
  FileQuestion,
  Lightbulb,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  Sun,
  Moon,
  Database,
  ArrowLeftRight,
  ListChecks,
  RotateCcw,
  FileText,
  CheckCheck,
  Cloud,
  Save,
} from 'lucide-react';
import { useDiagram } from '../context/DiagramContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  saveQuestionProgress,
  subscribeToUserPracticeProgress,
} from '../utils/databaseService.js';

import EntityNode from '../components/nodes/EntityNode.jsx';
import AttributeNode from '../components/nodes/AttributeNode.jsx';
import RelationshipNode from '../components/nodes/RelationshipNode.jsx';
import SpecializationNode from '../components/nodes/SpecializationNode.jsx';
import CrowsFootNode from '../components/nodes/CrowsFootNode.jsx';
import UmlClassNode from '../components/nodes/UmlClassNode.jsx';
import CardinalityEdge from '../components/edges/CardinalityEdge.jsx';
import { PRACTICE_QUESTIONS } from '../data/practiceQuestions';
import { evaluateDiagram } from '../utils/evaluateDiagram';
import { getLayoutedElements } from '../utils/layoutEngine.js';
import { transformToNotation } from '../utils/notationAdapter.ts';
import {
  generatePracticeQuestion,
  PRESET_SCENARIOS,
} from '../utils/questionGenerator';

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

// Full catalogue of Chen ER & EER components
const TOOLBOX_ELEMENTS = [
  {
    id: 'entity-strong',
    category: 'entity',
    categoryLabel: 'Entities',
    name: 'Strong Entity',
    desc: 'Independent object / main relation table',
    type: 'entity',
    defaultLabel: 'Entity',
    customData: {},
    notationBadge: 'Rectangle',
    shapeType: 'rect',
    theme: 'blue',
    notations: ['chen', 'min_max', 'minmax'],
  },
  {
    id: 'entity-weak',
    category: 'entity',
    categoryLabel: 'Entities',
    name: 'Weak Entity',
    desc: 'Existence dependent on owner entity',
    type: 'entity',
    defaultLabel: 'WeakEntity',
    customData: { isWeak: true },
    notationBadge: 'Double Rect',
    shapeType: 'double-rect',
    theme: 'indigo',
    notations: ['chen', 'min_max', 'minmax'],
  },
  {
    id: 'entity-superclass',
    category: 'entity',
    categoryLabel: 'Entities',
    name: 'Superclass Entity',
    desc: 'Generalizing parent in EER specialization',
    type: 'entity',
    defaultLabel: 'Superclass',
    customData: { isSuperclass: true },
    notationBadge: 'SUP Rect',
    shapeType: 'sup-rect',
    theme: 'blue',
    isEerOnly: true,
    notations: ['chen', 'min_max', 'minmax'],
  },
  {
    id: 'entity-subclass',
    category: 'entity',
    categoryLabel: 'Entities',
    name: 'Subclass Entity',
    desc: 'Specialized entity inheriting superclass attributes',
    type: 'entity',
    defaultLabel: 'Subclass',
    customData: { isSubclass: true },
    notationBadge: 'SUB Rect',
    shapeType: 'sub-rect',
    theme: 'cyan',
    isEerOnly: true,
    notations: ['chen', 'min_max', 'minmax'],
  },
  {
    id: 'cf-table-entity',
    category: 'entity',
    categoryLabel: 'Tables',
    name: 'Entity Table Card',
    desc: 'Crow’s foot entity table with embedded attributes',
    type: 'entity',
    defaultLabel: 'Customer',
    customData: {
      defaultAttributes: [
        { name: 'customer_id', isPrimary: true, dataType: 'INT' },
        { name: 'name', dataType: 'VARCHAR' },
        { name: 'email', dataType: 'VARCHAR' },
      ],
    },
    notationBadge: 'Table Card',
    shapeType: 'rect',
    theme: 'blue',
    notations: ['crows_foot', 'crowsfoot'],
  },
  {
    id: 'cf-table-weak',
    category: 'entity',
    categoryLabel: 'Tables',
    name: 'Dependent Table (Weak)',
    desc: 'Child relation dependent on owner entity',
    type: 'entity',
    defaultLabel: 'OrderItem',
    customData: {
      isWeak: true,
      defaultAttributes: [
        { name: 'item_no', isPrimary: true, dataType: 'INT' },
        { name: 'quantity', dataType: 'INT' },
        { name: 'price', dataType: 'DECIMAL' },
      ],
    },
    notationBadge: 'Weak Table',
    shapeType: 'double-rect',
    theme: 'indigo',
    notations: ['crows_foot', 'crowsfoot'],
  },
  {
    id: 'cf-table-sup',
    category: 'entity',
    categoryLabel: 'Tables',
    name: 'Superclass Table',
    desc: 'Generalization root in EER hierarchy',
    type: 'entity',
    defaultLabel: 'Vehicle',
    customData: {
      isSuperclass: true,
      defaultAttributes: [
        { name: 'vin', isPrimary: true, dataType: 'VARCHAR' },
        { name: 'make', dataType: 'VARCHAR' },
      ],
    },
    notationBadge: 'SUP Table',
    shapeType: 'sup-rect',
    theme: 'blue',
    isEerOnly: true,
    notations: ['crows_foot', 'crowsfoot'],
  },
  {
    id: 'uml-class-box',
    category: 'entity',
    categoryLabel: 'Classes',
    name: 'UML Class Box',
    desc: '3-compartment class: Name, Attributes, Operations',
    type: 'entity',
    defaultLabel: 'Customer',
    customData: {
      defaultAttributes: [
        { name: 'id', isPrimary: true, dataType: 'INT' },
        { name: 'name', dataType: 'VARCHAR' },
      ],
      methods: ['+ getId(): int', '+ getName(): string'],
    },
    notationBadge: 'Class Box',
    shapeType: 'rect',
    theme: 'blue',
    notations: ['uml'],
  },
  {
    id: 'uml-class-abstract',
    category: 'entity',
    categoryLabel: 'Classes',
    name: '«Abstract» Class',
    desc: 'Generalizing abstract class box',
    type: 'entity',
    defaultLabel: 'Account',
    customData: {
      isSuperclass: true,
      defaultAttributes: [
        { name: 'accountNo', isPrimary: true, dataType: 'VARCHAR' },
      ],
      methods: ['+ getBalance(): decimal'],
    },
    notationBadge: '«Abstract»',
    shapeType: 'sup-rect',
    theme: 'blue',
    isEerOnly: true,
    notations: ['uml'],
  },
  {
    id: 'uml-class-subclass',
    category: 'entity',
    categoryLabel: 'Classes',
    name: '«Subclass» Spec.',
    desc: 'Specialized derived class box',
    type: 'entity',
    defaultLabel: 'SavingsAccount',
    customData: {
      isSubclass: true,
      defaultAttributes: [
        { name: 'interestRate', dataType: 'DECIMAL' },
      ],
      methods: ['+ calculateInterest()'],
    },
    notationBadge: '«Subclass»',
    shapeType: 'sub-rect',
    theme: 'cyan',
    isEerOnly: true,
    notations: ['uml'],
  },
  {
    id: 'attr-pk',
    category: 'attribute',
    categoryLabel: 'Attributes',
    name: 'Primary Key (PK)',
    desc: 'Underlined unique entity identifier',
    type: 'attribute',
    defaultLabel: 'id',
    customData: { isPrimary: true },
    notationBadge: 'Underlined Oval',
    shapeType: 'pk-oval',
    theme: 'emerald',
    notations: ['chen', 'min_max', 'minmax'],
  },
  {
    id: 'attr-simple',
    category: 'attribute',
    categoryLabel: 'Attributes',
    name: 'Simple Attribute',
    desc: 'Standard single-valued attribute oval',
    type: 'attribute',
    defaultLabel: 'name',
    customData: {},
    notationBadge: 'Oval',
    shapeType: 'oval',
    theme: 'emerald',
    notations: ['chen', 'min_max', 'minmax'],
  },
  {
    id: 'attr-multivalued',
    category: 'attribute',
    categoryLabel: 'Attributes',
    name: 'Multivalued Attribute',
    desc: 'Attribute holding multiple values (e.g. phones)',
    type: 'attribute',
    defaultLabel: 'phones',
    customData: { isMultivalued: true },
    notationBadge: 'Double Oval',
    shapeType: 'double-oval',
    theme: 'emerald',
    isEerOnly: true,
    notations: ['chen', 'min_max', 'minmax'],
  },
  {
    id: 'attr-derived',
    category: 'attribute',
    categoryLabel: 'Attributes',
    name: 'Derived Attribute',
    desc: 'Computed dynamically from another attribute',
    type: 'attribute',
    defaultLabel: 'age',
    customData: { isDerived: true },
    notationBadge: 'Dashed Oval',
    shapeType: 'dashed-oval',
    theme: 'emerald',
    isEerOnly: true,
    notations: ['chen', 'min_max', 'minmax'],
  },
  {
    id: 'attr-partial-key',
    category: 'attribute',
    categoryLabel: 'Attributes',
    name: 'Partial Key / Discriminator',
    desc: 'Dashed underlined identifier for weak entity',
    type: 'attribute',
    defaultLabel: 'part_no',
    customData: { isPartialKey: true },
    notationBadge: 'Dashed Underline',
    shapeType: 'partial-oval',
    theme: 'teal',
    isEerOnly: true,
    notations: ['chen', 'min_max', 'minmax'],
  },
  {
    id: 'rel-standard',
    category: 'relationship',
    categoryLabel: 'Relationships',
    name: 'Relationship',
    desc: 'Standard relationship diamond between entities',
    type: 'relationship',
    defaultLabel: 'Relates',
    customData: {},
    notationBadge: 'Diamond',
    shapeType: 'diamond',
    theme: 'amber',
    notations: ['chen', 'min_max', 'minmax'],
  },
  {
    id: 'rel-identifying',
    category: 'relationship',
    categoryLabel: 'Relationships',
    name: 'Identifying Rel.',
    desc: 'Connects weak entity to owner entity',
    type: 'relationship',
    defaultLabel: 'Identifies',
    customData: { isIdentifying: true },
    notationBadge: 'Double Diamond',
    shapeType: 'double-diamond',
    theme: 'amber',
    notations: ['chen', 'min_max', 'minmax'],
  },
  {
    id: 'eer-disjoint',
    category: 'eer',
    categoryLabel: 'EER / ISA',
    name: 'Disjoint Specialization (d)',
    desc: 'Subclasses are mutually exclusive (Circle d)',
    type: 'specialization',
    defaultLabel: 'd',
    customData: { specType: 'disjoint', isTotal: false },
    notationBadge: 'Circle (d)',
    shapeType: 'circle-d',
    theme: 'purple',
    isEerOnly: true,
    notations: ['chen', 'min_max', 'minmax'],
  },
  {
    id: 'eer-overlapping',
    category: 'eer',
    categoryLabel: 'EER / ISA',
    name: 'Overlapping Specialization (o)',
    desc: 'Entity can belong to multiple subclasses (Circle o)',
    type: 'specialization',
    defaultLabel: 'o',
    customData: { specType: 'overlapping', isTotal: false },
    notationBadge: 'Circle (o)',
    shapeType: 'circle-o',
    theme: 'purple',
    isEerOnly: true,
    notations: ['chen', 'min_max', 'minmax'],
  },
  {
    id: 'eer-union',
    category: 'eer',
    categoryLabel: 'EER / ISA',
    name: 'Category / Union (U)',
    desc: 'Union of distinct superclasses (Circle U)',
    type: 'specialization',
    defaultLabel: 'U',
    customData: { specType: 'union', isTotal: false },
    notationBadge: 'Circle (U)',
    shapeType: 'circle-u',
    theme: 'purple',
    isEerOnly: true,
    notations: ['chen', 'min_max', 'minmax'],
  },
  {
    id: 'eer-total-disjoint',
    category: 'eer',
    categoryLabel: 'EER / ISA',
    name: 'Total Disjoint ISA (d - Total)',
    desc: 'Mandatory participation in subclasses (Double line/circle)',
    type: 'specialization',
    defaultLabel: 'd',
    customData: { specType: 'disjoint', isTotal: true },
    notationBadge: 'Double Circle (d)',
    shapeType: 'double-circle-d',
    theme: 'purple',
    isEerOnly: true,
    notations: ['chen', 'min_max', 'minmax'],
  },
];

function generateSolutionGraph(question) {
  const nodes = [];
  const edges = [];
  const { groundTruth } = question;

  if (!groundTruth || !groundTruth.entities) {
    return { nodes: [], edges: [] };
  }

  groundTruth.entities.forEach((ent, eIdx) => {
    const entId = `ent-${ent.name.toLowerCase()}`;
    nodes.push({
      id: entId,
      type: 'entity',
      position: { x: 100 + eIdx * 250, y: 150 },
      data: {
        label: ent.name,
        isWeak: Boolean(ent.isWeak),
        isSuperclass: Boolean(ent.isSuperclass),
        isSubclass: Boolean(ent.isSubclass),
      },
    });

    if (ent.attributes) {
      ent.attributes.forEach((attr, aIdx) => {
        const attrId = `attr-${ent.name.toLowerCase()}-${attr.name.toLowerCase()}`;
        nodes.push({
          id: attrId,
          type: 'attribute',
          position: { x: 80 + eIdx * 250 + aIdx * 60, y: 50 + (aIdx % 2) * 40 },
          data: {
            label: attr.name,
            isPrimary: Boolean(attr.isPrimary),
            isMultivalued: Boolean(attr.isMultivalued),
            isDerived: Boolean(attr.isDerived),
          },
        });

        edges.push({
          id: `e-${entId}-${attrId}`,
          source: entId,
          target: attrId,
          type: 'cardinality',
        });
      });
    }
  });

  if (groundTruth.relationships) {
    groundTruth.relationships.forEach((rel, rIdx) => {
      const relId = `rel-${rel.name.toLowerCase()}`;
      nodes.push({
        id: relId,
        type: 'relationship',
        position: { x: 220 + rIdx * 200, y: 280 },
        data: {
          label: rel.name,
          isIdentifying: Boolean(rel.isIdentifying),
        },
      });

      if (rel.attributes) {
        rel.attributes.forEach((attr, aIdx) => {
          const attrId = `attr-rel-${rel.name.toLowerCase()}-${attr.name.toLowerCase()}`;
          nodes.push({
            id: attrId,
            type: 'attribute',
            position: { x: 220 + rIdx * 200 + aIdx * 60, y: 380 },
            data: {
              label: attr.name,
              isPrimary: Boolean(attr.isPrimary),
            },
          });

          edges.push({
            id: `e-${relId}-${attrId}`,
            source: relId,
            target: attrId,
            type: 'cardinality',
          });
        });
      }

      if (rel.connections) {
        rel.connections.forEach((conn) => {
          const targetEntId = `ent-${conn.entity.toLowerCase()}`;
          edges.push({
            id: `e-${relId}-${targetEntId}`,
            source: relId,
            target: targetEntId,
            type: 'cardinality',
            label: conn.cardinality,
            data: {
              cardinality: conn.cardinality,
              isTotal: Boolean(conn.isTotal),
              doubleLine: Boolean(conn.isTotal),
            },
          });
        });
      }
    });
  }

  if (groundTruth.specializations) {
    groundTruth.specializations.forEach((spec) => {
      const specId = `spec-${spec.superclass.toLowerCase()}`;
      const superId = `ent-${spec.superclass.toLowerCase()}`;

      nodes.push({
        id: specId,
        type: 'specialization',
        position: { x: 250, y: 280 },
        data: {
          label: spec.specType.charAt(0),
          specType: spec.specType,
          isTotal: Boolean(spec.isTotal),
        },
      });

      edges.push({
        id: `e-${superId}-${specId}`,
        source: superId,
        target: specId,
        type: 'cardinality',
        label: 'ISA',
        data: {
          cardinality: 'ISA',
          isTotal: Boolean(spec.isTotal),
          doubleLine: Boolean(spec.isTotal),
        },
      });

      if (spec.subclasses) {
        spec.subclasses.forEach((subName) => {
          const subId = `ent-${subName.toLowerCase()}`;
          edges.push({
            id: `e-${specId}-${subId}`,
            source: specId,
            target: subId,
            type: 'cardinality',
            label: 'Subclass',
            data: {
              cardinality: 'Subclass',
            },
          });
        });
      }
    });
  }

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, 'TB');
  return { nodes: layoutedNodes, edges: layoutedEdges };
}

function AutoExpandingTextarea({
  id,
  value = '',
  onChange,
  placeholder,
  disabled = false,
  minHeight = 76,
}) {
  const textareaRef = useRef(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(minHeight, el.scrollHeight)}px`;
  }, [minHeight]);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  return (
    <textarea
      id={id}
      ref={textareaRef}
      rows={2}
      value={value}
      disabled={disabled}
      onChange={(e) => {
        onChange(e.target.value);
        adjustHeight();
      }}
      placeholder={placeholder}
      className={`w-full text-xs font-sans p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border transition-all text-zinc-900 dark:text-zinc-100 outline-none resize-none overflow-hidden ${
        disabled
          ? 'opacity-80 cursor-not-allowed border-black/[0.08] dark:border-white/[0.08]'
          : 'border-black/[0.1] dark:border-white/[0.1] focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'
      } placeholder:text-zinc-400`}
    />
  );
}

export default function PracticeArena() {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const { diagramMode, switchMode, selectedNotation } = useDiagram();
  const isEer = diagramMode === 'eer';
  const navigate = useNavigate();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const [questionsList, setQuestionsList] = useState(PRACTICE_QUESTIONS);
  const [selectedQuestion, setSelectedQuestion] = useState(PRACTICE_QUESTIONS[0]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);
  const [isTargetTablesOpen, setIsTargetTablesOpen] = useState(true);
  const [isConstraintsOpen, setIsConstraintsOpen] = useState(true);
  const [openHints, setOpenHints] = useState({});
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [evaluationActiveTab, setEvaluationActiveTab] = useState('explanation');

  // Sub-questions comprehension state
  const [userSubAnswers, setUserSubAnswers] = useState({});
  const [isSubSubmitted, setIsSubSubmitted] = useState(false);
  const [subFeedback, setSubFeedback] = useState({});

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genExam, setGenExam] = useState('GATE CS');
  const [genCategory, setGenCategory] = useState('Table Reduction');
  const [genDifficulty, setGenDifficulty] = useState('Medium');
  const [genCustomPrompt, setGenCustomPrompt] = useState('');

  const [toolboxCategory, setToolboxCategory] = useState('all');
  const [isToolboxExpanded, setIsToolboxExpanded] = useState(false);
  const [toolboxSearch, setToolboxSearch] = useState('');

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const { user } = useAuth();
  const [practiceProgressMap, setPracticeProgressMap] = useState({});
  const practiceProgressMapRef = useRef({});
  const hasLoadedInitialProgressRef = useRef(false);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [saveStatusText, setSaveStatusText] = useState('');

  const transformedPractice = useMemo(() => {
    return transformToNotation(nodes, edges, selectedNotation || 'chen');
  }, [nodes, edges, selectedNotation]);

  const displayNodes = transformedPractice.nodes;
  const displayEdges = transformedPractice.edges;

  useEffect(() => {
    const unsubscribe = subscribeToUserPracticeProgress(user?.uid, (map) => {
      const pMap = map || {};
      setPracticeProgressMap(pMap);
      practiceProgressMapRef.current = pMap;
      if (!hasLoadedInitialProgressRef.current && selectedQuestion) {
        hasLoadedInitialProgressRef.current = true;
        const saved = pMap[selectedQuestion.id];
        if (saved?.savedNodes && Array.isArray(saved.savedNodes) && saved.savedNodes.length > 0) {
          setNodes(saved.savedNodes);
          setEdges(saved.savedEdges || []);
          if (saved.userSubAnswers) {
            setUserSubAnswers(saved.userSubAnswers);
          }
        }
      }
    });
    return () => unsubscribe();
  }, [user?.uid, selectedQuestion]);

  const loadQuestionToCanvas = useCallback(
    (q) => {
      if (!q) return;
      const saved = practiceProgressMapRef.current[q.id];
      if (saved?.savedNodes && Array.isArray(saved.savedNodes) && saved.savedNodes.length > 0) {
        setNodes(saved.savedNodes);
        setEdges(saved.savedEdges || []);
        setTimeout(() => {
          if (reactFlowInstance) {
            reactFlowInstance.fitView({ padding: 0.2 });
          }
        }, 80);
      } else if (q.type === 'diagram_analysis' || (q.subQuestions && q.subQuestions.length > 0)) {
        if (q.initialNodes && q.initialEdges) {
          setNodes(q.initialNodes);
          setEdges(q.initialEdges);
        } else if (q.groundTruth) {
          const { nodes: solNodes, edges: solEdges } = generateSolutionGraph(q);
          setNodes(solNodes);
          setEdges(solEdges);
        }
        setTimeout(() => {
          if (reactFlowInstance) {
            reactFlowInstance.fitView({ padding: 0.2 });
          }
        }, 80);
      } else {
        setNodes([]);
        setEdges([]);
      }
      if (saved?.userSubAnswers) {
        setUserSubAnswers(saved.userSubAnswers);
      } else {
        setUserSubAnswers({});
      }
      setIsSubSubmitted(false);
      setSubFeedback({});
      setEvaluationResult(null);
      setIsEvaluationModalOpen(false);
      setOpenHints({});
    },
    [reactFlowInstance, setNodes, setEdges]
  );

  const isQuestionReadyRef = useRef(false);

  const handleSelectQuestion = useCallback(
    (q) => {
      if (selectedQuestion && (nodes.length > 0 || Object.keys(userSubAnswers).length > 0)) {
        const prevProg = practiceProgressMapRef.current[selectedQuestion.id] || {};
        saveQuestionProgress(user?.uid, selectedQuestion.id, {
          status: prevProg.status || 'in-progress',
          score: prevProg.score ?? null,
          isPerfect: prevProg.isPerfect || false,
          userSubAnswers,
          mistakesCount: prevProg.mistakesCount ?? 0,
          savedNodes: nodes,
          savedEdges: edges,
        }).then((updatedProg) => {
          setPracticeProgressMap((prev) => ({
            ...prev,
            [selectedQuestion.id]: updatedProg,
          }));
          practiceProgressMapRef.current[selectedQuestion.id] = updatedProg;
        }).catch(() => {});
      }
      setSelectedQuestion(q);
      loadQuestionToCanvas(q);
    },
    [loadQuestionToCanvas, selectedQuestion, nodes, edges, userSubAnswers, user?.uid]
  );

  useEffect(() => {
    isQuestionReadyRef.current = false;
    const timer = setTimeout(() => {
      isQuestionReadyRef.current = true;
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedQuestion?.id]);

  useEffect(() => {
    if (!isQuestionReadyRef.current || !selectedQuestion) return;
    const timeoutId = setTimeout(() => {
      const prevProg = practiceProgressMapRef.current[selectedQuestion.id] || {};
      saveQuestionProgress(user?.uid, selectedQuestion.id, {
        status: prevProg.status || 'in-progress',
        score: prevProg.score ?? null,
        isPerfect: prevProg.isPerfect || false,
        userSubAnswers,
        mistakesCount: prevProg.mistakesCount ?? 0,
        savedNodes: nodes,
        savedEdges: edges,
      }).then((updatedProg) => {
        setPracticeProgressMap((prev) => ({
          ...prev,
          [selectedQuestion.id]: updatedProg,
        }));
        practiceProgressMapRef.current[selectedQuestion.id] = updatedProg;
        setSaveStatusText('Auto-saved');
        setTimeout(() => setSaveStatusText(''), 2000);
      }).catch(() => {});
    }, 1800);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, userSubAnswers, selectedQuestion?.id, user?.uid]);

  useEffect(() => {
    if (
      selectedQuestion &&
      (selectedQuestion.type === 'diagram_analysis' || selectedQuestion.subQuestions?.length > 0)
    ) {
      const saved = practiceProgressMapRef.current[selectedQuestion.id];
      if (saved?.savedNodes && Array.isArray(saved.savedNodes) && saved.savedNodes.length > 0) {
        setNodes(saved.savedNodes);
        setEdges(saved.savedEdges || []);
      } else if (selectedQuestion.initialNodes && selectedQuestion.initialEdges) {
        setNodes(selectedQuestion.initialNodes);
        setEdges(selectedQuestion.initialEdges);
      } else if (selectedQuestion.groundTruth) {
        const { nodes: solNodes, edges: solEdges } = generateSolutionGraph(selectedQuestion);
        setNodes(solNodes);
        setEdges(solEdges);
      }
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.2 });
        }
      }, 100);
    }
  }, [reactFlowInstance, selectedQuestion]);

  const filteredQuestions = useMemo(() => {
    if (categoryFilter === 'All') return questionsList;
    return questionsList.filter((q) => q.category === categoryFilter);
  }, [questionsList, categoryFilter]);

  const handleCategoryChange = useCallback(
    (cat) => {
      setCategoryFilter(cat);
      const matching =
        cat === 'All' ? questionsList : questionsList.filter((q) => q.category === cat);
      if (matching.length > 0) {
        // Automatically switch to the first question in the selected category
        handleSelectQuestion(matching[0]);
      }
    },
    [questionsList, handleSelectQuestion]
  );

  const currentFilteredIndex = useMemo(() => {
    return filteredQuestions.findIndex((q) => q.id === selectedQuestion?.id);
  }, [filteredQuestions, selectedQuestion]);

  const handlePrevQuestion = () => {
    if (filteredQuestions.length === 0) return;
    const nextIdx =
      currentFilteredIndex > 0 ? currentFilteredIndex - 1 : filteredQuestions.length - 1;
    handleSelectQuestion(filteredQuestions[nextIdx]);
  };

  const handleNextQuestion = () => {
    if (filteredQuestions.length === 0) return;
    const nextIdx =
      currentFilteredIndex < filteredQuestions.length - 1 ? currentFilteredIndex + 1 : 0;
    handleSelectQuestion(filteredQuestions[nextIdx]);
  };

  const filteredToolboxElements = useMemo(() => {
    const curNot = (selectedNotation || 'chen').toLowerCase();
    const isEer = diagramMode === 'eer';
    return TOOLBOX_ELEMENTS.filter((el) => {
      const matchNotation = !el.notations || el.notations.includes(curNot);
      const matchMode = isEer ? true : !el.isEerOnly;
      const matchCat = toolboxCategory === 'all' || el.category === toolboxCategory;
      const matchSearch =
        toolboxSearch.trim() === '' ||
        el.name.toLowerCase().includes(toolboxSearch.toLowerCase()) ||
        el.desc.toLowerCase().includes(toolboxSearch.toLowerCase()) ||
        el.categoryLabel.toLowerCase().includes(toolboxSearch.toLowerCase()) ||
        el.notationBadge.toLowerCase().includes(toolboxSearch.toLowerCase());
      return matchNotation && matchMode && matchCat && matchSearch;
    });
  }, [toolboxCategory, toolboxSearch, selectedNotation, diagramMode]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      let defaultCardinality = '';
      if (
        (sourceNode?.type === 'relationship' && targetNode?.type === 'entity') ||
        (sourceNode?.type === 'entity' && targetNode?.type === 'relationship')
      ) {
        defaultCardinality = 'N';
      } else if (
        sourceNode?.type === 'specialization' ||
        targetNode?.type === 'specialization'
      ) {
        defaultCardinality = 'ISA';
      }

      const newEdge = {
        ...params,
        id: `e-${params.source}-${params.target}-${Date.now()}`,
        type: 'cardinality',
        label: defaultCardinality,
        data: {
          cardinality: defaultCardinality,
          isTotal: false,
          doubleLine: false,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [nodes]
  );

  const handleSubAnswerChange = (subId, val) => {
    setUserSubAnswers((prev) => ({ ...prev, [subId]: val }));
  };

  const handleCheckSubQuestions = async () => {
    if (!selectedQuestion?.subQuestions) return;
    const feedbackMap = {};
    let totalQuestions = 0;
    let correctCount = 0;

    selectedQuestion.subQuestions.forEach((sq) => {
      const userVal = userSubAnswers[sq.id];
      totalQuestions++;
      if (sq.type === 'mcq') {
        const isCorrect =
          String(userVal || '').trim().toLowerCase() ===
          String(sq.correctAnswer || '').trim().toLowerCase();
        if (isCorrect) correctCount++;
        feedbackMap[sq.id] = {
          isCorrect,
          userVal,
          expected: sq.correctAnswer,
          explanation: sq.explanation,
        };
      } else if (sq.type === 'numerical') {
        const parsedUser = Number(String(userVal || '').trim());
        const parsedExpected = Number(sq.correctAnswer);
        const isCorrect = !isNaN(parsedUser) && parsedUser === parsedExpected;
        if (isCorrect) correctCount++;
        feedbackMap[sq.id] = {
          isCorrect,
          userVal,
          expected: sq.correctAnswer,
          explanation: sq.explanation,
        };
      } else if (sq.type === 'text') {
        correctCount++;
        feedbackMap[sq.id] = {
          isCorrect: true,
          userVal,
          expected: sq.correctAnswer,
          explanation: sq.explanation,
        };
      }
    });

    setSubFeedback(feedbackMap);
    setIsSubSubmitted(true);

    const isAllCorrect = correctCount === totalQuestions && totalQuestions > 0;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
    const prevProg = practiceProgressMapRef.current[selectedQuestion.id] || {};
    const isCompleted = Boolean(
      isAllCorrect ||
      (totalQuestions > 0 && correctCount / totalQuestions >= 0.70) ||
      prevProg.status === 'completed'
    );

    try {
      const updatedProg = await saveQuestionProgress(user?.uid, selectedQuestion.id, {
        status: isCompleted ? 'completed' : 'in-progress',
        score,
        isPerfect: isAllCorrect,
        userSubAnswers,
        mistakesCount: totalQuestions - correctCount,
        savedNodes: nodes,
        savedEdges: edges,
      });

      setPracticeProgressMap((prev) => ({
        ...prev,
        [selectedQuestion.id]: updatedProg,
      }));
      practiceProgressMapRef.current[selectedQuestion.id] = updatedProg;
    } catch (err) {
      console.warn('Error saving question progress on sub-questions check:', err);
    }
  };

  const handleResetSubQuestions = () => {
    setUserSubAnswers({});
    setIsSubSubmitted(false);
    setSubFeedback({});
  };

  const handleAddNode = (type, label, customData = {}) => {
    const id = `${type}-${Date.now()}`;
    const x = 240 + Math.floor(Math.random() * 140);
    const y = 160 + Math.floor(Math.random() * 120);
    const newNode = {
      id,
      type,
      position: { x, y },
      data: {
        label,
        ...customData,
      },
    };

    const newNodes = [newNode];
    const newEdges = [];

    if (customData?.defaultAttributes && Array.isArray(customData.defaultAttributes)) {
      customData.defaultAttributes.forEach((attr, idx) => {
        const attrId = `attr-${id}-${idx}-${Date.now()}`;
        const angle = (idx / customData.defaultAttributes.length) * 2 * Math.PI - Math.PI / 2;
        const radius = 130;
        const attrX = x + Math.cos(angle) * radius;
        const attrY = y + Math.sin(angle) * radius;

        newNodes.push({
          id: attrId,
          type: 'attribute',
          position: { x: attrX, y: attrY },
          data: {
            label: attr.name,
            isPrimary: Boolean(attr.isPrimary),
            isMultivalued: Boolean(attr.isMultivalued),
            isDerived: Boolean(attr.isDerived),
            dataType: attr.dataType || 'VARCHAR',
          },
        });

        newEdges.push({
          id: `e-${id}-${attrId}-${Date.now()}`,
          source: id,
          target: attrId,
          type: 'cardinality',
          label: '',
          data: { cardinality: '' },
        });
      });
    }

    setNodes((nds) => [...nds, ...newNodes]);
    if (newEdges.length > 0) {
      setEdges((eds) => [...eds, ...newEdges]);
    }
  };

  const onDragStart = (event, nodeType, defaultLabel, customData = {}) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.setData('application/reactflow/label', defaultLabel);
    event.dataTransfer.setData('application/reactflow/custom', JSON.stringify(customData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow/type');
      const label = event.dataTransfer.getData('application/reactflow/label') || 'Node';
      const customRaw = event.dataTransfer.getData('application/reactflow/custom');
      let customData = {};
      try {
        if (customRaw) customData = JSON.parse(customRaw);
      } catch (e) {
        // ignore
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

      const id = `${type}-${Date.now()}`;
      const newNode = {
        id,
        type,
        position,
        data: {
          label,
          ...customData,
        },
      };

      const newNodes = [newNode];
      const newEdges = [];

      if (customData?.defaultAttributes && Array.isArray(customData.defaultAttributes)) {
        customData.defaultAttributes.forEach((attr, idx) => {
          const attrId = `attr-${id}-${idx}-${Date.now()}`;
          const angle = (idx / customData.defaultAttributes.length) * 2 * Math.PI - Math.PI / 2;
          const radius = 130;
          const attrX = position.x + Math.cos(angle) * radius;
          const attrY = position.y + Math.sin(angle) * radius;

          newNodes.push({
            id: attrId,
            type: 'attribute',
            position: { x: attrX, y: attrY },
            data: {
              label: attr.name,
              isPrimary: Boolean(attr.isPrimary),
              isMultivalued: Boolean(attr.isMultivalued),
              isDerived: Boolean(attr.isDerived),
              dataType: attr.dataType || 'VARCHAR',
            },
          });

          newEdges.push({
            id: `e-${id}-${attrId}-${Date.now()}`,
            source: id,
            target: attrId,
            type: 'cardinality',
            label: '',
            data: { cardinality: '' },
          });
        });
      }

      setNodes((nds) => [...nds, ...newNodes]);
      if (newEdges.length > 0) {
        setEdges((eds) => [...eds, ...newEdges]);
      }
    },
    [reactFlowInstance, setNodes, setEdges]
  );

  const handleAutoLayout = useCallback(() => {
    if (nodes.length === 0) return;
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, { direction: 'TB' });
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
      }
    }, 50);
  }, [nodes, edges, setNodes, setEdges, reactFlowInstance]);

  const handleLoadSolution = useCallback(() => {
    if (!selectedQuestion) return;
    const { nodes: solNodes, edges: solEdges } = generateSolutionGraph(selectedQuestion);
    setNodes(solNodes);
    setEdges(solEdges);
    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
      }
    }, 50);
  }, [selectedQuestion, setNodes, setEdges, reactFlowInstance]);

  const handleClearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setEvaluationResult(null);
  }, [setNodes, setEdges]);

  const handleVerifyDiagram = useCallback(async () => {
    if (!selectedQuestion) return;
    const res = evaluateDiagram(nodes, edges, selectedQuestion);
    setEvaluationResult(res);
    if (res.mistakes && res.mistakes.length > 0) {
      setEvaluationActiveTab('explanation');
    } else {
      setEvaluationActiveTab('verification');
    }
    setIsEvaluationModalOpen(true);

    const prevProg = practiceProgressMapRef.current[selectedQuestion.id] || {};
    const criticalMistakes = res.mistakes?.filter((m) => m.severity === 'critical') || [];
    const isCompleted = Boolean(
      res.passed ||
      res.score >= 70 ||
      (criticalMistakes.length === 0 && res.score >= 50) ||
      prevProg.status === 'completed'
    );

    try {
      const updatedProg = await saveQuestionProgress(user?.uid, selectedQuestion.id, {
        status: isCompleted ? 'completed' : 'in-progress',
        score: res.score,
        isPerfect: Boolean(res.score === 100),
        userSubAnswers,
        mistakesCount: res.mistakes?.length || 0,
        savedNodes: nodes,
        savedEdges: edges,
      });

      setPracticeProgressMap((prev) => ({
        ...prev,
        [selectedQuestion.id]: updatedProg,
      }));
      practiceProgressMapRef.current[selectedQuestion.id] = updatedProg;
    } catch (err) {
      console.warn('Error saving question progress on verify:', err);
    }
  }, [nodes, edges, selectedQuestion, user?.uid, userSubAnswers]);

  const handleSaveDiagramProgress = useCallback(async () => {
    if (!selectedQuestion) return;
    setIsSavingProgress(true);
    try {
      const prevProgress = practiceProgressMapRef.current[selectedQuestion.id] || {};
      const updatedProg = await saveQuestionProgress(user?.uid, selectedQuestion.id, {
        status: prevProgress.status || 'in-progress',
        score: prevProgress.score ?? null,
        isPerfect: prevProgress.isPerfect || false,
        userSubAnswers,
        mistakesCount: prevProgress.mistakesCount ?? 0,
        savedNodes: nodes,
        savedEdges: edges,
      });
      setPracticeProgressMap((prev) => ({
        ...prev,
        [selectedQuestion.id]: updatedProg,
      }));
      practiceProgressMapRef.current[selectedQuestion.id] = updatedProg;
      setSaveStatusText(user ? 'Saved to Cloud' : 'Saved Locally');
      setTimeout(() => setSaveStatusText(''), 2500);
    } catch (err) {
      console.error('Save progress error:', err);
      setSaveStatusText('Save Failed');
      setTimeout(() => setSaveStatusText(''), 2500);
    } finally {
      setIsSavingProgress(false);
    }
  }, [selectedQuestion, user, userSubAnswers, nodes, edges]);

  const handleGenerateNewQuestion = async () => {
    setIsGenerating(true);
    try {
      const newQuestion = await generatePracticeQuestion({
        exam: genExam,
        category: genCategory,
        difficulty: genDifficulty,
        customScenario: genCustomPrompt,
      });

      setQuestionsList((prev) => [newQuestion, ...prev]);
      setSelectedQuestion(newQuestion);
      setNodes([]);
      setEdges([]);
      setEvaluationResult(null);
      setIsEvaluationModalOpen(false);
      setIsGenerateModalOpen(false);
      setGenCustomPrompt('');
    } catch (err) {
      console.error('Failed to generate question:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadPresetScenario = (preset) => {
    setGenExam(preset.exam);
    setGenCategory(preset.category);
    setGenDifficulty(preset.difficulty);
    setGenCustomPrompt(preset.prompt);
  };

  const selectedEdge = edges.find((e) => e.selected);
  const updateSelectedEdgeCard = (card) => {
    if (!selectedEdge) return;
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === selectedEdge.id) {
          return {
            ...edge,
            label: card,
            data: {
              ...edge.data,
              cardinality: card,
            },
          };
        }
        return edge;
      })
    );
  };

  const toggleSelectedEdgeTotal = () => {
    if (!selectedEdge) return;
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === selectedEdge.id) {
          const currentTotal = Boolean(edge.data?.isTotal || edge.data?.doubleLine);
          return {
            ...edge,
            data: {
              ...edge.data,
              isTotal: !currentTotal,
              doubleLine: !currentTotal,
            },
          };
        }
        return edge;
      })
    );
  };

  const { setPracticeConfig } = useNavbar();

  useEffect(() => {
    setPracticeConfig({
      questionsList,
      selectedQuestion,
      setSelectedQuestion: handleSelectQuestion,
      filteredQuestions,
      onGenerate: () => setIsGenerateModalOpen(true),
      onAutoLayout: handleAutoLayout,
      onLoadSolution: handleLoadSolution,
      onVerify: handleVerifyDiagram,
    });
  }, [
    questionsList,
    selectedQuestion,
    filteredQuestions,
    handleSelectQuestion,
    handleAutoLayout,
    handleLoadSolution,
    handleVerifyDiagram,
    setPracticeConfig,
  ]);

  const deleteSelectedEdge = () => {
    if (!selectedEdge) return;
    setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
  };

  return (
    <div id="practice-arena-container" className="flex-1 flex flex-col h-full overflow-hidden bg-[#F5F5F7] dark:bg-[#000000]">
      <div className="flex-1 flex overflow-hidden h-full relative">
        <div
          className={`${
            isLeftPanelOpen ? 'w-80 sm:w-96' : 'w-0'
          } transition-all duration-300 ease-in-out border-r border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#161618] flex flex-col h-full overflow-hidden shrink-0 z-20 relative`}
        >
          {isLeftPanelOpen && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Category Filter Pills & Navigator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  <span>Categories</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold lowercase">
                    {filteredQuestions.length} {filteredQuestions.length === 1 ? 'question' : 'questions'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-black/[0.04] dark:border-white/[0.04] text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300 text-[11px]">
                    <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Solved:</span>
                    <span className="text-zinc-900 dark:text-zinc-100 font-bold">
                      {Object.values(practiceProgressMap).filter((p) => p.status === 'completed').length} / {questionsList.length}
                    </span>
                  </div>
                  {user ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <Cloud className="w-3 h-3" />
                      Cloud Synced
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-400">
                      Local Cache
                    </span>
                  )}
                </div>

                <NavLink
                  to="/hashing?tab=questions"
                  className="flex items-center justify-between p-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold transition-colors"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span className="truncate">Quadratic Hashing Questions</span>
                  </div>
                  <ArrowRight className="w-3 h-3 opacity-70 shrink-0" />
                </NavLink>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {[
                    'All',
                    'Diagram Analysis',
                    'Table Reduction',
                    'Weak Entity',
                    'EER Specialization',
                    'Classical ER',
                  ].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoryChange(cat)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        categoryFilter === cat
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Question Selector & Prev/Next Bar */}
                <div className="p-1.5 rounded-xl bg-zinc-100/90 dark:bg-zinc-800/80 border border-black/[0.06] dark:border-white/[0.06] flex items-center gap-1.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={handlePrevQuestion}
                    disabled={filteredQuestions.length <= 1}
                    className="p-1.5 rounded-lg bg-white dark:bg-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs shrink-0"
                    title="Previous question in category"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <select
                    value={selectedQuestion?.id || ''}
                    onChange={(e) => {
                      const found = questionsList.find((q) => q.id === e.target.value);
                      if (found) handleSelectQuestion(found);
                    }}
                    className="flex-1 min-w-0 py-1 px-2 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-black/[0.08] dark:border-white/[0.08] outline-none focus:border-blue-500 truncate cursor-pointer shadow-2xs"
                  >
                    {filteredQuestions.map((q, idx) => {
                      const prog = practiceProgressMap[q.id];
                      const isCompleted = prog?.status === 'completed';
                      return (
                        <option key={q.id} value={q.id}>
                          {isCompleted ? '✓ ' : ''}Q{idx + 1}: [{q.exam} {q.year}] {q.title}
                          {isCompleted && prog?.score != null ? ` (${prog.score}%)` : ''}
                        </option>
                      );
                    })}
                  </select>

                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    disabled={filteredQuestions.length <= 1}
                    className="p-1.5 rounded-lg bg-white dark:bg-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs shrink-0"
                    title="Next question in category"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Question Header Card */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {selectedQuestion.exam} {selectedQuestion.year}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {practiceProgressMap[selectedQuestion.id]?.status === 'completed' && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Solved {practiceProgressMap[selectedQuestion.id]?.score != null ? `(${practiceProgressMap[selectedQuestion.id].score}%)` : ''}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                      {selectedQuestion.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        selectedQuestion.difficulty === 'Easy'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : selectedQuestion.difficulty === 'Medium'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {selectedQuestion.difficulty}
                    </span>
                  </div>
                </div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                  {selectedQuestion.title}
                </h2>
              </div>

              {/* Problem Statement */}
              <div className="space-y-1.5">
                <h3 className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  Problem Statement
                </h3>
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-black/[0.06] dark:border-white/[0.06] text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                  {selectedQuestion.statement}
                </div>
              </div>

              {/* Sub-Questions (Comprehension & Analysis Mode) */}
              {selectedQuestion.subQuestions && selectedQuestion.subQuestions.length > 0 && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ListChecks className="w-4 h-4 text-blue-500" />
                      Analysis & Comprehension ({selectedQuestion.subQuestions.length} Questions)
                    </h3>
                  </div>

                  {isSubSubmitted && (
                    <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          Evaluation Results
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-200/60 dark:bg-blue-900/60 text-[11px]">
                          {
                            Object.values(subFeedback).filter((f) => f.isCorrect).length
                          }{' '}
                          /{' '}
                          {selectedQuestion.subQuestions.filter((sq) => sq.type !== 'text').length}{' '}
                          Objective Correct
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                        Review the theoretical derivations, relational formulas, and solution rubrics below.
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {selectedQuestion.subQuestions.map((sq, idx) => {
                      const userVal = userSubAnswers[sq.id] ?? '';
                      const feedback = subFeedback[sq.id];

                      return (
                        <div
                          key={sq.id}
                          id={`sub-q-${sq.id}`}
                          className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-black/[0.08] dark:border-white/[0.08] space-y-2.5 transition-all shadow-2xs"
                        >
                          {/* Question header */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span>Sub-Question {idx + 1}</span>
                            </span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                sq.type === 'mcq'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                  : sq.type === 'numerical'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}
                            >
                              {sq.type === 'mcq'
                                ? 'MCQ (Single Choice)'
                                : sq.type === 'numerical'
                                ? 'Numerical (NAT)'
                                : 'Subjective / Theory'}
                            </span>
                          </div>

                          {/* Prompt */}
                          <div className="text-xs text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                            {sq.prompt}
                          </div>

                          {/* Inputs based on type */}
                          {sq.type === 'mcq' && sq.options && (
                            <div className="space-y-1.5 pt-1">
                              {sq.options.map((opt, optIdx) => {
                                const isSelected = userVal === opt;
                                const isCorrectOpt = isSubSubmitted && opt === sq.correctAnswer;
                                const isWrongSelection =
                                  isSubSubmitted && isSelected && opt !== sq.correctAnswer;

                                let optStyle =
                                  'bg-white dark:bg-zinc-800/80 border-black/[0.08] dark:border-white/[0.08] text-zinc-800 dark:text-zinc-200 hover:border-blue-400 dark:hover:border-blue-600';
                                if (isSelected) {
                                  optStyle =
                                    'bg-blue-50/90 text-blue-950 border-blue-500 dark:bg-blue-950/60 dark:text-blue-100 dark:border-blue-500 font-semibold shadow-2xs';
                                }
                                if (isCorrectOpt) {
                                  optStyle =
                                    'bg-emerald-50 text-emerald-900 border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-500 font-semibold';
                                } else if (isWrongSelection) {
                                  optStyle =
                                    'bg-rose-50 text-rose-900 border-rose-500 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-500';
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    onClick={() => handleSubAnswerChange(sq.id, opt)}
                                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${optStyle}`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div
                                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[10px] ${
                                          isSelected
                                            ? 'border-blue-600 bg-blue-600 text-white'
                                            : 'border-zinc-400 dark:border-zinc-600'
                                        } ${isCorrectOpt ? '!border-emerald-600 !bg-emerald-600 text-white' : ''} ${
                                          isWrongSelection ? '!border-rose-600 !bg-rose-600 text-white' : ''
                                        }`}
                                      >
                                        {isCorrectOpt ? (
                                          <Check className="w-2.5 h-2.5" />
                                        ) : isWrongSelection ? (
                                          <X className="w-2.5 h-2.5" />
                                        ) : isSelected ? (
                                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                        ) : null}
                                      </div>
                                      <span className="truncate">{opt}</span>
                                    </div>
                                    {isCorrectOpt && (
                                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                                        Correct
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {sq.type === 'numerical' && (
                            <div className="space-y-1.5 pt-1">
                              <AutoExpandingTextarea
                                id={`input-sub-${sq.id}`}
                                value={userVal}
                                onChange={(v) => handleSubAnswerChange(sq.id, v)}
                                placeholder="Enter integer or numerical answer (e.g., 3)..."
                                minHeight={52}
                              />
                            </div>
                          )}

                          {sq.type === 'text' && (
                            <div className="space-y-1.5 pt-1">
                              <AutoExpandingTextarea
                                id={`input-sub-${sq.id}`}
                                value={userVal}
                                onChange={(v) => handleSubAnswerChange(sq.id, v)}
                                placeholder="Type your relational analysis, primary keys, and table schemas here..."
                                minHeight={80}
                              />
                            </div>
                          )}

                          {/* Evaluation feedback for this sub-question */}
                          {isSubSubmitted && feedback && (
                            <div
                              className={`p-3 rounded-xl text-xs space-y-1.5 ${
                                sq.type === 'text'
                                  ? 'bg-zinc-100 dark:bg-zinc-800/80 border border-black/[0.06] dark:border-white/[0.06]'
                                  : feedback.isCorrect
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
                                  : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold text-[11px]">
                                <span className="flex items-center gap-1.5">
                                  {sq.type === 'text' ? (
                                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                                  ) : feedback.isCorrect ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                  )}
                                  <span>
                                    {sq.type === 'text'
                                      ? 'Reference Relational Solution'
                                      : feedback.isCorrect
                                      ? 'Correct Answer'
                                      : 'Incorrect Answer'}
                                  </span>
                                </span>
                                {sq.type !== 'text' && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/80 dark:bg-zinc-900/80">
                                    Expected: {sq.correctAnswer}
                                  </span>
                                )}
                              </div>

                              {sq.type === 'text' && (
                                <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 font-mono text-[11px] text-zinc-800 dark:text-zinc-200 border border-black/[0.04] dark:border-white/[0.04]">
                                  {sq.correctAnswer}
                                </div>
                              )}

                              {feedback.explanation && (
                                <div className="text-[11px] leading-relaxed text-zinc-700 dark:text-zinc-300 pt-0.5">
                                  <span className="font-bold">Derivation: </span>
                                  {feedback.explanation}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Submission and reset actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleCheckSubQuestions}
                      className="flex-1 p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs cursor-pointer transition-all active:scale-98"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>{isSubSubmitted ? 'Re-evaluate Answers' : 'Check Answers'}</span>
                    </button>
                    {isSubSubmitted && (
                      <button
                        type="button"
                        onClick={handleResetSubQuestions}
                        title="Clear answers"
                        className="p-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 text-xs font-bold flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Target Table Count (Only for standard questions with expectedTablesCount) */}
              {selectedQuestion.expectedTablesCount && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsTargetTablesOpen((prev) => !prev)}
                    className="w-full p-3 flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Table className="w-3.5 h-3.5 text-amber-600" />
                      <span>Target Table Count (1NF):</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 font-extrabold">
                        {selectedQuestion.expectedTablesCount} Tables
                      </span>
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-amber-600 transition-transform ${
                        isTargetTablesOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isTargetTablesOpen && (
                    <div className="px-3 pb-3 text-[11px] text-amber-800 dark:text-amber-400/90 leading-relaxed border-t border-amber-500/10 pt-2">
                      {selectedQuestion.expectedTablesExplanation}
                    </div>
                  )}
                </div>
              )}

              {selectedQuestion.constraintsSummary && (
                <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-zinc-50 dark:bg-zinc-900/30 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsConstraintsOpen((prev) => !prev)}
                    className="w-full p-3 flex items-center justify-between text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-500" />
                      Required Constraints ({selectedQuestion.constraintsSummary.length})
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${
                        isConstraintsOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isConstraintsOpen && (
                    <div className="p-3 pt-0 space-y-1">
                      {selectedQuestion.constraintsSummary.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 p-2 rounded-lg bg-white dark:bg-zinc-800/60 border border-black/[0.04] dark:border-white/[0.04] text-[11px] text-zinc-700 dark:text-zinc-300"
                        >
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedQuestion.hints && selectedQuestion.hints.length > 0 && (
                <div className="space-y-1.5">
                  <h3 className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    Progressive Hints
                  </h3>
                  <div className="space-y-1">
                    {selectedQuestion.hints.map((hint, idx) => {
                      const isOpen = Boolean(openHints[idx]);
                      return (
                        <div
                          key={idx}
                          className="rounded-xl border border-black/[0.06] dark:border-white/[0.06] overflow-hidden bg-zinc-50 dark:bg-zinc-900/30"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setOpenHints((prev) => ({ ...prev, [idx]: !prev[idx] }))
                            }
                            className="w-full p-2.5 flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <span>Hint #{idx + 1}</span>
                              {isOpen && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                                  Unlocked
                                </span>
                              )}
                            </span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          {isOpen && (
                            <div className="p-2.5 pt-0 text-xs text-zinc-600 dark:text-zinc-400 border-t border-black/[0.04] dark:border-white/[0.04]">
                              {hint}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsGenerateModalOpen(true)}
                className="w-full p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Generate Custom Exam Question</span>
              </button>
            </div>

            <div className="p-3.5 border-t border-black/[0.08] dark:border-white/[0.08] bg-zinc-50/90 dark:bg-[#1C1C1E]/90 backdrop-blur-md shrink-0">
              <button
                id="practice-verify-diagram-bottom-btn"
                type="button"
                onClick={handleVerifyDiagram}
                className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-2xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Verify Diagram / Analyse</span>
              </button>
            </div>
          </>
        )}
      </div>

        <button
          type="button"
          onClick={() => setIsLeftPanelOpen((prev) => !prev)}
          className="w-4 hover:w-5 bg-zinc-200/80 dark:bg-zinc-800/80 hover:bg-amber-500 text-zinc-500 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 z-30 border-r border-black/[0.06] dark:border-white/[0.06]"
          title={isLeftPanelOpen ? 'Collapse problem panel' : 'Expand problem panel'}
        >
          {isLeftPanelOpen ? (
            <PanelLeftClose className="w-3 h-3" />
          ) : (
            <PanelLeftOpen className="w-3 h-3" />
          )}
        </button>

        <div className="flex-1 flex flex-col h-full relative overflow-hidden">
          {isPaletteOpen ? (
            <div className="absolute top-3 left-3 bottom-3 z-20 w-60 sm:w-64 flex flex-col bg-white/95 dark:bg-[#161618]/95 backdrop-blur-md rounded-2xl border border-black/[0.08] dark:border-white/[0.08] shadow-lg overflow-hidden transition-all duration-200">
              <div className="p-3 border-b border-black/[0.06] dark:border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Boxes className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Toolbox</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold">
                      {filteredToolboxElements.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPaletteOpen(false)}
                    className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                    title="Collapse node palette"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                    {(selectedNotation || 'chen').toLowerCase() === 'chen'
                      ? 'Chen'
                      : (selectedNotation || '').toLowerCase().includes('crow')
                      ? "Crow's Foot"
                      : (selectedNotation || '').toLowerCase() === 'uml'
                      ? 'UML'
                      : 'Min-Max'}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      diagramMode === 'eer'
                        ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20'
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                    }`}
                  >
                    {diagramMode === 'eer' ? 'Mode: EER (Extended)' : 'Mode: ER'}
                  </span>
                </div>
              </div>

              <div className="p-2 border-b border-black/[0.04] dark:border-white/[0.04] space-y-2">
                <div className="relative flex items-center">
                  <Search className="w-3 h-3 absolute left-2.5 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search elements..."
                    value={toolboxSearch}
                    onChange={(e) => setToolboxSearch(e.target.value)}
                    className="w-full pl-7 pr-7 py-1 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-black/[0.06] dark:border-white/[0.06] text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 placeholder:text-zinc-400"
                  />
                  {toolboxSearch && (
                    <button
                      type="button"
                      onClick={() => setToolboxSearch('')}
                      className="absolute right-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'entity', label: 'Entity' },
                    { id: 'attribute', label: 'Attr' },
                    { id: 'relationship', label: 'Rel' },
                    { id: 'eer', label: 'EER' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setToolboxCategory(cat.id)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        toolboxCategory === cat.id
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {filteredToolboxElements.map((el) => {
                  let themeClasses = 'bg-blue-50/70 text-blue-800 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60';
                  if (el.theme === 'indigo') themeClasses = 'bg-indigo-50/70 text-indigo-800 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/60';
                  if (el.theme === 'cyan') themeClasses = 'bg-cyan-50/70 text-cyan-800 border-cyan-200 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-900/60';
                  if (el.theme === 'emerald') themeClasses = 'bg-emerald-50/70 text-emerald-800 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60';
                  if (el.theme === 'teal') themeClasses = 'bg-teal-50/70 text-teal-800 border-teal-200 hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900/60';
                  if (el.theme === 'amber') themeClasses = 'bg-amber-50/70 text-amber-800 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60';
                  if (el.theme === 'purple') themeClasses = 'bg-purple-50/70 text-purple-800 border-purple-200 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/60';

                  return (
                    <div
                      key={el.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, el.type, el.defaultLabel, el.customData)}
                      onClick={() => handleAddNode(el.type, el.defaultLabel, el.customData)}
                      title={`${el.name} - ${el.desc} (Drag to canvas or click to add)`}
                      className={`p-2 rounded-xl border transition-all cursor-grab active:cursor-grabbing shadow-2xs hover:shadow-xs flex items-center justify-between gap-2 group ${themeClasses}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="shrink-0">
                          {el.shapeType === 'rect' && (
                            <div className="w-4 h-3 rounded-2xs border border-blue-600 bg-blue-200/60 dark:bg-blue-800/60" />
                          )}
                          {el.shapeType === 'double-rect' && (
                            <div className="relative w-4.5 h-3 rounded-2xs border border-indigo-600 p-[1px]">
                              <div className="w-full h-full border border-indigo-500 rounded-3xs" />
                            </div>
                          )}
                          {el.shapeType === 'sup-rect' && (
                            <div className="w-4.5 h-3 rounded-2xs border border-blue-600 bg-blue-100 dark:bg-blue-900 text-[6px] font-bold text-blue-700 dark:text-blue-300 flex items-center justify-center">
                              SUP
                            </div>
                          )}
                          {el.shapeType === 'sub-rect' && (
                            <div className="w-4.5 h-3 rounded-2xs border border-cyan-600 bg-cyan-100 dark:bg-cyan-900 text-[6px] font-bold text-cyan-700 dark:text-cyan-300 flex items-center justify-center">
                              SUB
                            </div>
                          )}
                          {el.shapeType === 'pk-oval' && (
                            <div className="w-4 h-2.5 rounded-full border border-emerald-600 flex items-center justify-center bg-white dark:bg-emerald-950">
                              <Key className="w-2 h-2 text-amber-500" />
                            </div>
                          )}
                          {el.shapeType === 'oval' && (
                            <div className="w-4 h-2.5 rounded-full border border-emerald-600 bg-emerald-200/50 dark:bg-emerald-900/50" />
                          )}
                          {el.shapeType === 'double-oval' && (
                            <div className="relative w-4.5 h-3 rounded-full border border-emerald-600 p-[1px]">
                              <div className="w-full h-full rounded-full border border-emerald-500" />
                            </div>
                          )}
                          {el.shapeType === 'dashed-oval' && (
                            <div className="w-4 h-2.5 rounded-full border border-dashed border-emerald-600" />
                          )}
                          {el.shapeType === 'partial-oval' && (
                            <div className="w-4 h-2.5 rounded-full border border-teal-600 flex items-center justify-center bg-white dark:bg-teal-950 text-[6px] font-bold underline decoration-dashed text-teal-700 dark:text-teal-300">
                              PK
                            </div>
                          )}
                          {el.shapeType === 'diamond' && (
                            <div className="w-3 h-3 rotate-45 border border-amber-600 bg-amber-200/50 dark:bg-amber-900/50" />
                          )}
                          {el.shapeType === 'double-diamond' && (
                            <div className="relative w-3.5 h-3.5 rotate-45 border border-amber-600 p-[1px]">
                              <div className="w-full h-full border border-amber-500" />
                            </div>
                          )}
                          {el.shapeType === 'circle-d' && (
                            <div className="w-4 h-4 rounded-full border border-purple-600 bg-white dark:bg-zinc-800 flex items-center justify-center font-serif text-[8px] font-bold text-purple-700 dark:text-purple-300">
                              d
                            </div>
                          )}
                          {el.shapeType === 'circle-o' && (
                            <div className="w-4 h-4 rounded-full border border-purple-600 bg-white dark:bg-zinc-800 flex items-center justify-center font-serif text-[8px] font-bold text-purple-700 dark:text-purple-300">
                              o
                            </div>
                          )}
                          {el.shapeType === 'circle-u' && (
                            <div className="w-4 h-4 rounded-full border border-purple-600 bg-white dark:bg-zinc-800 flex items-center justify-center font-serif text-[8px] font-bold text-purple-700 dark:text-purple-300">
                              U
                            </div>
                          )}
                          {el.shapeType === 'double-circle-d' && (
                            <div className="relative w-4.5 h-4.5 rounded-full border border-purple-700 p-[1px]">
                              <div className="w-full h-full rounded-full border border-purple-500 flex items-center justify-center font-serif text-[7px] font-bold text-purple-700 dark:text-purple-300">
                                d
                              </div>
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-semibold truncate">{el.name}</span>
                      </div>
                      <Plus className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                  );
                })}
                {filteredToolboxElements.length === 0 && (
                  <div className="p-3 text-center text-xs text-zinc-400">No elements found</div>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsPaletteOpen(true)}
              className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/95 dark:bg-[#161618]/95 border border-black/[0.08] dark:border-white/[0.08] shadow-md text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer backdrop-blur-md transition-transform active:scale-95"
            >
              <Boxes className="w-4 h-4 text-blue-600" />
              <span>+ Add Node Palette</span>
            </button>
          )}

          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-white/95 dark:bg-[#161618]/95 backdrop-blur-md p-1 rounded-xl border border-black/[0.08] dark:border-white/[0.08] shadow-md">
            <button
              type="button"
              onClick={handleSaveDiagramProgress}
              disabled={isSavingProgress}
              title={user ? 'Save diagram & question progress to Firebase Realtime Database' : 'Save diagram & progress locally'}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer transition-colors"
            >
              {saveStatusText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">{saveStatusText}</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isSavingProgress ? 'Saving...' : 'Save Progress'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleClearCanvas}
              title="Clear all elements from canvas"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Canvas</span>
            </button>
          </div>

          {(selectedQuestion.type === 'diagram_analysis' ||
            Boolean(selectedQuestion.subQuestions && selectedQuestion.subQuestions.length > 0)) && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 bg-white/95 dark:bg-[#161618]/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-blue-500/30 dark:border-blue-500/40 shadow-lg animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
              <div className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <span className="font-bold text-blue-600 dark:text-blue-400">Analysis Mode:</span>
                <span className="hidden sm:inline text-zinc-500 dark:text-zinc-400">
                  Pre-built schema loaded on canvas
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (selectedQuestion.initialNodes && selectedQuestion.initialEdges) {
                    setNodes(selectedQuestion.initialNodes);
                    setEdges(selectedQuestion.initialEdges);
                  } else if (selectedQuestion.groundTruth) {
                    const { nodes: solNodes, edges: solEdges } =
                      generateSolutionGraph(selectedQuestion);
                    setNodes(solNodes);
                    setEdges(solEdges);
                  }
                  setTimeout(() => {
                    if (reactFlowInstance) reactFlowInstance.fitView({ padding: 0.2 });
                  }, 50);
                }}
                className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Re-center Diagram</span>
              </button>
            </div>
          )}

          {selectedEdge && (
            <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md p-2 rounded-2xl border border-blue-400 dark:border-blue-700 shadow-xl animate-in fade-in slide-in-from-top-2">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 px-1 flex items-center gap-1">
                <Hash className="w-3 h-3" /> Cardinality:
              </span>
              {['1', 'N', 'M', 'P', '(0,1)', '(1,1)', '(0,N)', '(1,N)', 'ISA'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => updateSelectedEdgeCard(c)}
                  className={`px-1.5 py-0.5 rounded-md text-xs font-semibold border cursor-pointer transition-colors ${
                    selectedEdge.label === c
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-black/[0.08] dark:border-white/[0.08] hover:bg-zinc-200'
                  }`}
                >
                  {c}
                </button>
              ))}
              <button
                type="button"
                onClick={toggleSelectedEdgeTotal}
                className="px-2 py-0.5 rounded-md text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-200 border border-purple-300 dark:border-purple-800 cursor-pointer hover:bg-purple-200"
              >
                {selectedEdge.data?.isTotal ? 'Total: ON' : 'Total: OFF'}
              </button>
              <button
                type="button"
                onClick={deleteSelectedEdge}
                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md cursor-pointer ml-1"
                title="Delete connection line"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div
            ref={reactFlowWrapper}
            onDragOver={onDragOver}
            onDrop={onDrop}
            className="flex-1 w-full h-full relative"
          >
            <ReactFlow
              nodes={displayNodes}
              edges={displayEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              nodeTypes={NODE_TYPES}
              edgeTypes={EDGE_TYPES}
              connectionMode={ConnectionMode.Loose}
              defaultEdgeOptions={{ type: 'cardinality' }}
              fitView
              className="bg-[#FBFBFD] dark:bg-[#09090B]"
            >
              <Background color="#94a3b8" gap={18} size={1} />
              <Controls position="bottom-right" className="bg-white dark:bg-zinc-800 border-black/[0.08]" />
            </ReactFlow>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. AI & EXAM QUESTION GENERATOR MODAL                                    */}
      {/* ========================================================================= */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-[#161618] rounded-3xl border border-black/[0.08] dark:border-white/[0.08] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    Question Generator & Exam Architect
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Generate authentic GATE, ISRO, and UGC NET practice problems with complete ground truths
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGenerateModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Quick Scenario Preset Chips */}
              <div>
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">
                  Quick Select Scenario Templates:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESET_SCENARIOS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleLoadPresetScenario(preset)}
                      className="p-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-zinc-50/60 dark:bg-zinc-900/40 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-800 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {preset.title}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-semibold">
                          {preset.exam}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-normal">
                        {preset.prompt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Controls: Target Exam, Focus Category, Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Target Exam */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                    Target Examination:
                  </label>
                  <select
                    value={genExam}
                    onChange={(e) => setGenExam(e.target.value)}
                    className="w-full text-xs font-semibold p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08] text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-500"
                  >
                    <option value="GATE CS">GATE CS / IT</option>
                    <option value="ISRO CS">ISRO Scientist/Engineer</option>
                    <option value="UGC NET CS">UGC NET Computer Science</option>
                    <option value="University DBMS">University Semester Exam</option>
                    <option value="Enterprise Architecture">Enterprise Practice</option>
                  </select>
                </div>

                {/* Focus Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                    Core Topic Focus:
                  </label>
                  <select
                    value={genCategory}
                    onChange={(e) => setGenCategory(e.target.value)}
                    className="w-full text-xs font-semibold p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08] text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-500"
                  >
                    <option value="Table Reduction">Table Reduction & Minimization</option>
                    <option value="Weak Entity">Weak Entity & Identifying Rels</option>
                    <option value="EER Specialization">EER Specialization / Generalization</option>
                    <option value="Classical ER">Classical Binary (1:1, 1:N, M:N)</option>
                    <option value="Multivalued Decomposition">Multivalued & Derived 1NF</option>
                    <option value="Recursive Hierarchy">Unary Recursive Tree</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                    Difficulty Level:
                  </label>
                  <select
                    value={genDifficulty}
                    onChange={(e) => setGenDifficulty(e.target.value)}
                    className="w-full text-xs font-semibold p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08] text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-500"
                  >
                    <option value="Easy">Easy (Fundamental ER)</option>
                    <option value="Medium">Medium (Standard GATE)</option>
                    <option value="Hard">Hard (Competitive Exam Level)</option>
                  </select>
                </div>
              </div>

              {/* Custom Prompt / Scenario Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                  <span>Custom Scenario or Specific Domain Constraints (Optional):</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Leave blank for smart exam generator</span>
                </label>
                <textarea
                  rows={3}
                  value={genCustomPrompt}
                  onChange={(e) => setGenCustomPrompt(e.target.value)}
                  placeholder="e.g. Model an electric vehicle charging network with charging stations, battery swap logs, and member tier specialization..."
                  className="w-full text-xs p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08] text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-500 placeholder:text-zinc-400 resize-none font-sans"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.06] bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const randomPreset =
                    PRESET_SCENARIOS[Math.floor(Math.random() * PRESET_SCENARIOS.length)];
                  handleLoadPresetScenario(randomPreset);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Random Scenario</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleGenerateNewQuestion}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Problem...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate & Start Solving</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ENHANCED EVALUATION MODAL WITH DEDICATED EXPLANATION TAB             */}
      {/* ========================================================================= */}
      {isEvaluationModalOpen && evaluationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-white dark:bg-[#161618] rounded-3xl border border-black/[0.08] dark:border-white/[0.08] shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-xs ${
                    evaluationResult.passed
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                  }`}
                >
                  {evaluationResult.score}%
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    {evaluationResult.passed
                      ? 'Model Validation Succeeded!'
                      : 'Diagram Needs Refinements'}
                    {evaluationResult.passed && <Award className="w-4 h-4 text-amber-500" />}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Evaluation based on {selectedQuestion.exam} {selectedQuestion.year} standard criteria
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEvaluationModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex items-center gap-2 px-5 py-2 border-b border-black/[0.06] dark:border-white/[0.06] bg-zinc-50/50 dark:bg-zinc-900/30 overflow-x-auto no-scrollbar shrink-0">
              {/* Tab 1: Explanation / What to Change */}
              <button
                type="button"
                onClick={() => setEvaluationActiveTab('explanation')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  evaluationActiveTab === 'explanation'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>What's Wrong & What to Change</span>
                {evaluationResult.mistakes && evaluationResult.mistakes.length > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      evaluationActiveTab === 'explanation'
                        ? 'bg-white/20 text-white'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {evaluationResult.mistakes.length}
                  </span>
                )}
              </button>

              {/* Tab 2: Overview & Verification Feed */}
              <button
                type="button"
                onClick={() => setEvaluationActiveTab('verification')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  evaluationActiveTab === 'verification'
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Score & Verification Report</span>
              </button>

              {/* Tab 3: Relational Theory */}
              <button
                type="button"
                onClick={() => setEvaluationActiveTab('theory')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  evaluationActiveTab === 'theory'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Relational Theory & Proof</span>
              </button>
            </div>

            {/* Modal Body per Tab */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* ========================================================================= */}
              {/* TAB 1: WHAT'S WRONG & WHAT TO CHANGE (EXPLANATION TAB)                    */}
              {/* ========================================================================= */}
              {evaluationActiveTab === 'explanation' && (
                <div className="space-y-4">
                  {/* Status Banner */}
                  {evaluationResult.mistakes && evaluationResult.mistakes.length > 0 ? (
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                          {evaluationResult.mistakes.length} Issue
                          {evaluationResult.mistakes.length > 1 ? 's' : ''} Identified in Your Diagram
                        </h4>
                        <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-normal mt-0.5">
                          Review each mistake below with its theoretical explanation and step-by-step
                          action instructions to bring your diagram to full compliance.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                          Flawless Schema Design!
                        </h4>
                        <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-normal mt-0.5">
                          All entity definitions, primary keys, cardinalities, weak entity notations,
                          and relational table reduction requirements match the exam standard.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* List of Detailed Mistakes with What's Wrong and What to Change */}
                  {evaluationResult.mistakes && evaluationResult.mistakes.length > 0 && (
                    <div className="space-y-3">
                      {evaluationResult.mistakes.map((mistake, idx) => (
                        <div
                          key={mistake.id || idx}
                          className="p-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3 shadow-2xs"
                        >
                          {/* Mistake Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                  mistake.severity === 'critical'
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                                }`}
                              >
                                {mistake.severity === 'critical' ? 'Critical Defect' : 'Warning'}
                              </span>

                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                {mistake.category}
                              </span>

                              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                {mistake.title}
                              </span>
                            </div>

                            {mistake.targetElement && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900 shrink-0">
                                Target: {mistake.targetElement}
                              </span>
                            )}
                          </div>

                          {/* Section 1: What is Wrong */}
                          <div className="p-3 rounded-xl bg-white dark:bg-[#1A1A1C] border border-rose-100 dark:border-rose-950/60 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>What is Wrong:</span>
                            </div>
                            <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                              {mistake.whatsWrong}
                            </p>
                          </div>

                          {/* Section 2: Why it is Wrong (Theory) */}
                          <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800 dark:text-purple-300">
                              <Lightbulb className="w-3.5 h-3.5" />
                              <span>Why It's Wrong (Relational & ER Theory):</span>
                            </div>
                            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                              {mistake.whyWrong}
                            </p>
                          </div>

                          {/* Section 3: What to Change (Actionable Step-by-Step Fix) */}
                          <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>What to Change (Fix Checklist):</span>
                            </div>
                            <div className="text-xs text-zinc-800 dark:text-zinc-200 space-y-1">
                              {mistake.whatToChange.split('\n').map((step, sIdx) => (
                                <div key={sIdx} className="flex items-start gap-2">
                                  <ArrowRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                  <span className="font-medium">{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: OVERVIEW & VERIFICATION FEED                                      */}
              {/* ========================================================================= */}
              {evaluationActiveTab === 'verification' && (
                <div className="space-y-4">
                  {/* Relational Table Reduction Goal vs Drawn */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <Table className="w-4 h-4 text-blue-500" />
                        Relational Table Reduction Calculation:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                          Drawn: <strong>{evaluationResult.userTableCount}</strong>
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                          Expected: {evaluationResult.expectedTableCount}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {selectedQuestion.expectedTablesExplanation}
                    </p>
                  </div>

                  {/* High-level Metric Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                        Matched Entities
                      </span>
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {evaluationResult.matchedEntities.length}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
                      <span className="font-bold text-blue-800 dark:text-blue-300 block">
                        Matched Attributes
                      </span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {evaluationResult.matchedAttributes.length}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                      <span className="font-bold text-amber-800 dark:text-amber-300 block">
                        Matched Relationships
                      </span>
                      <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                        {evaluationResult.matchedRelationships.length}
                      </span>
                    </div>
                  </div>

                  {/* Detailed Item Verification Feed */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Itemized Validation Results
                    </h4>
                    <div className="space-y-1.5 max-h-60 overflow-y-auto">
                      {evaluationResult.feedbackItems.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                            item.type === 'success'
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                              : item.type === 'warning'
                              ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40 text-amber-900 dark:text-amber-200'
                              : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/40 text-rose-900 dark:text-rose-200'
                          }`}
                        >
                          {item.type === 'success' && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          )}
                          {item.type === 'warning' && (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          )}
                          {item.type === 'error' && (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <span className="font-bold block">{item.title}</span>
                            <span className="opacity-90">{item.message}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 3: RELATIONAL THEORY & PROOF                                         */}
              {/* ========================================================================= */}
              {evaluationActiveTab === 'theory' && (
                <div className="space-y-4 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                  <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 space-y-2">
                    <span className="font-bold text-purple-900 dark:text-purple-200 block text-sm">
                      Official Examination Analysis & Proof
                    </span>
                    <p className="leading-relaxed font-sans">{selectedQuestion.explanation}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-black/[0.06] dark:border-white/[0.06] space-y-3">
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-indigo-500" />
                      Core Rules for ER to Relational Schema Reduction:
                    </h4>

                    <div className="space-y-2 text-zinc-700 dark:text-zinc-300">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A1C] border border-black/[0.04]">
                        <strong className="text-zinc-900 dark:text-zinc-100 block">
                          1. 1:N Relationships (Total Participation):
                        </strong>
                        When entity A on the N-side has total participation in relationship R with entity B (1-side), relationship R can be merged into table A by adding PK(B) as a Foreign Key with NOT NULL constraint. A separate table is NOT required.
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A1C] border border-black/[0.04]">
                        <strong className="text-zinc-900 dark:text-zinc-100 block">
                          2. M:N Relationships:
                        </strong>
                        Many-to-Many relationships strictly require their own separate junction table containing (PK_A, PK_B, and any descriptive relationship attributes) to prevent data redundancy and NULL anomalies.
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A1C] border border-black/[0.04]">
                        <strong className="text-zinc-900 dark:text-zinc-100 block">
                          3. Weak Entities:
                        </strong>
                        Weak entities cannot stand alone without their identifying owner. The weak entity table has a composite primary key consisting of (Owner_PK, Partial_Discriminator).
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A1C] border border-black/[0.04]">
                        <strong className="text-zinc-900 dark:text-zinc-100 block">
                          4. Multivalued Attributes:
                        </strong>
                        Multivalued attributes violate First Normal Form (1NF) and must be decomposed into an independent table with schema (Entity_PK, AttributeValue).
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.06] bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-between">
              <button
                type="button"
                onClick={handleLoadSolution}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 hover:bg-purple-200 cursor-pointer flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Load Model Solution to Canvas</span>
              </button>
              <div className="flex items-center gap-2">
                {(evaluationResult.passed || evaluationResult.score >= 70) && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEvaluationModalOpen(false);
                      handleNextQuestion();
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsEvaluationModalOpen(false)}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
