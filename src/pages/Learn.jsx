import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Box,
  CircleDot,
  GitFork,
  ExternalLink,
  BookmarkCheck,
  Layers,
  Table,
  Hash,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Key,
  Database,
  Sliders,
  ShieldCheck,
  Eye,
  HelpCircle,
  Activity,
  FileText,
  ChevronRight,
  Search,
  Check,
  RotateCcw,
  Zap,
  Split,
  ArrowDownRight,
  Scale,
  Info
} from 'lucide-react';
import { useNavbar } from '../context/NavContext.jsx';

export default function Learn() {
  const { setLearnConfig } = useNavbar();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    setLearnConfig({
      activeSection: 'ER & EER Theory',
    });
    return () => setLearnConfig(null);
  }, [setLearnConfig]);

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'attributes', label: 'Attributes & Keys' },
    { id: 'entities', label: 'Entities & Weak Sets' },
    { id: 'relationships', label: 'Relationships & Cardinality' },
    { id: 'eer', label: 'Enhanced ER (EER)' },
    { id: 'notations', label: '4 Notations Compared' },
    { id: 'reduction', label: 'Relational Schema Reduction' },
    { id: 'hashing', label: 'Hashing & Quadratic Probing' },
    { id: 'resources', label: 'Video & Citations' },
  ];

  const matchesFilter = (sectionCat, keywords = []) => {
    if (activeCategory !== 'all' && activeCategory !== sectionCat) {
      return false;
    }
    if (!searchQuery.trim()) {
      return true;
    }
    const query = searchQuery.toLowerCase();
    return keywords.some(k => k.toLowerCase().includes(query)) || sectionCat.toLowerCase().includes(query);
  };

  return (
    <div id="learn-page" className="h-full w-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8 text-zinc-900 dark:text-zinc-100">
      <div id="learn-container" className="max-w-6xl mx-auto space-y-10">
        <header id="learn-header" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              <BookOpen className="w-3.5 h-3.5" />
              Complete Curriculum & Reference Manual
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <span>Standard:</span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Silberschatz 7e & Elmasri-Navathe 7e</span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 id="learn-main-title" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Database Modeling & Engineering Theory
            </h1>
            <p id="learn-intro-text" className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              Explore exhaustive theoretical guides, structural constraints, multi-notation mappings, relational table reduction algorithms, and secondary storage indexing methods implemented throughout this application.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <Link
              to="/builder?mode=er"
              className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-sky-500 dark:hover:border-sky-500 transition-colors group shadow-2xs"
            >
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Classical ER</span>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Studio Builder</p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-sky-500 transition-colors" />
            </Link>

            <Link
              to="/builder?mode=eer"
              className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-purple-500 dark:hover:border-purple-500 transition-colors group shadow-2xs"
            >
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Enhanced EER</span>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">ISA Specialization</p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-purple-500 transition-colors" />
            </Link>

            <Link
              to="/practice"
              className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors group shadow-2xs"
            >
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Practice Arena</span>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">15 GATE Questions</p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
            </Link>

            <Link
              to="/hashing"
              className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-amber-500 dark:hover:border-amber-500 transition-colors group shadow-2xs"
            >
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Quadratic Hashing</span>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Interactive Visualizer</p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-500 transition-colors" />
            </Link>
          </div>

          <div className="space-y-3 pt-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search concepts, formulas, constraints, or notations (e.g., 'discriminator', 'quadratic', 'merise', 'table reduction')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-2xs font-semibold'
                        : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {matchesFilter('attributes', ['attribute', 'composite', 'multivalued', 'derived', 'primary key', 'partial key', 'discriminator', 'oval', '1nf']) && (
          <section id="section-attributes" className="space-y-5">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <CircleDot className="w-5 h-5 text-emerald-500" />
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Attribute Classifications & Structural Constraints
                </h2>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Formal categorization of domain properties, normal form requirements, and visual syntax.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Simple (Atomic) vs Composite Attributes
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    Hierarchical Tree
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <strong>Simple attributes</strong> are indivisible atomic values that cannot be broken down further (e.g., <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">Salary</code>, <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">Age</code>).
                  <br className="my-1.5" />
                  <strong>Composite attributes</strong> can be divided into sub-parts with independent semantic meaning (e.g., <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">Name</code> into <code className="text-emerald-600 dark:text-emerald-400">First_Name</code>, <code className="text-emerald-600 dark:text-emerald-400">Middle_Initial</code>, and <code className="text-emerald-600 dark:text-emerald-400">Last_Name</code>; or <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">Address</code> into <code className="text-emerald-600 dark:text-emerald-400">Street</code>, <code className="text-emerald-600 dark:text-emerald-400">City</code>, <code className="text-emerald-600 dark:text-emerald-400">State</code>, and <code className="text-emerald-600 dark:text-emerald-400">Pincode</code>).
                </p>
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 text-xs space-y-1">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">Relational Conversion Rule:</div>
                  <div className="text-zinc-600 dark:text-zinc-400 text-[11px]">
                    In relational databases (1NF), composite attributes are flattened: only the leaf-level atomic sub-attributes become table columns. The composite parent is omitted.
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Single-Valued vs Multivalued Attributes
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                    Double Oval Symbol
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <strong>Single-valued attributes</strong> hold exactly one atomic value for an entity instance (e.g., <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">Date_Of_Birth</code>).
                  <br className="my-1.5" />
                  <strong>Multivalued attributes</strong> can have a set of multiple values for the same entity instance (e.g., <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">Phone_Numbers</code>, <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">Degrees</code>, <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">Technical_Skills</code>).
                </p>
                <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs space-y-1">
                  <div className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    1NF Normalization Violation:
                  </div>
                  <div className="text-zinc-600 dark:text-zinc-400 text-[11px]">
                    Storing multivalued attributes in a single row violates 1NF. A dedicated relation table must be synthesized: <code className="text-amber-800 dark:text-amber-300 font-mono">T(PK_Entity, Multivalued_Value)</code> where both columns form the composite primary key.
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Stored vs Derived Attributes
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                    Dashed Oval Symbol
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <strong>Stored attributes</strong> are persistently recorded in physical storage (e.g., <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">Date_Of_Birth</code>, <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">Quantity</code>, <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">Unit_Price</code>).
                  <br className="my-1.5" />
                  <strong>Derived attributes</strong> are not stored in disk tables, but are computed dynamically on query execution from other stored attributes or system values (e.g., <code className="text-purple-600 dark:text-purple-400">Age = CURRENT_DATE - DOB</code>, or <code className="text-purple-600 dark:text-purple-400">Total_Cost = Quantity * Unit_Price</code>).
                </p>
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 text-xs space-y-1">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">Schema Optimization:</div>
                  <div className="text-zinc-600 dark:text-zinc-400 text-[11px]">
                    Excluding derived attributes avoids update anomalies and saves storage overhead, replacing them with SQL computed columns or view layers.
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Key Attribute vs Partial Key (Discriminator)
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                    Solid vs Dashed Underline
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <strong>Key attributes (Primary / Candidate Keys)</strong> uniquely identify every entity instance in the entire entity set across the whole database (e.g., <code className="underline font-semibold text-zinc-900 dark:text-zinc-100">StudentID</code>, <code className="underline font-semibold text-zinc-900 dark:text-zinc-100">ISBN</code>). Represented with a <strong>solid underline</strong>.
                  <br className="my-1.5" />
                  <strong>Partial Keys (Discriminators)</strong> only distinguish weak entity instances that belong to the exact same owner entity (e.g., <code className="border-b border-dashed border-zinc-900 dark:border-zinc-100 font-semibold">Dependent_Name</code> for an employee). Represented with a <strong>dashed underline</strong>.
                </p>
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 text-xs space-y-1">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">Composite Identification Formula:</div>
                  <div className="text-zinc-600 dark:text-zinc-400 text-[11px] font-mono">
                    PK_WeakEntity = (PK_OwnerEntity) ∪ (Discriminator_WeakEntity)
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {matchesFilter('entities', ['entity', 'weak entity', 'strong entity', 'identifying relationship', 'discriminator', 'double rectangle']) && (
          <section id="section-entities" className="space-y-5">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-sky-500" />
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Entity Sets & Weak Entity Sets
                </h2>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Classification of independent enterprise objects versus dependent subordinate structures.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold text-xs">
                      1x
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Strong (Regular) Entity Set</h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Single Rectangle Symbol</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                    Autonomous
                  </span>
                </div>

                <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <p>
                    A strong entity set possesses an independent existence in the domain and contains sufficient attributes to form a unique candidate or primary key without reference to any other table.
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Visual Symbol: Single rectangle border.</li>
                    <li>Primary Key: Underlined solid text (<code className="text-zinc-900 dark:text-zinc-100 font-semibold">EmpID</code>).</li>
                    <li>Relational Mapping: Creates 1 standalone table with primary key index.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 font-mono text-xs space-y-1">
                  <div className="text-zinc-400 text-[10px]">Relational Schema:</div>
                  <div className="text-sky-700 dark:text-sky-300">
                    EMPLOYEE(<span className="underline font-bold">EmpID</span>, Name, Department, HireDate)
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold text-xs border border-dashed border-rose-300 dark:border-rose-700">
                      2x
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Weak Entity Set & Identifying Link</h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Double Rectangle & Double Diamond</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold">
                    Dependent
                  </span>
                </div>

                <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <p>
                    A weak entity set lacks sufficient attributes to form its own primary key. It depends on an <strong>identifying (owner) strong entity</strong> via an <strong>identifying relationship</strong>.
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Visual Symbol: Double rectangle (Entity), Double diamond (Relationship).</li>
                    <li>Partial Key / Discriminator: Dashed underline (<code className="border-b border-dashed border-zinc-700 dark:border-zinc-300">DepName</code>).</li>
                    <li>Mandatory Total Participation: The weak entity must participate totally in its identifying relationship.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 font-mono text-xs space-y-1">
                  <div className="text-zinc-400 text-[10px]">Relational Schema:</div>
                  <div className="text-rose-700 dark:text-rose-300">
                    DEPENDENT(<span className="underline font-bold">EmpID</span>, <span className="border-b border-dashed border-rose-700 dark:border-rose-300 font-bold">DepName</span>, Relationship, BirthDate)
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 pt-1">
                    EmpID is Foreign Key referencing EMPLOYEE(EmpID).
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {matchesFilter('relationships', ['relationship', 'cardinality', 'participation', 'total', 'partial', 'recursive', 'ternary', 'binary']) && (
          <section id="section-relationships" className="space-y-5">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <GitFork className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Relationships, Cardinality Ratios & Participation
                </h2>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Structural connectivity constraints defining association boundaries and integrity guarantees.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    One-to-One (1:1)
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    1:1
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  An entity in A is associated with at most one entity in B, and vice versa (e.g., <code className="text-zinc-800 dark:text-zinc-200">DEPARTMENT</code> <code className="text-amber-600 dark:text-amber-400">Headed_By</code> <code className="text-zinc-800 dark:text-zinc-200">FACULTY</code>).
                </p>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <strong>Table Count:</strong> If one side has total participation, store FK in the total entity table (2 tables). If both are total, merge into 1 table!
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    One-to-Many (1:N)
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    1:N
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  An entity in A is associated with any number of entities in B, but an entity in B is associated with at most one in A (e.g., <code className="text-zinc-800 dark:text-zinc-200">INSTRUCTOR</code> <code className="text-amber-600 dark:text-amber-400">Advises</code> <code className="text-zinc-800 dark:text-zinc-200">STUDENTS</code>).
                </p>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <strong>Table Count:</strong> Place the primary key of the '1' side as a Foreign Key into the 'N' side relation. Minimum 2 tables required.
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    Many-to-Many (M:N)
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    M:N
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  An entity in A can associate with multiple entities in B, and an entity in B can associate with multiple in A (e.g., <code className="text-zinc-800 dark:text-zinc-200">STUDENT</code> <code className="text-amber-600 dark:text-amber-400">Enrolls_In</code> <code className="text-zinc-800 dark:text-zinc-200">COURSE</code>).
                </p>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <strong>Table Count:</strong> Always requires a 3rd junction / associative table containing both primary keys as a composite primary key.
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Participation Constraints: Total vs Partial
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <span className="w-2.5 h-1 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
                    Total Participation (Existence Dependency)
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                    Every entity in the entity set must participate in at least one instance of the relationship set. Represented by a <strong>double line</strong> connecting the entity to the diamond. In Min-Max, min = 1.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <span className="w-2.5 h-0.5 bg-zinc-400 rounded-full" />
                    Partial Participation (Optional)
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                    Some entities in the entity set may not participate in any instance of the relationship set. Represented by a <strong>single line</strong> connecting the entity to the diamond. In Min-Max, min = 0.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {matchesFilter('eer', ['eer', 'specialization', 'generalization', 'isa', 'disjoint', 'overlapping', 'total specialization', 'category', 'union']) && (
          <section id="section-eer" className="space-y-5">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-500" />
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Enhanced ER (EER) Modeling & Inheritance
                </h2>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Top-down specialization, bottom-up generalization, disjoint/overlapping constraints, and union categories.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Split className="w-4 h-4 text-purple-500" />
                    Disjoint (`d`) vs Overlapping (`o`)
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                    Disjointness Constraint
                  </span>
                </div>
                <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <p>
                    <strong>Disjointness (`d` circle):</strong> Specifies that subclasses must be mutually exclusive. An entity instance can belong to at most one subclass.
                    <br />
                    <em>Example:</em> A <code className="text-zinc-900 dark:text-zinc-200">Vehicle</code> entity can be either a <code className="text-purple-600 dark:text-purple-400">Car</code> or a <code className="text-purple-600 dark:text-purple-400">Truck</code>, but cannot simultaneously be both.
                  </p>
                  <p>
                    <strong>Overlapping (`o` circle):</strong> An entity instance can simultaneously belong to multiple subclasses in the specialization hierarchy.
                    <br />
                    <em>Example:</em> In a university, a <code className="text-zinc-900 dark:text-zinc-200">Person</code> entity can be both an <code className="text-purple-600 dark:text-purple-400">Employee</code> and a <code className="text-purple-600 dark:text-purple-400">Student</code> at the same time.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-sky-500" />
                    Total (`===`) vs Partial (`---`) Specialization
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold">
                    Completeness Constraint
                  </span>
                </div>
                <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <p>
                    <strong>Total Specialization (Double Line `===` to circle):</strong> Every entity in the superclass must belong to at least one subclass. No standalone superclass entity can exist without a subclass role.
                    <br />
                    <em>Example:</em> Every <code className="text-zinc-900 dark:text-zinc-200">Account</code> in a bank must be either a <code className="text-sky-600 dark:text-sky-400">Savings_Account</code> or a <code className="text-sky-600 dark:text-sky-400">Checking_Account</code>.
                  </p>
                  <p>
                    <strong>Partial Specialization (Single Line `---` to circle):</strong> An entity in the superclass can exist without belonging to any subclass.
                    <br />
                    <em>Example:</em> An <code className="text-zinc-900 dark:text-zinc-200">Employee</code> can exist who is neither an <code className="text-sky-600 dark:text-sky-400">Engineer</code> nor a <code className="text-sky-600 dark:text-sky-400">Secretary</code>.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 md:col-span-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    Category / Union Type (`U` circle)
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                    Multiple Superclass Inheritance
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  A <strong>Category (Union Type)</strong> represents a single subclass whose instances are a subset of the union of distinct, independent superclasses with different keys.
                  For instance, a <code className="text-zinc-900 dark:text-zinc-100 font-semibold">Vehicle_Owner</code> subclass can be an individual <code className="text-emerald-600 dark:text-emerald-400 font-mono">PERSON</code>, a <code className="text-emerald-600 dark:text-emerald-400 font-mono">BANK</code>, or a <code className="text-emerald-600 dark:text-emerald-400 font-mono">COMPANY</code>. The category receives a synthetic surrogate key (<code className="text-zinc-800 dark:text-zinc-200">OwnerID</code>) mapped across the participating superclass entities.
                </p>
              </div>
            </div>
          </section>
        )}

        {matchesFilter('notations', ['notation', 'chen', 'crowsfoot', 'uml', 'minmax', 'merise', 'multiplicity']) && (
          <section id="section-notations" className="space-y-5">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Table className="w-5 h-5 text-sky-500" />
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Multi-Notation Systems: Comparative Architectural Matrix
                </h2>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Structural syntax, terminal glyphs, and semantic orientation differences across the 4 supported notations.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 font-semibold">
                    <th className="p-3">Feature Dimension</th>
                    <th className="p-3 text-sky-600 dark:text-sky-400 font-bold">Peter Chen (1976)</th>
                    <th className="p-3 text-blue-600 dark:text-blue-400 font-bold">Crow&apos;s Foot (Martin)</th>
                    <th className="p-3 text-purple-600 dark:text-purple-400 font-bold">UML Class Diagram</th>
                    <th className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">Min-Max (ISO / Merise)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-400">
                  <tr>
                    <td className="p-3 font-semibold text-zinc-900 dark:text-zinc-200">Entity Shape</td>
                    <td className="p-3">Single rectangle (double border for weak)</td>
                    <td className="p-3">Table box with header and column compartment</td>
                    <td className="p-3">3-compartment class rectangle (Name, Attr, Methods)</td>
                    <td className="p-3">Single rectangle (double border for weak)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-zinc-900 dark:text-zinc-200">Attribute Representation</td>
                    <td className="p-3">Separate oval nodes linked with lines</td>
                    <td className="p-3">Embedded column rows with PK/FK tags</td>
                    <td className="p-3">Typed attributes with visibility (+/-)</td>
                    <td className="p-3">Separate oval nodes linked with lines</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-zinc-900 dark:text-zinc-200">Relationship Symbol</td>
                    <td className="p-3">Rhombus / Diamond (double for identifying)</td>
                    <td className="p-3">Direct connector line (no diamond)</td>
                    <td className="p-3">Direct association line with role name</td>
                    <td className="p-3">Rhombus / Diamond connected to entities</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-zinc-900 dark:text-zinc-200">Cardinality Notation</td>
                    <td className="p-3 font-mono">1:1, 1:N, M:N</td>
                    <td className="p-3 font-mono">||, o|, &gt;|, o&lt;</td>
                    <td className="p-3 font-mono">0..1, 1..1, 0..*, 1..*</td>
                    <td className="p-3 font-mono">(0,1), (1,1), (0,N), (1,N)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-zinc-900 dark:text-zinc-200">Semantic Orientation</td>
                    <td className="p-3">&ldquo;Look-Across&rdquo; target entity ratio</td>
                    <td className="p-3">Terminal endpoint glyph on target entity</td>
                    <td className="p-3">Multiplicity range at target boundary</td>
                    <td className="p-3">&ldquo;Participation&rdquo; written directly on source branch</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1.5">
                <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  Crow&apos;s Foot Markers
                </div>
                <div className="font-mono text-[11px] space-y-1 text-zinc-600 dark:text-zinc-400">
                  <div>• <code className="text-zinc-900 dark:text-zinc-200">||</code> : Mandatory One (1..1)</div>
                  <div>• <code className="text-zinc-900 dark:text-zinc-200">o|</code> : Optional One (0..1)</div>
                  <div>• <code className="text-zinc-900 dark:text-zinc-200">&gt;|</code> : Mandatory Many (1..*)</div>
                  <div>• <code className="text-zinc-900 dark:text-zinc-200">o&lt;</code> : Optional Many (0..*)</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1.5">
                <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  UML Multiplicity
                </div>
                <div className="font-mono text-[11px] space-y-1 text-zinc-600 dark:text-zinc-400">
                  <div>• <code className="text-zinc-900 dark:text-zinc-200">0..1</code> : Zero or One</div>
                  <div>• <code className="text-zinc-900 dark:text-zinc-200">1..1</code> : Exactly One</div>
                  <div>• <code className="text-zinc-900 dark:text-zinc-200">0..*</code> : Zero or More</div>
                  <div>• <code className="text-zinc-900 dark:text-zinc-200">1..*</code> : At least One</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1.5">
                <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Min-Max Tuples
                </div>
                <div className="font-mono text-[11px] space-y-1 text-zinc-600 dark:text-zinc-400">
                  <div>• <code className="text-zinc-900 dark:text-zinc-200">(0, 1)</code> : Partial Single</div>
                  <div>• <code className="text-zinc-900 dark:text-zinc-200">(1, 1)</code> : Total Single</div>
                  <div>• <code className="text-zinc-900 dark:text-zinc-200">(0, N)</code> : Partial Multiple</div>
                  <div>• <code className="text-zinc-900 dark:text-zinc-200">(1, N)</code> : Total Multiple</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1.5">
                <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Crucial Distinction
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal">
                  In Chen notation, cardinality is labeled on the target side (&ldquo;look-across&rdquo;), whereas in Min-Max, the constraint is written directly on the source entity&apos;s branch.
                </p>
              </div>
            </div>
          </section>
        )}

        {matchesFilter('reduction', ['reduction', 'table reduction', 'gate', 'relational mapping', 'minimum tables', 'foreign key']) && (
          <section id="section-reduction" className="space-y-5">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-500" />
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Relational Schema Mapping & Minimum Table Count Rules
                </h2>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                The canonical 7-step mapping algorithm used in database design and competitive GATE CS examinations.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs shrink-0">
                  R1
                </div>
                <div className="space-y-1 flex-1 text-xs">
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">Rule 1: Strong Entity Sets</div>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Create a separate relational table for each regular strong entity. Include all simple atomic attributes. For composite attributes, include only the constituent atomic leaf attributes. The primary key of the entity becomes the primary key of the table.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400 font-mono font-bold text-xs shrink-0">
                  R2
                </div>
                <div className="space-y-1 flex-1 text-xs">
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">Rule 2: Weak Entity Sets</div>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Create a separate relational table for each weak entity set. Include all its simple attributes, plus the primary key of its identifying owner strong entity as a Foreign Key. The composite primary key of the table is formed by combining <code className="font-bold text-zinc-800 dark:text-zinc-200">Owner_PK + Partial_Key</code>.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400 font-mono font-bold text-xs shrink-0">
                  R3
                </div>
                <div className="space-y-1 flex-1 text-xs">
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">Rule 3: Binary 1:1 Relationships</div>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <strong>Case A (One side Total, One side Partial):</strong> Embed the primary key of the partial entity as a Foreign Key into the total participation entity table. This guarantees no NULL values. Minimum tables: <strong>2</strong>.
                    <br />
                    <strong>Case B (Both sides Total):</strong> Merge both entities and the relationship into a <strong>single unified table</strong>! Minimum tables: <strong>1</strong>.
                    <br />
                    <strong>Case C (Both sides Partial):</strong> Embed the foreign key in either entity table (with potential NULLs), or create a separate relationship table. Minimum tables: <strong>2</strong>.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 font-mono font-bold text-xs shrink-0">
                  R4
                </div>
                <div className="space-y-1 flex-1 text-xs">
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">Rule 4: Binary 1:N Relationships</div>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Always place the primary key of the &lsquo;1&rsquo; side entity as a Foreign Key into the &lsquo;N&rsquo; side entity relation table. A separate table for the relationship is <strong>NOT</strong> required. Minimum tables: <strong>2</strong> (Entity 1 + Entity 2 with FK).
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400 font-mono font-bold text-xs shrink-0">
                  R5
                </div>
                <div className="space-y-1 flex-1 text-xs">
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">Rule 5: Binary M:N Relationships</div>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Mandatorily creates a separate cross-reference/junction table containing the primary keys of both participating entities as a composite primary key, plus any descriptive attributes of the relationship. Minimum tables: <strong>3</strong> (Entity A + Entity B + Relationship Table R).
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs shrink-0">
                  R6
                </div>
                <div className="space-y-1 flex-1 text-xs">
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">Rule 6: Multivalued Attributes</div>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Each multivalued attribute requires its own distinct table containing <code className="font-bold text-zinc-800 dark:text-zinc-200">Entity_PK + Attribute_Value</code>. Both attributes together constitute the composite primary key.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {matchesFilter('hashing', ['hashing', 'quadratic', 'open addressing', 'collision', 'primary clustering', 'load factor', 'prime']) && (
          <section id="section-hashing" className="space-y-5">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Secondary Storage Indexing: Open Addressing & Quadratic Probing
                </h2>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Mathematical foundations of database bucket indexing, collision resolution mechanics, and load factor guarantees.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  The Quadratic Probing Formula
                </h3>
                <div className="p-4 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-xs sm:text-sm text-center shadow-inner border border-zinc-800">
                  h(k, i) = ( h&apos;(k) + c₁ · i + c₂ · i² ) mod m
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 leading-relaxed">
                  <div>• <code className="text-zinc-900 dark:text-zinc-200 font-mono">k</code> : The search or record key.</div>
                  <div>• <code className="text-zinc-900 dark:text-zinc-200 font-mono">h&apos;(k) = k mod m</code> : The auxiliary primary hash function.</div>
                  <div>• <code className="text-zinc-900 dark:text-zinc-200 font-mono">i ∈ &#123;0, 1, 2, ..., m - 1&#125;</code> : The probe count (iteration index).</div>
                  <div>• <code className="text-zinc-900 dark:text-zinc-200 font-mono">c₁, c₂</code> : Positive constant coefficients (default c₁ = 1, c₂ = 1).</div>
                  <div>• <code className="text-zinc-900 dark:text-zinc-200 font-mono">m</code> : Total slot capacity of the hash table.</div>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Primary vs Secondary Clustering
                </h3>
                <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <p>
                    <strong>Primary Clustering (Defeated):</strong> In linear probing (c₂ = 0), collisions create long contiguous occupied blocks. Any probe landing nearby is forced through the entire cluster, degrading lookup from O(1) to O(N). Quadratic probing eliminates primary clustering by skipping quadratically.
                  </p>
                  <p>
                    <strong>Secondary Clustering:</strong> Because the probe sequence depends entirely on <code className="font-mono text-zinc-800 dark:text-zinc-200">h&apos;(k)</code>, two keys with the same initial hash share the identical sequence of probe jumps. This is mitigated in double hashing.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200">
                  <strong>Full Coverage Theorem:</strong> If table size <code className="font-mono font-bold">m</code> is a <strong>prime number</strong> and load factor <code className="font-mono font-bold">α = n/m ≤ 0.5</code>, quadratic probing is mathematically guaranteed to find an empty slot.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-amber-950 dark:text-amber-200">
                  Ready to test collision resolution dynamically?
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  Launch the interactive step-by-step simulator with custom table sizes, prime checking, and animated probe tracks.
                </p>
              </div>
              <Link
                to="/hashing"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 text-xs font-semibold shadow-2xs transition-colors shrink-0"
              >
                Open Hashing Visualizer
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>
        )}

        {matchesFilter('resources', ['video', 'tutorial', 'reference', 'silberschatz', 'elmasri', 'navathe', 'textbook']) && (
          <>
            <section id="video-tutorial-section" className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <div>
                  <h2 id="video-tutorial-heading" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    Video Walkthrough & Tutorials
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Step-by-step visual demonstration of ER diagram construction, cardinality derivation, and schema compilation.
                  </p>
                </div>
              </div>

              <div id="youtube-embed-wrapper" className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-900 shadow-md">
                <iframe
                  id="youtube-player-iframe"
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube-nocookie.com/embed/QpdhBUYk7Kk"
                  title="Entity Relationship Diagram (ERD) Tutorial"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </section>

            <section id="references-section" className="space-y-4">
              <h2 id="references-heading" className="text-xl font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                Curricular Citations & Academic Textbooks
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  id="citation-card-silberschatz"
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 shrink-0">
                        <BookmarkCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          Database System Concepts (7th Edition)
                        </h3>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Silberschatz, Korth, and Sudarshan • McGraw-Hill
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Primary foundation for Chapter 6 (&ldquo;Database Design Using the E-R Model&rdquo;) and Chapter 14 (&ldquo;Indexing and Hashing&rdquo;), detailing formal entity classifications, constraint specifications, and relational schema transformations.
                    </p>
                  </div>
                  <div>
                    <a
                      href="https://www.db-book.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                    >
                      Visit Official Companion Page
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div
                  id="citation-card-elmasri"
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <BookmarkCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          Fundamentals of Database Systems (7th Edition)
                        </h3>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Ramez Elmasri & Shamkant B. Navathe • Pearson
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Primary curricular reference for Chapter 3 (&ldquo;Data Modeling Using the Entity-Relationship Model&rdquo;), Chapter 4 (&ldquo;Enhanced Entity-Relationship Modeling&rdquo;), and Chapter 9 (&ldquo;Relational Database Design by ER- and EER-to-Relational Mapping&rdquo;).
                    </p>
                  </div>
                  <div>
                    <a
                      href="https://www.pearson.com/en-us/subject-catalog/p/fundamentals-of-database-systems/P200000003290"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      View Publisher Catalog
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}


