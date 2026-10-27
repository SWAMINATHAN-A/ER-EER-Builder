import { useState } from 'react';
import { Image as ImageIcon, ChevronDown } from 'lucide-react';
import ExportImageModal from './ExportImageModal.jsx';
import { useDiagram } from '../context/DiagramContext.jsx';
import { exportDiagramToPng, exportDiagramToSvg } from '../utils/imageExporter.js';

export default function ExportImage({ className = '', variant = 'default' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { nodes, edges } = useDiagram();

  const handleQuickPng = async (e) => {
    e.stopPropagation();
    setShowDropdown(false);
    try {
      await exportDiagramToPng({
        containerId: 'er-canvas-container',
        backgroundColor: '#ffffff',
        scale: 2,
        cropToContent: true,
        padding: 50,
        fileName: 'er-diagram.png',
      });
    } catch (err) {
      console.error(err);
      setIsOpen(true);
    }
  };

  const handleQuickSvg = (e) => {
    e.stopPropagation();
    setShowDropdown(false);
    try {
      exportDiagramToSvg({
        nodes,
        edges,
        backgroundColor: '#ffffff',
        fileName: 'er-diagram.svg',
        padding: 60,
      });
    } catch (err) {
      console.error(err);
      setIsOpen(true);
    }
  };

  if (variant === 'sidebar') {
    return (
      <>
        <div className="relative">
          <div className="flex rounded-xl shadow-2xs overflow-hidden border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1C1C1E] text-zinc-800 dark:text-zinc-200">
            <button
              id="sidebar-export-image-btn"
              type="button"
              onClick={() => setIsOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-[#2C2C2E] transition-colors cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
              <span>Export Image</span>
            </button>
            <button
              id="sidebar-export-image-dropdown-btn"
              type="button"
              onClick={() => setShowDropdown((prev) => !prev)}
              className="px-2 border-l border-black/[0.06] dark:border-white/[0.08] hover:bg-zinc-50 dark:hover:bg-[#2C2C2E] transition-colors cursor-pointer"
              title="Quick export options"
            >
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>

          {showDropdown && (
            <div
              id="sidebar-export-image-menu"
              className="absolute left-0 right-0 mt-1 z-30 py-1 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.08] rounded-2xl shadow-xl text-xs"
            >
              <button
                type="button"
                onClick={handleQuickPng}
                className="w-full px-3.5 py-1.5 text-left text-zinc-700 dark:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] flex items-center justify-between cursor-pointer"
              >
                <span>Quick PNG (2x)</span>
                <span className="text-[10px] text-zinc-400">.png</span>
              </button>
              <button
                type="button"
                onClick={handleQuickSvg}
                className="w-full px-3.5 py-1.5 text-left text-zinc-700 dark:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] flex items-center justify-between cursor-pointer"
              >
                <span>Quick SVG (Vector)</span>
                <span className="text-[10px] text-zinc-400">.svg</span>
              </button>
              <div className="my-1 border-t border-black/[0.06] dark:border-white/[0.08]" />
              <button
                type="button"
                onClick={() => {
                  setShowDropdown(false);
                  setIsOpen(true);
                }}
                className="w-full px-3.5 py-1.5 text-left font-medium text-[#0071E3] dark:text-[#0A84FF] hover:bg-blue-50/50 dark:hover:bg-blue-950/30 cursor-pointer"
              >
                More options...
              </button>
            </div>
          )}
        </div>

        <ExportImageModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </>
    );
  }

  return (
    <>
      <div className={`relative inline-flex ${className}`}>
        <div className="inline-flex rounded-xl overflow-hidden text-zinc-700 dark:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors">
          <button
            id="canvas-export-image-btn"
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
            <span>Image</span>
          </button>
          <button
            id="canvas-export-image-dropdown-btn"
            type="button"
            onClick={() => setShowDropdown((prev) => !prev)}
            className="px-1.5 hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Quick export options"
          >
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>

        {showDropdown && (
          <div
            id="canvas-export-image-menu"
            className="absolute right-0 top-full mt-1.5 w-48 z-30 py-1 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.08] rounded-2xl shadow-xl text-xs"
          >
            <button
              type="button"
              onClick={handleQuickPng}
              className="w-full px-3.5 py-1.5 text-left text-zinc-700 dark:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] flex items-center justify-between cursor-pointer"
            >
              <span>Quick PNG (2x)</span>
              <span className="text-[10px] text-zinc-400">.png</span>
            </button>
            <button
              type="button"
              onClick={handleQuickSvg}
              className="w-full px-3.5 py-1.5 text-left text-zinc-700 dark:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] flex items-center justify-between cursor-pointer"
            >
              <span>Quick SVG (Vector)</span>
              <span className="text-[10px] text-zinc-400">.svg</span>
            </button>
            <div className="my-1 border-t border-black/[0.06] dark:border-white/[0.08]" />
            <button
              type="button"
              onClick={() => {
                setShowDropdown(false);
                setIsOpen(true);
              }}
              className="w-full px-3.5 py-1.5 text-left font-medium text-[#0071E3] dark:text-[#0A84FF] hover:bg-blue-50/50 dark:hover:bg-blue-950/30 cursor-pointer"
            >
              Export settings...
            </button>
          </div>
        )}
      </div>

      <ExportImageModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
