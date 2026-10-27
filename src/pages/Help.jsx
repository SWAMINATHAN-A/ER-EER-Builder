import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Move,
  Cable,
  Type,
  Database,
  FileDown,
  MousePointerClick,
  CheckCircle2,
  Users,
  ArrowRight,
} from 'lucide-react';
import { useNavbar } from '../context/NavContext.jsx';

export default function Help() {
  const { setHelpConfig } = useNavbar();

  useEffect(() => {
    setHelpConfig({
      activeTopic: 'Quick Start & Interactive Guide',
    });
    return () => setHelpConfig(null);
  }, [setHelpConfig]);

  const steps = [
    {
      id: 'step-drag-nodes',
      number: '01',
      title: 'Dragging Shapes onto the Canvas',
      icon: Move,
      color: 'text-sky-600 dark:text-sky-400',
      bgColor: 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800',
      description:
        'Locate the sidebar on the left side of the Diagram Builder. Choose from three essential ER shapes: Entity (Rectangle), Attribute (Oval), or Relationship (Diamond).',
      instructions: [
        'Click and hold any shape item in the sidebar.',
        'Drag your pointer over any open space in the grid canvas and release to place it.',
        'Alternatively, simply click on any shape in the sidebar to quick-spawn it at the center of your view.',
      ],
    },
    {
      id: 'step-connect-nodes',
      number: '02',
      title: 'Connecting Shapes with Association Edges',
      icon: Cable,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
      description:
        'Connect entities with attributes and relationships to form your complete conceptual data schema.',
      instructions: [
        'Hover over any shape to see the circular handle connection ports located at Top, Left, Right, and Bottom positions.',
        'Click and drag a line from any handle port to a handle on another shape.',
        'Release the mouse cursor to lock in the smoothstep connection edge.',
        'Connect attributes to their parent entities, and link entities through relationship diamonds.',
      ],
    },
    {
      id: 'step-rename-nodes',
      number: '03',
      title: 'Renaming Labels & Blank Reversion Protection',
      icon: Type,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
      description:
        'Customize names to represent your actual domain entities, database fields, and associative rules.',
      instructions: [
        'Double-click directly on any shape text label to activate inline editing.',
        'Type your desired name (for example, "Student", "CourseID", or "Enrolls_In").',
        'Press "Enter" or click outside the text field to save the label immediately.',
        'If you delete all text and leave the label blank, the system automatically reverts the name to "Untitled" for safety.',
      ],
    },
    {
      id: 'step-generate-sql',
      number: '04',
      title: 'Generating SQL Schema DDL Statements',
      icon: Database,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800',
      description:
        'Convert your visual entity-relationship structure into production-ready SQL CREATE TABLE DDL queries.',
      instructions: [
        'Ensure your entities have connected attributes representing key and descriptive columns.',
        'Click the "Generate SQL" action in the builder toolbar or sidebar.',
        'Review the generated SQL DDL statements detailing primary keys, columns, types, and foreign key references.',
        'Use the one-click copy button to paste the generated SQL script into your database client (PostgreSQL, MySQL, SQLite).',
      ],
    },
    {
      id: 'step-download-report',
      number: '05',
      title: 'Exporting and Downloading the Schema PDF Report',
      icon: FileDown,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800',
      description:
        'Generate and download a comprehensive structured audit report of your complete diagram schema as a print-ready PDF.',
      instructions: [
        'Click the "Download PDF Report" button in either the top canvas toolbar or the left sidebar.',
        'The app compiles an academic-grade formatted PDF report including executive summary metrics, entity-attribute catalogs, relationship associations, and complete SQL DDL scripts.',
        'Save the PDF to your local machine for project reports, academic evaluations, or team documentation.',
      ],
    },
  ];

  return (
    <div id="help-page" className="h-full w-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8">
      <div id="help-container" className="max-w-4xl mx-auto space-y-10">
        <header id="help-header" className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
            <HelpCircle className="w-3.5 h-3.5" />
            User Manual & Operations Guide
          </div>
          <h1 id="help-main-title" className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            How to Use ER Diagram Builder
          </h1>
          <p id="help-intro-text" className="text-base text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Follow this quick step-by-step workflow guide to master diagram creation, handle connections, manage labels, generate SQL scripts, and export documentation reports.
          </p>
        </header>

        <section id="help-steps-list" className="space-y-6">
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <article
                key={step.id}
                id={step.id}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs transition-all hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex items-center gap-3 sm:flex-col sm:items-center shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${step.bgColor} ${step.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold text-zinc-400 dark:text-zinc-500">
                      STEP {step.number}
                    </span>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {step.title}
                      </h2>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                      <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                        Action Checklist
                      </div>
                      <ul className="space-y-2">
                        {step.instructions.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section id="additional-shortcuts-section" className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-base">
            <MousePointerClick className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            Quick Keyboard & Mouse Shortcuts
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <div className="font-semibold text-zinc-800 dark:text-zinc-200">Delete Shapes or Edges</div>
              <div className="text-zinc-500 dark:text-zinc-400">Click any element and press <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 font-mono text-[10px] text-zinc-800 dark:text-zinc-200">Backspace</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 font-mono text-[10px] text-zinc-800 dark:text-zinc-200">Delete</kbd>.</div>
            </div>
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <div className="font-semibold text-zinc-800 dark:text-zinc-200">Pan and Zoom Canvas</div>
              <div className="text-zinc-500 dark:text-zinc-400">Scroll the mouse wheel to zoom in or out; drag empty canvas to pan around.</div>
            </div>
          </div>
        </section>

        <section id="engineering-team-section" className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Engineering Team & Credits</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Learn more about the creators, academic mentors, and technology behind ER Diagram Studio.</p>
            </div>
          </div>
          <Link
            to="/developed-by"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors shrink-0"
          >
            <span>View Developed By</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>
      </div>
    </div>
  );
}

