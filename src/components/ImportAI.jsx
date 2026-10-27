import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X, AlertCircle, FileCode, Loader2, MessageSquare, Layers, Database } from 'lucide-react';
import { useDiagram } from '../context/DiagramContext.jsx';
import { getLayoutedElements } from '../utils/layoutEngine.js';
import { generateWithModelFallback, formatGeminiError } from '../utils/geminiClient.js';

const sampleErJson = JSON.stringify(
  {
    entities: [
      {
        name: 'Customer',
        attributes: [
          { name: 'CustomerID', isPrimary: true },
          { name: 'CustomerName' },
          { name: 'Email' },
          { name: 'Phone' },
        ],
      },
      {
        name: 'Order',
        attributes: [
          { name: 'OrderID', isPrimary: true },
          { name: 'OrderDate' },
          { name: 'TotalAmount' },
        ],
      },
      {
        name: 'Product',
        attributes: [
          { name: 'ProductID', isPrimary: true },
          { name: 'ProductName' },
          { name: 'Price' },
        ],
      },
    ],
    relationships: [
      {
        name: 'Places',
        description: 'Customer places one or more orders',
        source: 'Customer',
        target: 'Order',
        cardinality: '1:N',
      },
      {
        name: 'Contains',
        description: 'Orders contain multiple catalog products',
        source: 'Order',
        target: 'Product',
        cardinality: 'M:N',
      },
    ],
  },
  null,
  2
);

const sampleEerJson = JSON.stringify(
  {
    entities: [
      {
        name: 'Vehicle',
        isSuperclass: true,
        attributes: [
          { name: 'VehicleID', isPrimary: true },
          { name: 'Model' },
          { name: 'Price' },
        ],
      },
      {
        name: 'Car',
        isSubclass: true,
        attributes: [
          { name: 'MaxSpeed' },
          { name: 'NumDoors' },
        ],
      },
      {
        name: 'Truck',
        isSubclass: true,
        attributes: [
          { name: 'Tonnage' },
          { name: 'NumAxles' },
        ],
      },
    ],
    specializations: [
      {
        superclass: 'Vehicle',
        subclasses: ['Car', 'Truck'],
        specType: 'disjoint',
        isTotal: true,
      },
    ],
  },
  null,
  2
);

const sampleErPrompt =
  'E-commerce database system with Customer, Order, and Product entities. Each Customer can place multiple Orders (1:N). Each Order can contain multiple Products (M:N). Include primary keys and descriptive attributes.';

const sampleEerPrompt =
  'University EER hierarchy: Person is a superclass with PersonID (PK), Name, and Email. Student and Faculty are specialized subclasses inheriting from Person under a disjoint (d) total specialization constraint. Student has GPA, Faculty has Salary and Rank.';

function extractAndParseJson(input) {
  let text = input.trim();

  if (text.includes('```')) {
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch && codeBlockMatch[1]) {
      text = codeBlockMatch[1].trim();
    }
  }

  if (!text.startsWith('{') && !text.startsWith('[')) {
    const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      text = jsonMatch[0].trim();
    }
  }

  text = text.replace(/\/\/.*$/gm, '');
  text = text.replace(/\/\*[\s\S]*?\*\//g, '');
  text = text.replace(/,\s*([\]}])/g, '$1');

  return JSON.parse(text);
}

function extractEntities(parsed) {
  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (!parsed || typeof parsed !== 'object') {
    return [];
  }

  const possible =
    parsed.entities ||
    parsed.Entities ||
    parsed.tables ||
    parsed.Tables ||
    parsed.nodes ||
    parsed.Nodes ||
    parsed.schema?.entities ||
    parsed.schema?.tables;

  if (Array.isArray(possible)) return possible;

  if (possible && typeof possible === 'object') {
    return Object.entries(possible).map(([key, val]) => {
      if (typeof val === 'object' && val !== null) {
        return { name: val.name || val.label || key, ...val };
      }
      return { name: key };
    });
  }

  return [];
}

function extractRelationships(parsed) {
  if (!parsed || typeof parsed !== 'object') return [];

  const possible =
    parsed.relationships ||
    parsed.Relationships ||
    parsed.relations ||
    parsed.Relations ||
    parsed.links ||
    parsed.Links ||
    parsed.edges ||
    parsed.Edges ||
    parsed.schema?.relationships ||
    parsed.schema?.relations;

  if (Array.isArray(possible)) return possible;

  return [];
}

function extractSpecializations(parsed) {
  if (!parsed || typeof parsed !== 'object') return [];
  const possible =
    parsed.specializations ||
    parsed.Specializations ||
    parsed.hierarchies ||
    parsed.Hierarchies ||
    parsed.inheritances ||
    parsed.isa ||
    parsed.spec;

  if (Array.isArray(possible)) return possible;
  return [];
}

function normalizeAttributes(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((item, idx) => {
      if (typeof item === 'string') {
        return { name: item };
      }
      if (typeof item === 'object' && item !== null) {
        return {
          name:
            item.name ||
            item.label ||
            item.title ||
            item.column ||
            item.column_name ||
            item.field ||
            `attr_${idx + 1}`,
          isPrimary:
            item.isPrimary ||
            item.is_primary ||
            item.pk ||
            item.isPrimaryKey ||
            item.primaryKey ||
            false,
          isMultivalued: Boolean(item.isMultivalued || item.multivalued),
          isDerived: Boolean(item.isDerived || item.derived),
          ...item,
        };
      }
      return { name: String(item) };
    });
  }

  return [];
}

export default function ImportAI({ isOpen: isControlled, onClose: controlledClose }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [mode, setMode] = useState('prompt');
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setNodes, setEdges, diagramMode } = useDiagram();

  const isEer = diagramMode === 'eer';
  const samplePrompt = isEer ? sampleEerPrompt : sampleErPrompt;
  const sampleJson = isEer ? sampleEerJson : sampleErJson;

  const isModalOpen = isControlled !== undefined ? isControlled : internalOpen;

  const handleClose = () => {
    setError('');
    if (controlledClose) controlledClose();
    else setInternalOpen(false);
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, loading, controlledClose]);

  const handleOpen = () => {
    setError('');
    if (mode === 'prompt' && !textInput) {
      setTextInput(samplePrompt);
    } else if (mode === 'json' && !textInput) {
      setTextInput(sampleJson);
    }
    setInternalOpen(true);
  };

  const loadSamplePrompt = () => {
    setTextInput(samplePrompt);
    setError('');
  };

  const loadSampleJson = () => {
    setTextInput(sampleJson);
    setError('');
  };

  const handleGenerate = async () => {
    setError('');
    const rawContent = textInput.trim();

    if (!rawContent) {
      setError('Please provide a database description or JSON schema.');
      return;
    }

    setLoading(true);

    try {
      let parsedData = null;

      const looksLikeJson =
        rawContent.startsWith('{') ||
        rawContent.startsWith('[') ||
        rawContent.includes('```json') ||
        (rawContent.includes('"entities"') && rawContent.includes(':'));

      if (mode === 'json' || looksLikeJson) {
        try {
          parsedData = extractAndParseJson(rawContent);
        } catch (jsonErr) {
          if (mode === 'json' && !looksLikeJson) {
            throw new Error(`Invalid JSON: ${jsonErr.message}`);
          }
        }
      }

      if (!parsedData) {
        const systemInstruction = isEer
          ? `You are an expert EER (Enhanced Entity-Relationship) database architect.
When given a user description, return ONLY a valid JSON object representing the EER diagram structure.
Include entities, attributes (marking isPrimary, isMultivalued, isDerived), relationships, AND specializations (hierarchies).
The JSON object must strictly match this structure:
{
  "entities": [
    {
      "name": "Vehicle",
      "isSuperclass": true,
      "attributes": [
        { "name": "VehicleID", "isPrimary": true },
        { "name": "Model" }
      ]
    },
    {
      "name": "Car",
      "isSubclass": true,
      "attributes": [
        { "name": "NumDoors" }
      ]
    }
  ],
  "specializations": [
    {
      "superclass": "Vehicle",
      "subclasses": ["Car"],
      "specType": "disjoint",
      "isTotal": true
    }
  ],
  "relationships": []
}`
          : `You are an expert ER (Entity-Relationship) database architect.
When given a user description, return ONLY a valid JSON object representing the ER diagram structure.
Include entities, attributes (marking isPrimary), and relationships (with cardinality 1:1, 1:N, or M:N).
Do not include markdown backticks or conversational text.`;

        const response = await generateWithModelFallback({
          contents: rawContent,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        });

        const respText = response.text || '';
        const cleanJson = respText
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim();

        parsedData = JSON.parse(cleanJson);
      }

      const rawEntities = extractEntities(parsedData);
      const rawRelationships = extractRelationships(parsedData);
      const rawSpecializations = extractSpecializations(parsedData);

      if (rawEntities.length === 0 && rawRelationships.length === 0 && rawSpecializations.length === 0) {
        throw new Error(
          'Could not detect any entities or relationships in the response. Please check your prompt or schema.'
        );
      }

      const generatedNodes = [];
      const generatedEdges = [];
      const entityIdMap = new Map();

      rawEntities.forEach((ent, entIdx) => {
        const entityName = ent.name || `Entity_${entIdx + 1}`;
        const entityId = `entity-${entityName.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}-${entIdx + 1}`;

        entityIdMap.set(entityName.toLowerCase(), entityId);
        entityIdMap.set(entityName.toLowerCase().replace(/[\s_-]+/g, ''), entityId);

        const entityNode = {
          id: entityId,
          type: 'entity',
          position: { x: 0, y: 0 },
          data: {
            label: entityName,
            isSuperclass: Boolean(ent.isSuperclass),
            isSubclass: Boolean(ent.isSubclass),
            isWeak: Boolean(ent.isWeak),
          },
        };

        generatedNodes.push(entityNode);

        const attributes = normalizeAttributes(ent.attributes || ent.fields || ent.columns);
        attributes.forEach((attr, attrIdx) => {
          const attrId = `attr-${entityId}-${attrIdx + 1}`;
          generatedNodes.push({
            id: attrId,
            type: 'attribute',
            position: { x: 0, y: 0 },
            data: {
              label: attr.name,
              isPrimary: Boolean(attr.isPrimary),
              isMultivalued: Boolean(attr.isMultivalued),
              isDerived: Boolean(attr.isDerived),
            },
          });

          generatedEdges.push({
            id: `e-${attrId}-${entityId}`,
            source: attrId,
            target: entityId,
            type: 'smoothstep',
            style: { strokeWidth: 2, stroke: '#64748b' },
          });
        });
      });

      // Process Specializations
      rawSpecializations.forEach((spec, specIdx) => {
        const specId = `spec-${specIdx + 1}-${Math.random().toString(36).substring(2, 6)}`;
        const specType = spec.specType || spec.type || 'disjoint';
        const isTotal = Boolean(spec.isTotal || spec.total);
        const specLabel = specType === 'overlapping' ? 'o' : specType === 'union' ? 'U' : 'd';

        generatedNodes.push({
          id: specId,
          type: 'specialization',
          position: { x: 0, y: 0 },
          data: {
            label: specLabel,
            specType,
            isTotal,
          },
        });

        // Wire Superclass
        const superName = (spec.superclass || spec.parent || '').toLowerCase().trim();
        const superId = entityIdMap.get(superName) || entityIdMap.get(superName.replace(/[\s_-]+/g, ''));
        if (superId) {
          generatedEdges.push({
            id: `e-${superId}-${specId}`,
            source: superId,
            target: specId,
            type: 'smoothstep',
            label: isTotal ? 'Total ISA' : 'ISA',
            style: { strokeWidth: 3, stroke: '#9333ea' },
          });
        }

        // Wire Subclasses
        const subList = Array.isArray(spec.subclasses) ? spec.subclasses : [];
        subList.forEach((subName) => {
          const cleanSub = String(subName).toLowerCase().trim();
          const subId = entityIdMap.get(cleanSub) || entityIdMap.get(cleanSub.replace(/[\s_-]+/g, ''));
          if (subId) {
            generatedEdges.push({
              id: `e-${specId}-${subId}`,
              source: specId,
              target: subId,
              type: 'smoothstep',
              style: { strokeWidth: 2, stroke: '#9333ea' },
            });
          }
        });
      });

      // Process Relationships
      rawRelationships.forEach((rel, relIdx) => {
        const relName = rel.name || rel.label || `Rel_${relIdx + 1}`;
        const relId = `rel-${relIdx + 1}-${Math.random().toString(36).substring(2, 6)}`;

        generatedNodes.push({
          id: relId,
          type: 'relationship',
          position: { x: 0, y: 0 },
          data: {
            label: relName,
            isIdentifying: Boolean(rel.isIdentifying),
            description: rel.description || undefined,
          },
        });

        const sName = (rel.source || '').toLowerCase().trim();
        const tName = (rel.target || '').toLowerCase().trim();
        const sId = entityIdMap.get(sName) || entityIdMap.get(sName.replace(/[\s_-]+/g, ''));
        const tId = entityIdMap.get(tName) || entityIdMap.get(tName.replace(/[\s_-]+/g, ''));

        let cardSource = '1';
        let cardTarget = 'N';
        if (typeof rel.cardinality === 'string' && rel.cardinality.includes(':')) {
          const parts = rel.cardinality.split(':');
          cardSource = parts[0]?.trim() || '1';
          cardTarget = parts[1]?.trim() || 'N';
        }

        if (sId) {
          generatedEdges.push({
            id: `e-${sId}-${relId}`,
            source: sId,
            target: relId,
            type: 'smoothstep',
            label: cardSource,
            style: { strokeWidth: 2, stroke: '#64748b' },
          });
        }

        if (tId) {
          generatedEdges.push({
            id: `e-${relId}-${tId}`,
            source: relId,
            target: tId,
            type: 'smoothstep',
            label: cardTarget,
            style: { strokeWidth: 2, stroke: '#64748b' },
          });
        }
      });

      const layouted = getLayoutedElements(generatedNodes, generatedEdges);
      const layoutedNodes = layouted.nodes || layouted[0] || generatedNodes;
      const layoutedEdges = layouted.edges || layouted[1] || generatedEdges;

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('er-diagram-relayout'));
      }, 50);

      handleClose();
    } catch (err) {
      setError(formatGeminiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isControlled && (
        <button
          id="import-ai-trigger-btn"
          type="button"
          onClick={handleOpen}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white ${
            isEer ? 'bg-[#9333EA] hover:bg-[#7E22CE]' : 'bg-[#0071E3] hover:bg-[#0077ED]'
          } shadow-2xs cursor-pointer transition-all duration-200 active:scale-[0.98]`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          <span>Import AI ({isEer ? 'EER' : 'ER'})</span>
        </button>
      )}

      {isModalOpen &&
        createPortal(
          <div
            id="import-ai-modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget && !loading) handleClose();
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6 overflow-y-auto"
          >
            <div
              id="import-ai-modal-container"
              className="w-full max-w-2xl my-auto rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#1C1C1E] shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-2.5rem)]"
            >
              <div
                id="import-ai-modal-header"
                className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1C1C1E] shrink-0"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl ${
                      isEer ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200/60 dark:border-purple-900/40 text-purple-600' : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/60 dark:border-blue-900/40 text-blue-600'
                    } border flex items-center justify-center`}
                  >
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3
                      id="import-ai-modal-title"
                      className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2"
                    >
                      <span>Import & Generate Schema</span>
                      <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${isEer ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'}`}>
                        {isEer ? 'EER Mode' : 'ER Mode'}
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {isEer ? 'Enhanced ER with Superclasses, Subclasses & Constraints' : 'Standard Chen Relational Model'}
                    </p>
                  </div>
                </div>
                <button
                  id="close-import-ai-modal-btn"
                  type="button"
                  onClick={handleClose}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] bg-[#F5F5F7]/80 dark:bg-[#161618]/80 shrink-0">
                <div className="flex items-center p-0.5 bg-black/[0.05] dark:bg-white/[0.06] rounded-full border border-black/[0.04] dark:border-white/[0.04]">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('prompt');
                      setError('');
                      setTextInput(samplePrompt);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full transition-all duration-200 cursor-pointer ${
                      mode === 'prompt'
                        ? 'bg-white dark:bg-[#2C2C2E] text-zinc-900 dark:text-zinc-50 font-semibold shadow-2xs'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>AI Prompt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('json');
                      setError('');
                      setTextInput(sampleJson);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full transition-all duration-200 cursor-pointer ${
                      mode === 'json'
                        ? 'bg-white dark:bg-[#2C2C2E] text-zinc-900 dark:text-zinc-50 font-semibold shadow-2xs'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    <FileCode className="w-3 h-3" />
                    <span>JSON Schema</span>
                  </button>
                </div>

                <button
                  id="load-sample-btn"
                  type="button"
                  onClick={mode === 'prompt' ? loadSamplePrompt : loadSampleJson}
                  className="inline-flex items-center gap-1 text-xs text-[#0071E3] dark:text-[#0A84FF] hover:underline cursor-pointer font-medium"
                >
                  <FileCode className="w-3 h-3" />
                  {mode === 'prompt' ? 'Load Sample Prompt' : 'Load Sample JSON'}
                </button>
              </div>

              <div id="import-ai-modal-body" className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-3">
                <label
                  htmlFor="import-ai-textarea"
                  className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block"
                >
                  {mode === 'prompt'
                    ? isEer
                      ? 'Describe entities, superclasses, subclasses, and specialization constraints'
                      : 'Describe entities, fields, and relationships'
                    : `Paste ${isEer ? 'EER' : 'ER'} Diagram JSON format`}
                </label>

                <textarea
                  id="import-ai-textarea"
                  rows={8}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={mode === 'prompt' ? samplePrompt : sampleJson}
                  disabled={loading}
                  className="w-full min-h-[140px] max-h-[280px] p-3.5 font-mono text-xs text-zinc-900 dark:text-zinc-100 bg-[#F5F5F7] dark:bg-[#121214] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0071E3]/40 resize-y leading-relaxed disabled:opacity-60 transition-all custom-scrollbar"
                />

                {error && (
                  <div
                    id="import-ai-error-message"
                    className="flex items-center gap-2 p-3 text-xs text-red-700 dark:text-red-300 bg-red-50/80 dark:bg-red-950/40 border border-red-200/60 dark:border-red-900/40 rounded-2xl leading-relaxed"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <div
                id="import-ai-modal-footer"
                className="px-5 py-3.5 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between bg-[#F5F5F7]/80 dark:bg-[#161618]/80 shrink-0"
              >
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 hidden sm:inline">
                  {isEer
                    ? 'Superclasses, subclasses & constraint circles are automatically laid out.'
                    : 'Entities, attributes & cardinalities are automatically mapped and laid out.'}
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    id="cancel-import-ai-btn"
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] cursor-pointer transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    id="generate-diagram-btn"
                    type="button"
                    onClick={handleGenerate}
                    disabled={loading}
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white ${
                      isEer ? 'bg-[#9333EA] hover:bg-[#7E22CE]' : 'bg-[#0071E3] hover:bg-[#0077ED]'
                    } shadow-2xs cursor-pointer transition-all duration-200 active:scale-[0.98] disabled:opacity-60`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Architecting Schema...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                        <span>Generate Diagram</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
