export const sanitizeName = (str) =>
  str.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase() || 'unnamed';

export const generateSqlSchema = (nodes, edges) => {
  const entities = nodes.filter((n) => n.type === 'entity');
  const attributes = nodes.filter((n) => n.type === 'attribute');
  const relationships = nodes.filter((n) => n.type === 'relationship');
  const specializations = nodes.filter((n) => n.type === 'specialization');

  if (entities.length === 0) {
    return '-- No entities detected in diagram.';
  }

  const isEer = specializations.length > 0 || entities.some((e) => e.data?.isSuperclass || e.data?.isSubclass);

  let sql = `-- ========================================================\n`;
  sql += `-- ${isEer ? 'EER (Enhanced Entity-Relationship)' : 'ER (Entity-Relationship)'} Relational Schema DDL\n`;
  sql += `-- Generated: ${new Date().toISOString()}\n`;
  sql += `-- ========================================================\n\n`;
  sql += `CREATE SCHEMA IF NOT EXISTS ${isEer ? 'eer_schema' : 'er_schema'};\n\n`;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // 1. Map EER Specialization Hierarchies (Superclass <-> Specialization Circle <-> Subclasses)
  const superclassToSubclasses = new Map();
  const subclassToSuperclass = new Map();

  specializations.forEach((spec) => {
    const connectedEdges = edges.filter((e) => e.source === spec.id || e.target === spec.id);
    let superclassNode = null;
    const subclassNodes = [];

    connectedEdges.forEach((edge) => {
      const otherId = edge.source === spec.id ? edge.target : edge.source;
      const other = nodeMap.get(otherId);
      if (other?.type === 'entity') {
        if (other.data?.isSuperclass) {
          superclassNode = other;
        } else if (other.data?.isSubclass) {
          subclassNodes.push(other);
        } else {
          // If no explicit flag, determine by direction or edge source
          if (edge.source === other.id) {
            superclassNode = other;
          } else {
            subclassNodes.push(other);
          }
        }
      }
    });

    if (superclassNode) {
      if (!superclassToSubclasses.has(superclassNode.id)) {
        superclassToSubclasses.set(superclassNode.id, []);
      }
      subclassNodes.forEach((sub) => {
        superclassToSubclasses.get(superclassNode.id).push({
          subclass: sub,
          specNode: spec,
        });
        subclassToSuperclass.set(sub.id, superclassNode);
      });
    }
  });

  // 2. Identify Weak Entities and their Identifying Relationships
  const weakEntityOwnerMap = new Map();
  relationships.filter((r) => r.data?.isIdentifying).forEach((identRel) => {
    const connectedEdges = edges.filter((e) => e.source === identRel.id || e.target === identRel.id);
    let ownerNode = null;
    let weakNode = null;

    connectedEdges.forEach((edge) => {
      const otherId = edge.source === identRel.id ? edge.target : edge.source;
      const other = nodeMap.get(otherId);
      if (other?.type === 'entity') {
        if (other.data?.isWeak) {
          weakNode = other;
        } else {
          ownerNode = other;
        }
      }
    });

    if (weakNode && ownerNode) {
      weakEntityOwnerMap.set(weakNode.id, ownerNode);
    }
  });

  // Track entity primary key column names
  const entityPkMap = new Map();

  // Helper to find connected attributes for an entity
  const getEntityAttributes = (entityId) => {
    const connectedAttrIds = new Set();
    edges.forEach((edge) => {
      if (edge.source === entityId) connectedAttrIds.add(edge.target);
      if (edge.target === entityId) connectedAttrIds.add(edge.source);
    });
    return attributes.filter((a) => connectedAttrIds.has(a.id));
  };

  // Generate Tables for Entities
  entities.forEach((entity) => {
    const tableName = sanitizeName(entity.data?.label || 'entity');
    const entityAttrs = getEntityAttributes(entity.id);
    const isSubclass = subclassToSuperclass.has(entity.id);
    const parentSuperclass = subclassToSuperclass.get(entity.id);
    const isWeak = Boolean(entity.data?.isWeak) || weakEntityOwnerMap.has(entity.id);
    const ownerEntity = weakEntityOwnerMap.get(entity.id);

    const pkAttrs = entityAttrs.filter((a) => a.data?.isPrimary || a.data?.isKey);
    const partialKeyAttrs = entityAttrs.filter((a) => a.data?.isPartialKey);
    const normalAttrs = entityAttrs.filter((a) => !a.data?.isPrimary && !a.data?.isKey && !a.data?.isMultivalued && !a.data?.isDerived);
    const multivaluedAttrs = entityAttrs.filter((a) => a.data?.isMultivalued);

    let defaultPkName = `${tableName}_id`;
    if (pkAttrs.length > 0) {
      defaultPkName = sanitizeName(pkAttrs[0].data?.label || `${tableName}_id`);
    }
    entityPkMap.set(entity.id, defaultPkName);

    sql += `-- Table: ${entity.data?.label || tableName}${isSubclass ? ` (Subclass of ${parentSuperclass?.data?.label})` : isWeak ? ' (Weak Entity)' : ''}\n`;
    sql += `CREATE TABLE ${tableName} (\n`;

    const colDefs = [];
    const seenCol = new Set();

    if (isSubclass && parentSuperclass) {
      const superTableName = sanitizeName(parentSuperclass.data?.label || 'superclass');
      const superPkName = entityPkMap.get(parentSuperclass.id) || `${superTableName}_id`;
      colDefs.push(`  ${superPkName} INT PRIMARY KEY REFERENCES ${superTableName}(${superPkName}) ON DELETE CASCADE`);
      seenCol.add(superPkName);
    } else if (isWeak && ownerEntity) {
      const ownerTableName = sanitizeName(ownerEntity.data?.label || 'owner');
      const ownerPkName = entityPkMap.get(ownerEntity.id) || `${ownerTableName}_id`;
      colDefs.push(`  ${ownerPkName} INT NOT NULL REFERENCES ${ownerTableName}(${ownerPkName}) ON DELETE CASCADE`);
      seenCol.add(ownerPkName);

      const partialPkName = partialKeyAttrs.length > 0 ? sanitizeName(partialKeyAttrs[0].data?.label) : `${tableName}_no`;
      colDefs.push(`  ${partialPkName} VARCHAR(100) NOT NULL`);
      seenCol.add(partialPkName);

      colDefs.push(`  PRIMARY KEY (${ownerPkName}, ${partialPkName})`);
    } else {
      if (pkAttrs.length > 0) {
        pkAttrs.forEach((pk) => {
          const colName = sanitizeName(pk.data?.label || 'id');
          colDefs.push(`  ${colName} SERIAL PRIMARY KEY`);
          seenCol.add(colName);
        });
      } else {
        colDefs.push(`  ${defaultPkName} SERIAL PRIMARY KEY`);
        seenCol.add(defaultPkName);
      }
    }

    // Add regular attributes
    normalAttrs.forEach((attr) => {
      let colName = sanitizeName(attr.data?.label || 'attr');
      if (seenCol.has(colName)) {
        let i = 2;
        while (seenCol.has(`${colName}_${i}`)) i++;
        colName = `${colName}_${i}`;
      }
      seenCol.add(colName);
      colDefs.push(`  ${colName} VARCHAR(255) NOT NULL`);
    });

    if (normalAttrs.length === 0 && (!isSubclass || colDefs.length === 1)) {
      if (!seenCol.has('description')) {
        colDefs.push(`  description VARCHAR(255)`);
      }
    }

    sql += colDefs.join(',\n');
    sql += '\n);\n\n';

    // Handle Multivalued Attributes by creating 1:N child tables
    multivaluedAttrs.forEach((mvAttr) => {
      const mvAttrName = sanitizeName(mvAttr.data?.label || 'item');
      const mvTableName = `${tableName}_${mvAttrName}`;
      const parentPk = entityPkMap.get(entity.id) || `${tableName}_id`;

      sql += `-- Multivalued Attribute Table for ${mvAttr.data?.label}\n`;
      sql += `CREATE TABLE ${mvTableName} (\n`;
      sql += `  ${parentPk} INT NOT NULL REFERENCES ${tableName}(${parentPk}) ON DELETE CASCADE,\n`;
      sql += `  ${mvAttrName}_value VARCHAR(255) NOT NULL,\n`;
      sql += `  PRIMARY KEY (${parentPk}, ${mvAttrName}_value)\n`;
      sql += `);\n\n`;
    });
  });

  // Generate Tables for Standard Relationships (e.g. M:N or associative relationships)
  relationships.filter((r) => !r.data?.isIdentifying).forEach((rel) => {
    const relName = sanitizeName(rel.data?.label || 'relationship');
    const connectedEdges = edges.filter((e) => e.source === rel.id || e.target === rel.id);
    const connectedEntityNodes = [];

    connectedEdges.forEach((edge) => {
      const otherId = edge.source === rel.id ? edge.target : edge.source;
      const otherNode = nodeMap.get(otherId);
      if (otherNode?.type === 'entity') {
        connectedEntityNodes.push({
          entity: otherNode,
          cardinality: edge.label || 'N',
        });
      }
    });

    if (connectedEntityNodes.length >= 2) {
      sql += `-- Relationship Table: ${rel.data?.label || relName}\n`;
      sql += `CREATE TABLE ${relName} (\n`;
      const seen = new Map();
      const colDefs = [];
      const pkCols = [];

      connectedEntityNodes.forEach((item) => {
        const ent = item.entity;
        const base = sanitizeName(ent.data?.label || 'entity');
        const count = (seen.get(base) || 0) + 1;
        seen.set(base, count);
        const pkColName = entityPkMap.get(ent.id) || `${base}_id`;
        const colName = count > 1 ? `${base}_${count}_id` : `${base}_id`;
        colDefs.push(`  ${colName} INT NOT NULL REFERENCES ${base}(${pkColName}) ON DELETE CASCADE`);
        pkCols.push(colName);
      });

      // Include attributes belonging to relationship if any
      const relAttrs = getEntityAttributes(rel.id);
      relAttrs.forEach((attr) => {
        const attrCol = sanitizeName(attr.data?.label || 'detail');
        colDefs.push(`  ${attrCol} VARCHAR(255)`);
      });

      colDefs.push(`  PRIMARY KEY (${pkCols.join(', ')})`);
      sql += colDefs.join(',\n');
      sql += '\n);\n\n';
    }
  });

  return sql;
};
