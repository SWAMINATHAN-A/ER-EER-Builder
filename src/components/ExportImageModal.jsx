import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Image as ImageIcon,
  X,
  Download,
  Loader2,
  Check,
  AlertCircle,
  Maximize2,
  Crop,
  Layers,
} from 'lucide-react';
import { useDiagram } from '../context/DiagramContext.jsx';
import { exportDiagramToPng, exportDiagramToSvg } from '../utils/imageExporter.js';

export default function ExportImageModal({ isOpen, onClose }) {
  const { nodes, edges } = useDiagram();

  const [format, setFormat] = useState('png');
  const [background, setBackground] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
      ? '#09090b'
      : '#ffffff'
  );
  const [scale, setScale] = useState(2);
  const [cropToContent, setCropToContent] = useState(true);
  const [fileName, setFileName] = useState('er-diagram');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isExporting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isExporting]);

  if (!isOpen) return null;

  const totalEntities = nodes.filter((n) => n.type === 'entity').length;
  const totalAttributes = nodes.filter((n) => n.type === 'attribute').length;
  const totalRelationships = nodes.filter((n) => n.type === 'relationship').length;

  const handleExport = async (targetFormat = format) => {
    try {
      setError(null);
      setSuccessMsg(null);
      setIsExporting(true);

      if (nodes.length === 0) {
        throw new Error('Canvas has no nodes to export. Add some nodes first.');
      }

      const safeName = (fileName.trim() || 'er-diagram').replace(/[^a-zA-Z0-9-_]/g, '_');

      if (targetFormat === 'png') {
        await exportDiagramToPng({
          containerId: 'er-canvas-container',
          backgroundColor: background,
          scale: Number(scale),
          cropToContent,
          padding: 50,
          fileName: `${safeName}.png`,
        });
        setSuccessMsg('PNG image downloaded successfully!');
      } else {
        const isCurrentDark = document.documentElement.classList.contains('dark');
        const isDarkTheme = background === '#09090b' || (background === 'transparent' && isCurrentDark);
        exportDiagramToSvg({
          nodes,
          edges,
          backgroundColor: background,
          isDark: isDarkTheme,
          fileName: `${safeName}.svg`,
          padding: 60,
        });
        setSuccessMsg('SVG vector image downloaded successfully!');
      }

      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    } catch (err) {
      setError(err?.message || 'Failed to export image.');
    } finally {
      setIsExporting(false);
    }
  };

  return createPortal(
    <div
      id="export-image-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isExporting) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6 overflow-y-auto"
    >
      <div
        id="export-image-modal-container"
        className="w-full max-w-lg my-auto rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#1C1C1E] shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-2.5rem)]"
      >
        <div
          id="export-image-modal-header"
          className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1C1C1E] shrink-0"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-center text-[#0071E3] dark:text-blue-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3
                id="export-image-modal-title"
                className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
              >
                Export Diagram Image
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                High-resolution PNG or vector SVG
              </p>
            </div>
          </div>
          <button
            id="close-export-image-modal-btn"
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div id="export-image-modal-body" className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F5F5F7] dark:bg-[#121214] border border-black/[0.06] dark:border-white/[0.08] text-xs text-zinc-600 dark:text-zinc-300">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              <span>Diagram Content:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#0071E3] dark:text-[#0A84FF]">
                {totalEntities} Entities
              </span>
              <span>•</span>
              <span className="font-semibold text-[#34C759] dark:text-[#30D158]">
                {totalAttributes} Attributes
              </span>
              <span>•</span>
              <span className="font-semibold text-[#FF9500] dark:text-[#FF9F0A]">
                {totalRelationships} Relationships
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="select-format-png"
                type="button"
                onClick={() => setFormat('png')}
                className={`flex flex-col p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 ${
                  format === 'png'
                    ? 'border-[#0071E3] bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-[#0071E3]'
                    : 'border-black/[0.06] dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    PNG Image (.png)
                  </span>
                  {format === 'png' && <Check className="w-3.5 h-3.5 text-[#0071E3]" />}
                </div>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                  High-resolution raster snapshot for slides and documents
                </span>
              </button>

              <button
                id="select-format-svg"
                type="button"
                onClick={() => setFormat('svg')}
                className={`flex flex-col p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 ${
                  format === 'svg'
                    ? 'border-[#0071E3] bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-[#0071E3]'
                    : 'border-black/[0.06] dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    SVG Vector (.svg)
                  </span>
                  {format === 'svg' && <Check className="w-3.5 h-3.5 text-[#0071E3]" />}
                </div>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                  Lossless scalable vector graphic for Figma or Illustrator
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Background
              </label>
              <span className="text-[11px] font-medium text-[#0071E3] dark:text-[#0A84FF]">
                {background === '#ffffff'
                  ? 'Pure White'
                  : background === 'transparent'
                  ? 'Transparent'
                  : 'Pure Dark'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                id="bg-white-btn"
                type="button"
                onClick={() => setBackground('#ffffff')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  background === '#ffffff'
                    ? 'border-[#0071E3] bg-blue-50/40 dark:bg-blue-950/30 text-blue-950 dark:text-blue-200 ring-1 ring-[#0071E3]'
                    : 'border-black/[0.06] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-[#1C1C1E]'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-white border border-zinc-300 shadow-2xs shrink-0" />
                <span>White</span>
              </button>

              <button
                id="bg-transparent-btn"
                type="button"
                onClick={() => setBackground('transparent')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  background === 'transparent'
                    ? 'border-[#0071E3] bg-blue-50/40 dark:bg-blue-950/30 text-blue-950 dark:text-blue-200 ring-1 ring-[#0071E3]'
                    : 'border-black/[0.06] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-[#1C1C1E]'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full border border-dashed border-zinc-400 bg-transparent shrink-0" />
                <span>Transparent</span>
              </button>

              <button
                id="bg-dark-btn"
                type="button"
                onClick={() => setBackground('#09090b')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  background === '#09090b'
                    ? 'border-[#0071E3] bg-blue-50/40 dark:bg-blue-950/30 text-blue-950 dark:text-blue-200 ring-1 ring-[#0071E3]'
                    : 'border-black/[0.06] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-[#1C1C1E]'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-zinc-950 border border-zinc-700 shadow-2xs shrink-0" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {format === 'png' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Resolution Scale
                </label>
                <select
                  id="png-scale-select"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 bg-[#F5F5F7] dark:bg-[#121214] border border-black/[0.08] dark:border-white/[0.08] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0071E3] cursor-pointer"
                >
                  <option value={1}>1x (Standard)</option>
                  <option value={2}>2x (Retina Display)</option>
                  <option value={3}>3x (Ultra HD Print)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Framing Area
                </label>
                <div className="flex rounded-xl border border-black/[0.08] dark:border-white/[0.08] p-0.5 bg-[#F5F5F7] dark:bg-[#121214]">
                  <button
                    type="button"
                    onClick={() => setCropToContent(true)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      cropToContent
                        ? 'bg-white dark:bg-[#2C2C2E] text-zinc-900 dark:text-zinc-50 shadow-2xs font-semibold'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    <Crop className="w-3 h-3" />
                    <span>Fit Nodes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCropToContent(false)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      !cropToContent
                        ? 'bg-white dark:bg-[#2C2C2E] text-zinc-900 dark:text-zinc-50 shadow-2xs font-semibold'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Full Canvas</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="export-filename-input"
              className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              File Name
            </label>
            <div className="flex items-center">
              <input
                id="export-filename-input"
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="er-diagram"
                className="flex-1 px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 bg-[#F5F5F7] dark:bg-[#121214] border border-black/[0.08] dark:border-white/[0.08] rounded-l-xl focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
              />
              <span className="px-3.5 py-2 text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 bg-black/[0.04] dark:bg-white/[0.04] border border-l-0 border-black/[0.08] dark:border-white/[0.08] rounded-r-xl">
                .{format}
              </span>
            </div>
          </div>

          {error && (
            <div
              id="export-image-error"
              className="flex items-center gap-2 p-3 text-xs text-red-700 dark:text-red-300 bg-red-50/80 dark:bg-red-950/40 border border-red-200/60 dark:border-red-900/40 rounded-2xl"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div
              id="export-image-success"
              className="flex items-center gap-2 p-3 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 rounded-2xl"
            >
              <Check className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        <div
          id="export-image-modal-footer"
          className="px-5 py-3.5 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between bg-[#F5F5F7]/60 dark:bg-[#161618]/60"
        >
          <div className="flex items-center gap-2">
            <button
              id="quick-download-png-btn"
              type="button"
              disabled={isExporting}
              onClick={() => handleExport('png')}
              className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#0071E3] dark:hover:text-[#0A84FF] underline cursor-pointer disabled:opacity-50"
            >
              Quick PNG
            </button>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <button
              id="quick-download-svg-btn"
              type="button"
              disabled={isExporting}
              onClick={() => handleExport('svg')}
              className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#0071E3] dark:hover:text-[#0A84FF] underline cursor-pointer disabled:opacity-50"
            >
              Quick SVG
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="cancel-export-image-btn"
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              id="download-image-btn"
              type="button"
              disabled={isExporting}
              onClick={() => handleExport()}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs cursor-pointer transition-all duration-200 active:scale-[0.98]"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download {format.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
