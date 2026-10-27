import { toCanvas } from 'html-to-image';

export async function exportDiagramToPng({
  containerId = 'er-canvas-container',
  backgroundColor = '#ffffff',
  scale = 2,
  cropToContent = true,
  padding = 50,
  fileName = 'er-diagram.png',
} = {}) {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error('Canvas container not found');
  }

  const nodeElements = Array.from(container.querySelectorAll('.react-flow__node'));
  if (nodeElements.length === 0) {
    throw new Error('Canvas contains no nodes to export');
  }

  // Determine target theme based on requested background
  const isCurrentlyDark = document.documentElement.classList.contains('dark');
  let targetIsDark = isCurrentlyDark;
  if (backgroundColor === '#09090b') {
    targetIsDark = true;
  } else if (backgroundColor === '#ffffff') {
    targetIsDark = false;
  }

  // Target the react-flow canvas wrapper
  const reactFlowEl = container.querySelector('.react-flow');
  const prevInlineBg = reactFlowEl ? reactFlowEl.style.backgroundColor : '';
  const prevInlineBgImg = reactFlowEl ? reactFlowEl.style.backgroundImage : '';

  try {
    // 1. Temporarily switch theme if needed so node cards and text match the chosen background
    if (isCurrentlyDark !== targetIsDark) {
      if (targetIsDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      // Allow browser to apply stylesheet updates
      await new Promise((resolve) => setTimeout(resolve, 40));
    }

    // 2. Make the react-flow canvas background transparent so our custom background is pure
    if (reactFlowEl) {
      reactFlowEl.style.setProperty('background-color', 'transparent', 'important');
      reactFlowEl.style.setProperty('background-image', 'none', 'important');
    }

    // 3. Filter out toolbars, banners, controls, minimap, panels, attribution, and grid background dots
    const filter = (node) => {
      if (!node) return true;
      if (node.id === 'canvas-top-toolbar' || node.id === 'empty-canvas-banner') {
        return false;
      }
      if (node.classList) {
        if (
          node.classList.contains('react-flow__controls') ||
          node.classList.contains('react-flow__minimap') ||
          node.classList.contains('react-flow__panel') ||
          node.classList.contains('react-flow__attribution') ||
          node.classList.contains('react-flow__background')
        ) {
          return false;
        }
      }
      return true;
    };

    // 4. Capture the container with html-to-image with a transparent base
    const rawCanvas = await toCanvas(container, {
      pixelRatio: scale,
      backgroundColor: undefined,
      filter,
      cacheBust: true,
    });

    const containerRect = container.getBoundingClientRect();
    let cropX = 0;
    let cropY = 0;
    let cropW = containerRect.width;
    let cropH = containerRect.height;

    if (cropToContent && nodeElements.length > 0) {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      nodeElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        minX = Math.min(minX, rect.left);
        minY = Math.min(minY, rect.top);
        maxX = Math.max(maxX, rect.right);
        maxY = Math.max(maxY, rect.bottom);
      });

      const edgeElements = Array.from(container.querySelectorAll('.react-flow__edge'));
      edgeElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          minX = Math.min(minX, rect.left);
          minY = Math.min(minY, rect.top);
          maxX = Math.max(maxX, rect.right);
          maxY = Math.max(maxY, rect.bottom);
        }
      });

      const rawCropX = minX - containerRect.left - padding;
      const rawCropY = minY - containerRect.top - padding;
      const rawMaxX = maxX - containerRect.left + padding;
      const rawMaxY = maxY - containerRect.top + padding;

      cropX = Math.max(0, rawCropX);
      cropY = Math.max(0, rawCropY);
      cropW = Math.max(10, Math.min(containerRect.width - cropX, rawMaxX - cropX));
      cropH = Math.max(10, Math.min(containerRect.height - cropY, rawMaxY - cropY));
    }

    // 5. Construct final output canvas and explicitly paint the chosen background color
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = Math.round(cropW * scale);
    finalCanvas.height = Math.round(cropH * scale);

    const ctx = finalCanvas.getContext('2d');
    if (ctx) {
      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
      } else {
        ctx.clearRect(0, 0, finalCanvas.width, finalCanvas.height);
      }

      ctx.drawImage(
        rawCanvas,
        Math.round(cropX * scale),
        Math.round(cropY * scale),
        Math.round(cropW * scale),
        Math.round(cropH * scale),
        0,
        0,
        Math.round(cropW * scale),
        Math.round(cropH * scale)
      );
    }

    return new Promise((resolve, reject) => {
      finalCanvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create image blob'));
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        resolve(url);
      }, 'image/png');
    });
  } finally {
    // Restore react-flow original styles
    if (reactFlowEl) {
      if (prevInlineBg) {
        reactFlowEl.style.backgroundColor = prevInlineBg;
      } else {
        reactFlowEl.style.removeProperty('background-color');
      }
      if (prevInlineBgImg) {
        reactFlowEl.style.backgroundImage = prevInlineBgImg;
      } else {
        reactFlowEl.style.removeProperty('background-image');
      }
    }

    // Restore original document theme
    if (isCurrentlyDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}

export function exportDiagramToSvg({
  nodes = [],
  edges = [],
  backgroundColor = '#ffffff',
  isDark = false,
  fileName = 'er-diagram.svg',
  padding = 60,
} = {}) {
  if (!nodes || nodes.length === 0) {
    throw new Error('No diagram nodes to export');
  }

  const nodeDimensions = {
    entity: { width: 160, height: 56 },
    attribute: { width: 140, height: 48 },
    relationship: { width: 116, height: 116 },
  };

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const nodeMap = new Map();

  nodes.forEach((node) => {
    const type = node.type || 'entity';
    const dims = nodeDimensions[type] || { width: 150, height: 50 };
    const x = node.position?.x ?? 0;
    const y = node.position?.y ?? 0;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + dims.width);
    maxY = Math.max(maxY, y + dims.height);

    nodeMap.set(node.id, {
      ...node,
      dims,
      x,
      y,
      cx: x + dims.width / 2,
      cy: y + dims.height / 2,
    });
  });

  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;
  const originX = minX - padding;
  const originY = minY - padding;

  const domEdgeMap = new Map();
  const domEdges = document.querySelectorAll('.react-flow__edge');
  domEdges.forEach((el) => {
    const id = el.getAttribute('data-id') || el.getAttribute('id');
    const pathElem = el.querySelector('path.react-flow__edge-path');
    if (pathElem) {
      const d = pathElem.getAttribute('d');
      if (id && d) domEdgeMap.set(id, d);
    }
  });

  const svgParts = [];
  svgParts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${originX} ${originY} ${width} ${height}" width="${width}" height="${height}">`
  );

  svgParts.push(`
  <style>
    .entity-node { fill: ${isDark ? '#18181b' : '#ffffff'}; stroke: ${isDark ? '#38bdf8' : '#0284c7'}; stroke-width: 2.5px; }
    .attribute-node { fill: ${isDark ? '#18181b' : '#ffffff'}; stroke: ${isDark ? '#34d399' : '#059669'}; stroke-width: 2.5px; }
    .relationship-node { fill: ${isDark ? '#18181b' : '#ffffff'}; stroke: ${isDark ? '#fbbf24' : '#d97706'}; stroke-width: 2.5px; }
    .diagram-edge { fill: none; stroke: ${isDark ? '#94a3b8' : '#64748b'}; stroke-width: 2px; stroke-linecap: round; stroke-linejoin: round; }
    .node-text { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; text-anchor: middle; dominant-baseline: central; fill: ${isDark ? '#f4f4f5' : '#18181b'}; }
    .entity-text { font-weight: 700; font-size: 14px; }
    .attribute-text { font-weight: 500; font-size: 12px; }
    .relationship-text { font-weight: 600; font-size: 13px; }
  </style>
  `);

  if (backgroundColor && backgroundColor !== 'transparent') {
    svgParts.push(
      `<rect x="${originX}" y="${originY}" width="${width}" height="${height}" fill="${backgroundColor}" />`
    );
  }

  svgParts.push('<g id="diagram-edges">');
  edges.forEach((edge) => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    if (!sourceNode || !targetNode) return;

    let d = domEdgeMap.get(edge.id);
    if (!d) {
      const sx = sourceNode.cx;
      const sy = sourceNode.cy;
      const tx = targetNode.cx;
      const ty = targetNode.cy;
      const midY = (sy + ty) / 2;
      d = `M ${sx} ${sy} C ${sx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`;
    }

    svgParts.push(`<path id="edge-${edge.id}" class="diagram-edge" d="${d}" />`);
  });
  svgParts.push('</g>');

  svgParts.push('<g id="diagram-nodes">');
  nodes.forEach((node) => {
    const nodeData = nodeMap.get(node.id);
    if (!nodeData) return;

    const label = escapeXml(node.data?.label || 'Untitled');
    const { x, y, cx, cy, dims } = nodeData;

    if (node.type === 'entity') {
      svgParts.push(`
      <g id="node-${node.id}">
        <rect class="entity-node" x="${x}" y="${y}" width="${dims.width}" height="${dims.height}" rx="8" ry="8" />
        <text class="node-text entity-text" x="${cx}" y="${cy}">${label}</text>
      </g>
      `);
    } else if (node.type === 'attribute') {
      const rx = dims.width / 2;
      const ry = dims.height / 2;
      svgParts.push(`
      <g id="node-${node.id}">
        <ellipse class="attribute-node" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" />
        <text class="node-text attribute-text" x="${cx}" y="${cy}">${label}</text>
      </g>
      `);
    } else if (node.type === 'relationship') {
      const r = dims.width / 2 - 4;
      const points = `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`;
      svgParts.push(`
      <g id="node-${node.id}">
        <polygon class="relationship-node" points="${points}" />
        <text class="node-text relationship-text" x="${cx}" y="${cy}">${label}</text>
      </g>
      `);
    }
  });
  svgParts.push('</g>');

  svgParts.push('</svg>');

  const svgString = svgParts.join('\n');
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.svg') ? fileName : `${fileName}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return url;
}

function escapeXml(unsafe) {
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}
