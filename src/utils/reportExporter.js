import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';

export async function exportDiagramToPdfReport({ nodes = [], edges = [], diagramMode = 'er' } = {}) {
  try {
    const entities = nodes.filter((n) => n.type === 'entity');
    const attributes = nodes.filter((n) => n.type === 'attribute');
    const relationships = nodes.filter((n) => n.type === 'relationship');
    const specializations = nodes.filter((n) => n.type === 'specialization');
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
    const margin = 16;
    let yPos = 20;

    // Header Background Accent
    doc.setFillColor(24, 24, 27);
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('ER & EER Diagram Studio - Technical Report', margin, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(212, 212, 216);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} • Architecture Documentation & Schema Report`,
      margin,
      19
    );

    yPos = 36;

    // Executive Metrics Summary
    doc.setFillColor(244, 244, 245);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 22, 2.5, 2.5, 'F');

    doc.setTextColor(24, 24, 27);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Architectural Metric Summary', margin + 4, yPos + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(82, 82, 91);
    const metricsText = `Entities: ${entities.length}   |   Attributes: ${attributes.length} (PKs: ${totalPkCount})   |   Relationships: ${relationships.length}   |   PK Coverage: ${pkCoverage}%`;
    doc.text(metricsText, margin + 4, yPos + 14);

    yPos += 28;

    // Entity Catalog
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(24, 24, 27);
    doc.text('1. Entity Data Dictionary', margin, yPos);
    yPos += 6;

    entityCatalog.forEach((ent) => {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFillColor(250, 250, 250);
      doc.roundedRect(margin, yPos, pageWidth - margin * 2, 16, 2, 2, 'F');
      doc.setDrawColor(228, 228, 231);
      doc.roundedRect(margin, yPos, pageWidth - margin * 2, 16, 2, 2, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text(ent.name, margin + 4, yPos + 5.5);

      const attrStr = ent.attributes.map((a) => (a.isPrimary ? `[PK] ${a.name}` : a.name)).join(', ') || 'None';
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`Attributes: ${attrStr}`, margin + 4, yPos + 11.5);

      yPos += 20;
    });

    // Relationship Catalog
    if (relationshipCatalog.length > 0) {
      if (yPos > pageHeight - 35) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(24, 24, 27);
      doc.text('2. Relationship Cardinality Matrix', margin, yPos);
      yPos += 6;

      relationshipCatalog.forEach((rel) => {
        if (yPos > pageHeight - 25) {
          doc.addPage();
          yPos = 20;
        }

        const participants = rel.entities.map((e) => `${e.name} (${e.cardinality})`).join(' <-> ') || 'N/A';
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        doc.text(`• ${rel.name}:`, margin + 2, yPos + 4);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(participants, margin + 35, yPos + 4);

        yPos += 8;
      });
    }

    doc.save(`${diagramMode}-diagram-report.pdf`);
  } catch (err) {
    console.error('Failed to export PDF report:', err);
    throw err;
  }
}
