import { useState } from 'react';
import { FileDown, Loader2, CheckCircle2, ShieldCheck, Database, GitFork } from 'lucide-react';
import { useDiagram } from '../context/DiagramContext.jsx';
import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';

export default function ExportReport({ className = '' }) {
  const { nodes, edges } = useDiagram();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);

      const entities = nodes.filter((n) => n.type === 'entity');
      const attributes = nodes.filter((n) => n.type === 'attribute');
      const relationships = nodes.filter((n) => n.type === 'relationship');
      const nodeMap = new Map(nodes.map((n) => [n.id, n]));

      const entityCatalog = entities.map((entity) => {
        const connectedEdges = edges.filter(
          (e) => e.source === entity.id || e.target === entity.id
        );

        const entityAttributes = [];
        const entityRelationships = [];

        connectedEdges.forEach((edge) => {
          const otherId = edge.source === entity.id ? edge.target : edge.source;
          const otherNode = nodeMap.get(otherId);

          if (otherNode?.type === 'attribute') {
            entityAttributes.push({
              name: otherNode.data?.label || 'Unnamed Attribute',
              isPrimary: Boolean(otherNode.data?.isPrimary),
            });
          } else if (otherNode?.type === 'relationship') {
            const relLabel = otherNode.data?.label || 'Relates';
            const cardLabel = edge.label ? ` (${edge.label})` : '';
            entityRelationships.push(`${relLabel}${cardLabel}`);
          }
        });

        const uniqueAttrs = Array.from(
          new Map(entityAttributes.map((a) => [a.name, a])).values()
        );

        return {
          id: entity.id,
          name: entity.data?.label || 'Unnamed Entity',
          attributes: uniqueAttrs,
          primaryKeys: uniqueAttrs.filter((a) => a.isPrimary),
          relationships: Array.from(new Set(entityRelationships)),
        };
      });

      const relationshipCatalog = [];
      relationships.forEach((rel) => {
        const connectedEdges = edges.filter(
          (e) => e.source === rel.id || e.target === rel.id
        );

        const connectedEntities = [];
        const relAttributes = [];

        connectedEdges.forEach((edge) => {
          const otherId = edge.source === rel.id ? edge.target : edge.source;
          const otherNode = nodeMap.get(otherId);

          if (otherNode?.type === 'entity') {
            connectedEntities.push({
              name: otherNode.data?.label || 'Entity',
              cardinality: edge.label || '1',
            });
          } else if (otherNode?.type === 'attribute') {
            relAttributes.push(otherNode.data?.label || 'Attribute');
          }
        });

        relationshipCatalog.push({
          name: rel.data?.label || 'Relationship',
          entities: connectedEntities,
          attributes: relAttributes,
        });
      });

      const directEntityEdges = edges.filter((edge) => {
        const s = nodeMap.get(edge.source);
        const t = nodeMap.get(edge.target);
        return s?.type === 'entity' && t?.type === 'entity';
      });

      directEntityEdges.forEach((edge) => {
        const s = nodeMap.get(edge.source);
        const t = nodeMap.get(edge.target);
        relationshipCatalog.push({
          name: edge.label || 'Direct Association',
          entities: [
            { name: s.data?.label || 'Entity 1', cardinality: '1' },
            { name: t.data?.label || 'Entity 2', cardinality: edge.label || 'N' },
          ],
          attributes: [],
        });
      });

      const totalPkCount = entityCatalog.reduce(
        (acc, ent) => acc + ent.primaryKeys.length,
        0
      );
      const entitiesWithPk = entityCatalog.filter((ent) => ent.primaryKeys.length > 0).length;
      const pkCoverage =
        entities.length > 0
          ? Math.round((entitiesWithPk / entities.length) * 100)
          : 100;

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      let currentY = margin;

      const checkPageBreak = (neededHeight) => {
        if (currentY + neededHeight > pageHeight - margin - 8) {
          doc.addPage();
          currentY = margin;
          return true;
        }
        return false;
      };

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text('ER DIAGRAM ARCHITECTURE & SCHEMA REPORT', margin, 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text('Executive Database Model & Structured Data Dictionary Audit', margin, 18);
      doc.text(
        `Generated: ${new Date().toLocaleString()}  |  Format: Relational Entity-Relationship`,
        margin,
        23
      );

      currentY = 34;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('1. Executive Architecture Summary', margin, currentY);
      currentY += 5;

      const cardWidth = (contentWidth - 9) / 4;
      const cardHeight = 16;
      const metrics = [
        { label: 'TOTAL ENTITIES', value: entities.length.toString(), color: [2, 132, 199] },
        { label: 'TOTAL ATTRIBUTES', value: attributes.length.toString(), color: [5, 150, 105] },
        { label: 'RELATIONSHIPS', value: relationshipCatalog.length.toString(), color: [217, 119, 6] },
        { label: 'PK COVERAGE', value: `${pkCoverage}%`, color: [99, 102, 241] },
      ];

      metrics.forEach((m, idx) => {
        const x = margin + idx * (cardWidth + 3);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.roundedRect(x, currentY, cardWidth, cardHeight, 1.5, 1.5, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(m.color[0], m.color[1], m.color[2]);
        doc.text(m.value, x + 4, currentY + 7);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(m.label, x + 4, currentY + 12);
      });

      currentY += cardHeight + 6;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('2. Entity Catalog & Data Dictionary', margin, currentY);
      currentY += 5;

      if (entityCatalog.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text('No entity tables defined in this diagram.', margin + 2, currentY);
        currentY += 7;
      } else {
        entityCatalog.forEach((ent) => {
          const estimatedHeight = 16 + ent.attributes.length * 4.5;
          checkPageBreak(estimatedHeight);

          doc.setFillColor(241, 245, 249);
          doc.setDrawColor(203, 213, 225);
          doc.setLineWidth(0.2);
          doc.rect(margin, currentY, contentWidth, 7, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(15, 23, 42);
          doc.text(`Entity: ${ent.name}`, margin + 3, currentY + 5);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(71, 85, 105);
          const relInfo =
            ent.relationships.length > 0
              ? `Relations: ${ent.relationships.join(', ')}`
              : 'Standalone';
          doc.text(relInfo, pageWidth - margin - 3, currentY + 5, { align: 'right' });

          currentY += 9;

          if (ent.attributes.length === 0) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text('No attributes attached to this entity.', margin + 4, currentY);
            currentY += 5;
          } else {
            ent.attributes.forEach((attr) => {
              checkPageBreak(6);
              if (attr.isPrimary) {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8);
                doc.setTextColor(14, 116, 144);
                doc.text('[PK]', margin + 4, currentY);

                doc.setFont('helvetica', 'bold');
                doc.setTextColor(15, 23, 42);
                doc.text(attr.name, margin + 14, currentY);

                doc.setFont('helvetica', 'italic');
                doc.setFontSize(7.5);
                doc.setTextColor(100, 116, 139);
                doc.text('(Primary Key Identifier)', margin + 70, currentY);
              } else {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(100, 116, 139);
                doc.text('[ATTR]', margin + 4, currentY);

                doc.setTextColor(51, 65, 85);
                doc.text(attr.name, margin + 14, currentY);
              }
              currentY += 4.5;
            });
          }
          currentY += 3;
        });
      }

      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('3. Conceptual Relationship Matrix', margin, currentY);
      currentY += 5;

      if (relationshipCatalog.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text('No relationship associations established between entities.', margin + 2, currentY);
        currentY += 7;
      } else {
        relationshipCatalog.forEach((rel) => {
          checkPageBreak(12);

          let summaryText = '';
          if (rel.entities.length >= 2) {
            summaryText = `${rel.entities[0].name} [${rel.entities[0].cardinality}] <---> <${rel.name}> <---> [${rel.entities[1].cardinality}] ${rel.entities[1].name}`;
          } else if (rel.entities.length === 1) {
            summaryText = `${rel.entities[0].name} [${rel.entities[0].cardinality}] <---> <${rel.name}>`;
          } else {
            summaryText = `<${rel.name}> (Unattached Relationship)`;
          }

          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(226, 232, 240);
          doc.roundedRect(margin, currentY, contentWidth, 8, 1, 1, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(30, 41, 59);
          doc.text(summaryText, margin + 3, currentY + 5.2);

          if (rel.attributes.length > 0) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(7.5);
            doc.setTextColor(100, 116, 139);
            doc.text(`Attrs: ${rel.attributes.join(', ')}`, pageWidth - margin - 3, currentY + 5.2, { align: 'right' });
          }

          currentY += 10;
        });
      }

      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('4. Schema Health & Relational Integrity', margin, currentY);
      currentY += 5;

      const healthChecks = [
        {
          passed: pkCoverage === 100,
          text:
            pkCoverage === 100
              ? 'All entities have defined Primary Key identifiers for robust indexing.'
              : `${entities.length - entitiesWithPk} entity table(s) lack a designated Primary Key.`,
        },
        {
          passed: relationshipCatalog.length > 0,
          text:
            relationshipCatalog.length > 0
              ? 'Multi-table relational constraints and foreign connections are mapped.'
              : 'Diagram contains independent entities without relational associations.',
        },
        {
          passed: attributes.length >= entities.length * 2,
          text: 'Entity tables are populated with substantive domain attributes.',
        },
      ];

      healthChecks.forEach((hc) => {
        checkPageBreak(6);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        if (hc.passed) {
          doc.setTextColor(16, 185, 129);
          doc.text('[PASS]', margin + 2, currentY);
        } else {
          doc.setTextColor(245, 158, 11);
          doc.text('[WARN]', margin + 2, currentY);
        }
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text(hc.text, margin + 18, currentY);
        currentY += 5;
      });

      const container = document.getElementById('er-canvas-container');
      if (container) {
        checkPageBreak(85);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text('5. High-Resolution Visual Diagram Canvas', margin, currentY);
        currentY += 5;

        const filter = (element) => {
          if (!element) return true;
          if (
            element.id === 'canvas-top-toolbar' ||
            element.id === 'empty-canvas-banner' ||
            element.id === 'chat-builder-sidebar' ||
            element.id === 'chat-builder-toggle-btn'
          ) {
            return false;
          }
          if (element.classList) {
            if (
              element.classList.contains('react-flow__controls') ||
              element.classList.contains('react-flow__minimap') ||
              element.classList.contains('react-flow__panel') ||
              element.classList.contains('react-flow__attribution')
            ) {
              return false;
            }
          }
          return true;
        };

        const canvas = await toCanvas(container, {
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          filter,
          cacheBust: true,
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const availableHeight = pageHeight - margin - currentY - 8;
        let renderWidth = imgWidth;
        let renderHeight = imgHeight;

        if (renderHeight > availableHeight && availableHeight > 40) {
          renderHeight = availableHeight;
          renderWidth = (canvas.width * renderHeight) / canvas.height;
        } else if (renderHeight > availableHeight) {
          doc.addPage();
          currentY = margin;
          renderHeight = Math.min(imgHeight, pageHeight - margin * 2 - 15);
          renderWidth = (canvas.width * renderHeight) / canvas.height;
        }

        const renderX = margin + (contentWidth - renderWidth) / 2;
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.rect(renderX - 0.5, currentY - 0.5, renderWidth + 1, renderHeight + 1);
        doc.addImage(imgData, 'PNG', renderX, currentY, renderWidth, renderHeight, undefined, 'FAST');
      }

      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `ER Diagram Builder Audit Report  |  Confidential Architecture Documentation`,
          margin,
          pageHeight - 6
        );
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 6, {
          align: 'right',
        });
      }

      doc.save('er-diagram-report.pdf');
    } catch (err) {
      console.error('Failed to export PDF report:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      id="export-report-btn"
      type="button"
      onClick={handleExport}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-2xs cursor-pointer transition-all duration-200 active:scale-[0.98] ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Generating Report...</span>
        </>
      ) : (
        <>
          <FileDown className="w-3.5 h-3.5" />
          <span>Export PDF</span>
        </>
      )}
    </button>
  );
}
