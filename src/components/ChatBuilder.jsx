import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  MessageSquare,
  Sparkles,
  Send,
  Loader2,
  X,
  Trash2,
  Database,
  Layers,
} from 'lucide-react';
import { useDiagram } from '../context/DiagramContext.jsx';
import { getLayoutedElements } from '../utils/layoutEngine.js';
import { generateWithModelFallback, formatGeminiError } from '../utils/geminiClient.js';

export default function ChatBuilder({ isOpen: controlledOpen, onToggle }) {
  const { setNodes, setEdges, diagramMode } = useDiagram();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const toggleOpen = onToggle || (() => setInternalOpen((prev) => !prev));

  const isEer = diagramMode === 'eer';

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: isEer
        ? 'Hello! I am your AI EER Database Architect. Describe any domain with specialization hierarchies, superclasses, and disjoint (d) or overlapping (o) constraints (e.g. "Vehicle superclass with Car and Truck subclasses"), and I will lay it out.'
        : 'Hello! I am your AI Database Architect. Describe any system or schema (e.g. "E-commerce platform with customers, orders, and products"), and I will design and lay out the ER diagram on the canvas.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = isEer
    ? [
        'Vehicle superclass -> Car (Doors, MaxSpeed) & Truck (Tonnage) [Disjoint, Total]',
        'University: Person superclass -> Student (GPA) & Faculty (Rank, Salary) [Disjoint]',
        'Bank Accounts: Account superclass -> Savings (InterestRate) & Checking (Overdraft)',
      ]
    : [
        'E-commerce: customers, orders, items, products, categories',
        'Hospital: patients, doctors, appointments, prescriptions',
        'University: students, professors, courses, enrollments',
      ];

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const promptText = input.trim();
    if (!promptText || loading) return;

    setError(null);
    setInput('');
    setLoading(true);

    const timeString = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMessage = {
      role: 'user',
      text: promptText,
      timestamp: timeString,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const conversationHistory = [...messages, userMessage].map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

      const systemInstruction = isEer
        ? `You are an expert EER (Enhanced Entity-Relationship) database architect.
When given a user prompt, return ONLY a valid JSON object representing the EER diagram structure.
Structure:
{
  "entities": [
    {
      "name": "Vehicle",
      "isSuperclass": true,
      "attributes": [
        { "name": "VehicleID", "isPrimary": true },
        { "name": "Model", "isPrimary": false }
      ]
    },
    {
      "name": "Car",
      "isSubclass": true,
      "attributes": [
        { "name": "NumDoors", "isPrimary": false }
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
When given a user prompt, return ONLY a valid JSON object representing the ER diagram structure.
Structure:
{
  "entities": [
    {
      "name": "Customer",
      "attributes": [
        { "name": "CustomerID", "isPrimary": true },
        { "name": "FullName", "isPrimary": false }
      ]
    }
  ],
  "relationships": [
    {
      "name": "Places",
      "source": "Customer",
      "target": "Order",
      "cardinality": "1:N"
    }
  ]
}`;

      const response = await generateWithModelFallback({
        contents: conversationHistory,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '';
      const cleanJson = responseText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      const schema = JSON.parse(cleanJson);

      if (!schema || (!Array.isArray(schema.entities) && !Array.isArray(schema.specializations))) {
        throw new Error(
          'The AI model did not return any entities in the schema. Please try rephrasing your description.'
        );
      }

      const generatedNodes = [];
      const generatedEdges = [];
      const entityMap = new Map();

      const rawEntities = Array.isArray(schema.entities) ? schema.entities : [];
      rawEntities.forEach((ent, entIdx) => {
        const rawName = typeof ent.name === 'string' ? ent.name.trim() : `Entity${entIdx + 1}`;
        const entityId = `entity-${rawName.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;

        entityMap.set(rawName.toLowerCase(), entityId);
        entityMap.set(rawName.toLowerCase().replace(/\s+/g, ''), entityId);
        if (rawName.endsWith('s')) {
          entityMap.set(rawName.slice(0, -1).toLowerCase(), entityId);
        }

        generatedNodes.push({
          id: entityId,
          type: 'entity',
          position: { x: 0, y: 0 },
          data: {
            label: rawName,
            isSuperclass: Boolean(ent.isSuperclass),
            isSubclass: Boolean(ent.isSubclass),
            isWeak: Boolean(ent.isWeak),
          },
        });

        const rawAttrs = Array.isArray(ent.attributes) ? ent.attributes : [];
        rawAttrs.forEach((attr, attrIdx) => {
          const attrName =
            typeof attr === 'string'
              ? attr.trim()
              : attr.name
              ? attr.name.trim()
              : `attr${attrIdx + 1}`;
          const isPrimary = typeof attr === 'object' && Boolean(attr.isPrimary);
          const isMultivalued = typeof attr === 'object' && Boolean(attr.isMultivalued);
          const isDerived = typeof attr === 'object' && Boolean(attr.isDerived);
          const attrId = `attr-${entityId}-${attrIdx + 1}-${Math.random().toString(36).substring(2, 6)}`;

          generatedNodes.push({
            id: attrId,
            type: 'attribute',
            position: { x: 0, y: 0 },
            data: {
              label: attrName,
              isPrimary,
              isMultivalued,
              isDerived,
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

      const findEntityId = (targetName) => {
        if (!targetName) return null;
        const normalized = targetName.toLowerCase().trim();
        if (entityMap.has(normalized)) return entityMap.get(normalized);
        const withoutSpaces = normalized.replace(/\s+/g, '');
        if (entityMap.has(withoutSpaces)) return entityMap.get(withoutSpaces);
        if (normalized.endsWith('s') && entityMap.has(normalized.slice(0, -1))) {
          return entityMap.get(normalized.slice(0, -1));
        }
        for (const [key, id] of entityMap.entries()) {
          if (key.includes(normalized) || normalized.includes(key)) {
            return id;
          }
        }
        return null;
      };

      // Handle EER Specializations
      const rawSpecs = Array.isArray(schema.specializations) ? schema.specializations : [];
      rawSpecs.forEach((spec, specIdx) => {
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

        const superId = findEntityId(spec.superclass);
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

        const subList = Array.isArray(spec.subclasses) ? spec.subclasses : [];
        subList.forEach((subName) => {
          const subId = findEntityId(subName);
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

      // Handle Relationships
      const rawRels = Array.isArray(schema.relationships) ? schema.relationships : [];
      rawRels.forEach((rel, relIdx) => {
        const relDesc =
          typeof rel === 'object' && rel !== null
            ? rel.description || rel.desc || rel.details || ''
            : '';
        let relName =
          typeof rel === 'object' && rel !== null
            ? rel.name || rel.label || rel.verb || rel.relationship || ''
            : typeof rel === 'string'
            ? rel
            : '';

        if (!relName && relDesc) {
          relName = relDesc.length <= 20 ? relDesc : relDesc.slice(0, 18);
        }
        if (!relName) {
          relName = `Rel_${relIdx + 1}`;
        }

        const relId = `rel-${relIdx + 1}-${Math.random().toString(36).substring(2, 6)}`;

        generatedNodes.push({
          id: relId,
          type: 'relationship',
          position: { x: 0, y: 0 },
          data: {
            label: relName,
            isIdentifying: Boolean(rel.isIdentifying),
            description: relDesc || undefined,
          },
        });

        let sourceId = findEntityId(rel.source);
        let targetId = findEntityId(rel.target);

        let cardSource = '1';
        let cardTarget = 'N';
        if (typeof rel.cardinality === 'string' && rel.cardinality.includes(':')) {
          const parts = rel.cardinality.split(':');
          cardSource = parts[0]?.trim() || '1';
          cardTarget = parts[1]?.trim() || 'N';
        }

        if (sourceId) {
          generatedEdges.push({
            id: `e-${sourceId}-${relId}`,
            source: sourceId,
            target: relId,
            type: 'smoothstep',
            label: cardSource,
            style: { strokeWidth: 2, stroke: '#64748b' },
          });
        }

        if (targetId) {
          generatedEdges.push({
            id: `e-${relId}-${targetId}`,
            source: relId,
            target: targetId,
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

      const entityCount = rawEntities.length;
      const attributeCount = generatedNodes.filter((n) => n.type === 'attribute').length;
      const relCount = rawRels.length;
      const specCount = rawSpecs.length;

      const botMessage = {
        role: 'assistant',
        text: isEer
          ? `EER Schema generated with ${entityCount} entities, ${specCount} specialization hierarchies, and ${attributeCount} attributes.`
          : `ER Schema generated with ${entityCount} entities, ${attributeCount} attributes, and ${relCount} relationships.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        details: {
          entities: rawEntities.map((e) => e.name),
        },
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const friendlyErr = formatGeminiError(err);
      setError(friendlyErr);
      const errorMessage = {
        role: 'assistant',
        text: friendlyErr,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        text: isEer
          ? 'Chat history cleared. What EER hierarchy or system would you like to build next?'
          : 'Chat history cleared. What database schema would you like to build next?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setError(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return createPortal(
    <>
      {!isOpen && (
        <button
          id="chat-builder-toggle-btn"
          type="button"
          onClick={toggleOpen}
          className={`fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold text-white ${
            isEer ? 'bg-[#9333EA] hover:bg-[#7E22CE]' : 'bg-[#5856D6] hover:bg-[#4B48D1]'
          } shadow-xl transition-all duration-200 cursor-pointer group active:scale-95`}
        >
          <Sparkles className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12 text-amber-200" />
          <span>AI Chat Architect ({isEer ? 'EER' : 'ER'})</span>
        </button>
      )}

      {isOpen && (
        <div
          id="chat-builder-sidebar"
          className="fixed top-16 right-5 bottom-5 w-96 max-w-[calc(100vw-2.5rem)] z-40 flex flex-col bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-right-4"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-[#F5F5F7]/80 dark:bg-[#161618]/80 border-b border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-xl ${isEer ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-600' : 'bg-blue-100 dark:bg-blue-950/60 text-[#0071E3]'} border border-black/[0.05] dark:border-white/[0.05] flex items-center justify-center`}>
                {isEer ? <Layers className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              </div>
              <div>
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                  <span>AI Database Architect</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${isEer ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'}`}>
                    {isEer ? 'EER' : 'ER'}
                  </span>
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    Gemini 3.8 Flash
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                title="Clear Chat History"
                className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={toggleOpen}
                title="Close Sidebar"
                className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? isEer ? 'bg-purple-600 text-white rounded-br-sm shadow-2xs' : 'bg-[#0071E3] text-white rounded-br-sm shadow-2xs'
                      : msg.isError
                      ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200/60 dark:border-red-900/40 rounded-bl-sm'
                      : 'bg-[#E9E9EB] text-zinc-900 dark:bg-[#2C2C2E] dark:text-zinc-100 rounded-bl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {msg.details && (
                    <div className="mt-2 pt-2 border-t border-black/[0.08] dark:border-white/[0.08] space-y-1 text-[11px] opacity-90">
                      {msg.details.entities && (
                        <p>
                          <span className="font-semibold">
                            Entities:
                          </span>{' '}
                          {msg.details.entities.join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-[#E9E9EB] dark:bg-[#2C2C2E] rounded-2xl rounded-bl-sm max-w-[80%]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0071E3] dark:text-[#0A84FF]" />
                <span className="text-xs text-zinc-600 dark:text-zinc-300">
                  Architecting {isEer ? 'EER' : 'ER'} schema...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 2 && !loading && (
            <div className="px-3 pb-2">
              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5 px-1">
                Suggested Schemas
              </span>
              <div className="flex flex-col gap-1">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInput(prompt);
                      textareaRef.current?.focus();
                    }}
                    className="text-left text-[11px] px-3 py-1.5 rounded-xl bg-[#F5F5F7] hover:bg-black/[0.05] dark:bg-[#2C2C2E]/60 dark:hover:bg-[#2C2C2E] text-zinc-600 dark:text-zinc-300 border border-black/[0.04] dark:border-white/[0.04] transition-colors cursor-pointer truncate"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 bg-[#F5F5F7]/80 dark:bg-[#161618]/80 border-t border-black/[0.06] dark:border-white/[0.08]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <div className="relative flex items-center">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isEer ? 'Describe EER hierarchies (e.g. Person superclass -> Student & Faculty)...' : 'Describe entities, attributes, and relationships...'}
                  rows={2}
                  disabled={loading}
                  className="w-full resize-none rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#1C1C1E] px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/40 disabled:opacity-60 transition-all"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-400">
                  Enter to send, Shift+Enter for newline
                </span>
                <button
                  id="chat-builder-send-btn"
                  type="submit"
                  disabled={loading || !input.trim()}
                  className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white ${
                    isEer ? 'bg-[#9333EA] hover:bg-[#7E22CE]' : 'bg-[#0071E3] hover:bg-[#0077ED]'
                  } disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-all duration-200 cursor-pointer active:scale-95`}
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Generate</span>
                      <Send className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
