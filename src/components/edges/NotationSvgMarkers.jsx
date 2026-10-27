import { memo } from 'react';

export const NotationSvgMarkers = memo(function NotationSvgMarkers() {
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, pointerEvents: 'none' }}>
      <defs>
        <marker
          id="crows-many-optional"
          viewBox="0 0 20 20"
          refX="18"
          refY="10"
          markerWidth="16"
          markerHeight="16"
          orient="auto-start-reverse"
        >
          <path d="M 0 4 L 14 10 L 0 16" fill="none" stroke="#64748b" strokeWidth="1.8" />
          <line x1="14" y1="10" x2="20" y2="10" stroke="#64748b" strokeWidth="1.8" />
          <circle cx="6" cy="10" r="3" fill="#ffffff" stroke="#64748b" strokeWidth="1.8" />
        </marker>

        <marker
          id="crows-many-mandatory"
          viewBox="0 0 20 20"
          refX="18"
          refY="10"
          markerWidth="16"
          markerHeight="16"
          orient="auto-start-reverse"
        >
          <path d="M 0 4 L 14 10 L 0 16" fill="none" stroke="#64748b" strokeWidth="1.8" />
          <line x1="14" y1="10" x2="20" y2="10" stroke="#64748b" strokeWidth="1.8" />
          <line x1="6" y1="4" x2="6" y2="16" stroke="#64748b" strokeWidth="1.8" />
        </marker>

        <marker
          id="crows-one-mandatory"
          viewBox="0 0 20 20"
          refX="18"
          refY="10"
          markerWidth="16"
          markerHeight="16"
          orient="auto-start-reverse"
        >
          <line x1="0" y1="10" x2="20" y2="10" stroke="#64748b" strokeWidth="1.8" />
          <line x1="8" y1="4" x2="8" y2="16" stroke="#64748b" strokeWidth="1.8" />
          <line x1="14" y1="4" x2="14" y2="16" stroke="#64748b" strokeWidth="1.8" />
        </marker>

        <marker
          id="crows-one-optional"
          viewBox="0 0 20 20"
          refX="18"
          refY="10"
          markerWidth="16"
          markerHeight="16"
          orient="auto-start-reverse"
        >
          <line x1="0" y1="10" x2="20" y2="10" stroke="#64748b" strokeWidth="1.8" />
          <circle cx="8" cy="10" r="3" fill="#ffffff" stroke="#64748b" strokeWidth="1.8" />
          <line x1="15" y1="4" x2="15" y2="16" stroke="#64748b" strokeWidth="1.8" />
        </marker>

        <marker
          id="uml-generalization"
          viewBox="0 0 14 14"
          refX="12"
          refY="7"
          markerWidth="12"
          markerHeight="12"
          orient="auto-start-reverse"
        >
          <polygon points="1,1 13,7 1,13" fill="#ffffff" stroke="#64748b" strokeWidth="1.8" />
        </marker>

        <marker
          id="uml-composition"
          viewBox="0 0 14 14"
          refX="12"
          refY="7"
          markerWidth="12"
          markerHeight="12"
          orient="auto-start-reverse"
        >
          <polygon points="1,7 7,1 13,7 7,13" fill="#64748b" stroke="#64748b" strokeWidth="1.5" />
        </marker>

        <marker
          id="uml-aggregation"
          viewBox="0 0 14 14"
          refX="12"
          refY="7"
          markerWidth="12"
          markerHeight="12"
          orient="auto-start-reverse"
        >
          <polygon points="1,7 7,1 13,7 7,13" fill="#ffffff" stroke="#64748b" strokeWidth="1.5" />
        </marker>
      </defs>
    </svg>
  );
});

export default NotationSvgMarkers;
