import { Node, Edge } from 'reactflow';
import { PracticeQuestion } from '../data/practiceQuestions';

export interface DetailedMistake {
  id: string;
  category:
    | 'Entity'
    | 'Attribute'
    | 'Key Constraint'
    | 'Relationship'
    | 'Cardinality'
    | 'Participation'
    | 'Specialization'
    | 'Table Reduction';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  targetElement: string;
  whatsWrong: string;
  whyWrong: string;
  whatToChange: string;
  status: 'error' | 'warning';
}

export interface EvaluationResult {
  score: number;
  passed: boolean;
  matchedEntities: string[];
  missingEntities: string[];
  matchedAttributes: string[];
  missingAttributes: string[];
  matchedRelationships: string[];
  missingRelationships: string[];
  cardinalityIssues: string[];
  userTableCount: number;
  expectedTableCount: number;
  tableDiscrepancyReason?: string;
  mistakes: DetailedMistake[];
  feedbackItems: {
    type: 'success' | 'warning' | 'error';
    title: string;
    message: string;
  }[];
}

const normalize = (str?: string) => (str || '').trim().toLowerCase().replace(/[\s_-]+/g, '');

export function evaluateDiagram(
  nodes: Node[],
  edges: Edge[],
  question: PracticeQuestion
): EvaluationResult {
  const { groundTruth } = question;
  let totalChecks = 0;
  let passedChecks = 0;

  const matchedEntities: string[] = [];
  const missingEntities: string[] = [];
  const matchedAttributes: string[] = [];
  const missingAttributes: string[] = [];
  const matchedRelationships: string[] = [];
  const missingRelationships: string[] = [];
  const cardinalityIssues: string[] = [];
  const feedbackItems: EvaluationResult['feedbackItems'] = [];
  const mistakes: DetailedMistake[] = [];

  const entityNodes = nodes.filter((n) => n.type === 'entity');
  const attributeNodes = nodes.filter((n) => n.type === 'attribute');
  const relationshipNodes = nodes.filter((n) => n.type === 'relationship');
  const specializationNodes = nodes.filter((n) => n.type === 'specialization');

  // 1. Evaluate Entities & their attributes
  for (const expEntity of groundTruth.entities) {
    totalChecks += 2;
    const foundNode = entityNodes.find(
      (n) => normalize(n.data?.label as string) === normalize(expEntity.name)
    );

    if (foundNode) {
      passedChecks += 1;
      matchedEntities.push(expEntity.name);

      const isWeakExpected = Boolean(expEntity.isWeak);
      const isWeakFound = Boolean(foundNode.data?.isWeak);
      const isWeakMatched = isWeakExpected ? isWeakFound : !isWeakFound;

      if (isWeakMatched) {
        passedChecks += 1;
        feedbackItems.push({
          type: 'success',
          title: `Entity ${expEntity.name}`,
          message: `Correctly defined as ${expEntity.isWeak ? 'Weak Entity (Double Rect)' : 'Strong Entity'}.`,
        });
      } else {
        feedbackItems.push({
          type: 'warning',
          title: `Entity ${expEntity.name} Type Mismatch`,
          message: `Expected ${expEntity.isWeak ? 'Weak Entity (double border)' : 'Strong Entity (single border)'}.`,
        });

        mistakes.push({
          id: `mistake-ent-type-${expEntity.name}`,
          category: 'Entity',
          severity: 'critical',
          title: `Entity Type Mismatch on '${expEntity.name}'`,
          targetElement: expEntity.name,
          whatsWrong: `The entity '${expEntity.name}' is modeled as a ${
            isWeakFound ? 'Weak Entity' : 'Strong Entity'
          }, but the problem requires a ${isWeakExpected ? 'Weak Entity (Double Rectangle)' : 'Strong Entity (Single Rectangle)'}.`,
          whyWrong: isWeakExpected
            ? `'${expEntity.name}' lacks an independent primary key and depends entirely on its owner entity for existence identification. Chen notation strictly requires a double-bordered rectangle.`
            : `'${expEntity.name}' possesses its own independent primary key and can exist autonomously. It should not have a weak entity double border.`,
          whatToChange: isWeakExpected
            ? `1. Select entity node '${expEntity.name}'.\n2. In the toolbox palette, select 'Weak Entity (Double Rect)' or enable the weak entity toggle.\n3. Verify it connects to its owner entity via an Identifying Relationship (Double Diamond).`
            : `1. Select entity node '${expEntity.name}'.\n2. Set it to a standard 'Strong Entity (Single Rectangle)'.`,
          status: 'error',
        });
      }

      // Check attributes of this entity
      for (const expAttr of expEntity.attributes) {
        totalChecks += 1;
        const connectedAttrEdges = edges.filter(
          (e) => e.source === foundNode.id || e.target === foundNode.id
        );
        const connectedAttrNodeIds = connectedAttrEdges.map((e) =>
          e.source === foundNode.id ? e.target : e.source
        );
        const matchingAttrNode = attributeNodes.find(
          (an) =>
            connectedAttrNodeIds.includes(an.id) &&
            normalize(an.data?.label as string) === normalize(expAttr.name)
        );

        if (matchingAttrNode) {
          const isPrimaryCorrect = expAttr.isPrimary
            ? Boolean(matchingAttrNode.data?.isPrimary)
            : !matchingAttrNode.data?.isPrimary;
          const isMultivaluedCorrect = expAttr.isMultivalued
            ? Boolean(matchingAttrNode.data?.isMultivalued)
            : !matchingAttrNode.data?.isMultivalued;
          const isDerivedCorrect = expAttr.isDerived
            ? Boolean(matchingAttrNode.data?.isDerived)
            : !matchingAttrNode.data?.isDerived;

          if (isPrimaryCorrect && isMultivaluedCorrect && isDerivedCorrect) {
            passedChecks += 1;
            matchedAttributes.push(`${expEntity.name}.${expAttr.name}`);
            feedbackItems.push({
              type: 'success',
              title: `Attribute ${expEntity.name}.${expAttr.name}`,
              message: `Attached and typed accurately${
                expAttr.isPrimary
                  ? ' (Primary Key - Underlined)'
                  : expAttr.isMultivalued
                  ? ' (Multivalued - Double Oval)'
                  : expAttr.isDerived
                  ? ' (Derived - Dashed Oval)'
                  : ''
              }.`,
            });
          } else {
            passedChecks += 0.5;
            let mismatchDesc = '';
            let fixGuide = '';
            if (!isPrimaryCorrect) {
              mismatchDesc = expAttr.isPrimary
                ? `Expected to be marked as Primary Key (Underlined Oval).`
                : `Incorrectly marked as Primary Key.`;
              fixGuide = expAttr.isPrimary
                ? `1. Select the attribute oval '${expAttr.name}'.\n2. Toggle 'Primary Key (PK)' ON so it renders with underline notation.`
                : `1. Select the attribute oval '${expAttr.name}'.\n2. Toggle 'Primary Key (PK)' OFF.`;
            } else if (!isMultivaluedCorrect) {
              mismatchDesc = expAttr.isMultivalued
                ? `Expected to be a Multivalued Attribute (Double Oval).`
                : `Should not be a Multivalued Attribute.`;
              fixGuide = `1. Change attribute '${expAttr.name}' to ${
                expAttr.isMultivalued ? 'Multivalued (Double Oval)' : 'Standard Oval'
              }.`;
            } else if (!isDerivedCorrect) {
              mismatchDesc = expAttr.isDerived
                ? `Expected to be a Derived Attribute (Dashed Oval).`
                : `Should not be a Derived Attribute.`;
              fixGuide = `1. Change attribute '${expAttr.name}' to ${
                expAttr.isDerived ? 'Derived (Dashed Oval)' : 'Standard Oval'
              }.`;
            }

            feedbackItems.push({
              type: 'warning',
              title: `Attribute ${expEntity.name}.${expAttr.name}`,
              message: `Present, but ${mismatchDesc}`,
            });

            mistakes.push({
              id: `mistake-attr-type-${expEntity.name}-${expAttr.name}`,
              category: expAttr.isPrimary ? 'Key Constraint' : 'Attribute',
              severity: expAttr.isPrimary ? 'critical' : 'warning',
              title: `Attribute '${expAttr.name}' on '${expEntity.name}' Misconfigured`,
              targetElement: `${expEntity.name}.${expAttr.name}`,
              whatsWrong: `Attribute '${expAttr.name}' is connected to '${expEntity.name}', but ${mismatchDesc}`,
              whyWrong: expAttr.isPrimary
                ? `Primary keys enforce entity integrity in relational databases. Without explicitly marking '${expAttr.name}' as PK, the relation cannot guarantee tuple uniqueness.`
                : expAttr.isMultivalued
                ? `Multivalued attributes violate 1NF atomic domain rules and must be designated with double ovals so they can be decomposed into auxiliary tables.`
                : expAttr.isDerived
                ? `Derived attributes are calculated dynamically (e.g., Age computed from DOB) and must be marked with dashed borders to signify they are omitted from physical storage.`
                : `Attribute notation must accurately reflect its domain properties.`,
              whatToChange: fixGuide,
              status: 'warning',
            });
          }
        } else {
          missingAttributes.push(`${expEntity.name}.${expAttr.name}`);
          feedbackItems.push({
            type: 'error',
            title: `Missing Attribute`,
            message: `Entity ${expEntity.name} is missing expected attribute '${expAttr.name}'.`,
          });

          mistakes.push({
            id: `mistake-missing-attr-${expEntity.name}-${expAttr.name}`,
            category: expAttr.isPrimary ? 'Key Constraint' : 'Attribute',
            severity: expAttr.isPrimary ? 'critical' : 'warning',
            title: `Missing Attribute '${expAttr.name}' on '${expEntity.name}'`,
            targetElement: expEntity.name,
            whatsWrong: `The entity '${expEntity.name}' does not have the required attribute '${expAttr.name}' connected to it.`,
            whyWrong: expAttr.isPrimary
              ? `'${expAttr.name}' is the primary identifier for '${expEntity.name}'. Relational mapping cannot proceed without a valid key.`
              : `All domain attributes outlined in the examination prompt must be represented to avoid schema information loss.`,
            whatToChange: `1. From the toolbox palette, add an Attribute oval labeled '${expAttr.name}'${
              expAttr.isPrimary ? ' (and mark as Primary Key)' : ''
            }.\n2. Connect it with a line to entity rectangle '${expEntity.name}'.`,
            status: 'error',
          });
        }
      }
    } else {
      missingEntities.push(expEntity.name);
      feedbackItems.push({
        type: 'error',
        title: `Missing Entity`,
        message: `Expected entity '${expEntity.name}' not found on the canvas.`,
      });

      mistakes.push({
        id: `mistake-missing-ent-${expEntity.name}`,
        category: 'Entity',
        severity: 'critical',
        title: `Missing Entity '${expEntity.name}'`,
        targetElement: expEntity.name,
        whatsWrong: `The entire entity rectangle '${expEntity.name}' is missing from your ER diagram.`,
        whyWrong: `In ER modeling, '${expEntity.name}' is a primary table relation required by the problem statement. Without it, associated attributes and relationships cannot be anchored.`,
        whatToChange: `1. Click '+ Add Strong Entity' (or Weak Entity if applicable) in the top palette.\n2. Double-click to rename it to '${expEntity.name}'.\n3. Attach its attributes (${expEntity.attributes.map((a) => a.name).join(', ')}).`,
        status: 'error',
      });

      for (const expAttr of expEntity.attributes) {
        totalChecks += 1;
        missingAttributes.push(`${expEntity.name}.${expAttr.name}`);
      }
    }
  }

  // 2. Evaluate Relationships & Connections
  for (const expRel of groundTruth.relationships) {
    totalChecks += 2;
    const foundRelNode = relationshipNodes.find(
      (n) => normalize(n.data?.label as string) === normalize(expRel.name)
    );

    if (foundRelNode) {
      passedChecks += 1;
      matchedRelationships.push(expRel.name);

      const isIdentifyingExpected = Boolean(expRel.isIdentifying);
      const isIdentifyingFound = Boolean(foundRelNode.data?.isIdentifying);
      if (isIdentifyingExpected && !isIdentifyingFound) {
        mistakes.push({
          id: `mistake-rel-identifying-${expRel.name}`,
          category: 'Relationship',
          severity: 'critical',
          title: `Relationship '${expRel.name}' Should Be Identifying`,
          targetElement: expRel.name,
          whatsWrong: `Relationship '${expRel.name}' is drawn as a standard single diamond instead of an Identifying Relationship (Double Diamond).`,
          whyWrong: `Identifying relationships connect weak entities to their owner strong entities. Chen ER notation mandates a double diamond to signify owner-based identification.`,
          whatToChange: `1. Select relationship diamond '${expRel.name}'.\n2. Toggle 'Identifying Relationship (Double Diamond)' ON.`,
          status: 'error',
        });
      }

      if (expRel.attributes && expRel.attributes.length > 0) {
        for (const expAttr of expRel.attributes) {
          totalChecks += 1;
          const connectedAttrEdges = edges.filter(
            (e) => e.source === foundRelNode.id || e.target === foundRelNode.id
          );
          const connectedAttrNodeIds = connectedAttrEdges.map((e) =>
            e.source === foundRelNode.id ? e.target : e.source
          );
          const matchingAttrNode = attributeNodes.find(
            (an) =>
              connectedAttrNodeIds.includes(an.id) &&
              normalize(an.data?.label as string) === normalize(expAttr.name)
          );

          if (matchingAttrNode) {
            passedChecks += 1;
            matchedAttributes.push(`${expRel.name}.${expAttr.name}`);
            feedbackItems.push({
              type: 'success',
              title: `Relationship Attribute`,
              message: `Attribute '${expAttr.name}' correctly attached to relationship ${expRel.name}.`,
            });
          } else {
            missingAttributes.push(`${expRel.name}.${expAttr.name}`);
            feedbackItems.push({
              type: 'error',
              title: `Missing Attribute on Relationship`,
              message: `Expected attribute '${expAttr.name}' attached to relationship ${expRel.name}.`,
            });

            mistakes.push({
              id: `mistake-rel-attr-${expRel.name}-${expAttr.name}`,
              category: 'Attribute',
              severity: 'warning',
              title: `Missing Descriptive Attribute '${expAttr.name}' on Relationship '${expRel.name}'`,
              targetElement: expRel.name,
              whatsWrong: `Descriptive attribute '${expAttr.name}' is not attached to relationship diamond '${expRel.name}'.`,
              whyWrong: `Relationships in M:N or 1:N connections can have descriptive attributes that pertain specifically to the association rather than individual entities (e.g. AccessDate, RoyaltyPercent, SinceDate).`,
              whatToChange: `1. Add an Attribute oval '${expAttr.name}'.\n2. Connect it with a line directly to relationship diamond '${expRel.name}'.`,
              status: 'error',
            });
          }
        }
      }

      for (const expConn of expRel.connections) {
        totalChecks += 1;
        const targetEntityNode = entityNodes.find(
          (en) => normalize(en.data?.label as string) === normalize(expConn.entity)
        );

        if (targetEntityNode) {
          const connectingEdge = edges.find(
            (e) =>
              (e.source === foundRelNode.id && e.target === targetEntityNode.id) ||
              (e.target === foundRelNode.id && e.source === targetEntityNode.id)
          );

          if (connectingEdge) {
            const edgeCard =
              (connectingEdge.data?.cardinality as string) ||
              (connectingEdge.label as string) ||
              '';
            const normEdgeCard = normalize(edgeCard);
            const normExpCard = normalize(expConn.cardinality);

            const isCardMatch =
              normEdgeCard === normExpCard ||
              (normExpCard === 'n' &&
                (normEdgeCard === 'm' ||
                  normEdgeCard === 'n' ||
                  normEdgeCard === 'p' ||
                  normEdgeCard === '(0,n)' ||
                  normEdgeCard === '(1,n)')) ||
              (normExpCard === '1' &&
                (normEdgeCard === '1' || normEdgeCard === '(0,1)' || normEdgeCard === '(1,1)')) ||
              (normExpCard === 'm' &&
                (normEdgeCard === 'm' || normEdgeCard === 'n' || normEdgeCard === 'p'));

            if (isCardMatch) {
              passedChecks += 1;
              feedbackItems.push({
                type: 'success',
                title: `Cardinality ${expRel.name} - ${expConn.entity}`,
                message: `Connection correctly set with cardinality '${expConn.cardinality}'.`,
              });
            } else {
              passedChecks += 0.5;
              cardinalityIssues.push(
                `${expRel.name} <-> ${expConn.entity} (Expected: ${expConn.cardinality}, Found: ${
                  edgeCard || 'None'
                })`
              );
              feedbackItems.push({
                type: 'warning',
                title: `Cardinality Mismatch`,
                message: `Connection between ${expRel.name} and ${expConn.entity} has '${
                  edgeCard || 'unlabeled'
                }', expected '${expConn.cardinality}'.`,
              });

              mistakes.push({
                id: `mistake-card-${expRel.name}-${expConn.entity}`,
                category: 'Cardinality',
                severity: 'critical',
                title: `Cardinality Mismatch on '${expRel.name}' - '${expConn.entity}'`,
                targetElement: `${expRel.name} - ${expConn.entity}`,
                whatsWrong: `The connection line between '${expRel.name}' and '${
                  expConn.entity
                }' is labeled '${edgeCard || 'None'}', but the correct cardinality is '${
                  expConn.cardinality
                }'.`,
                whyWrong: `Cardinality ratios (1:1, 1:N, M:N) dictate foreign key placement during relational schema translation. An incorrect cardinality directly causes improper table mergers or missing junction tables.`,
                whatToChange: `1. Click on the line connecting '${expRel.name}' and '${expConn.entity}'.\n2. In the floating cardinality bar at the top, select '${expConn.cardinality}'.`,
                status: 'error',
              });
            }

            // Check participation constraint if specified
            if (expConn.isTotal) {
              const isEdgeTotal = Boolean(connectingEdge.data?.isTotal);
              if (!isEdgeTotal) {
                mistakes.push({
                  id: `mistake-participation-${expRel.name}-${expConn.entity}`,
                  category: 'Participation',
                  severity: 'warning',
                  title: `Missing Total Participation on '${expConn.entity}'`,
                  targetElement: `${expRel.name} - ${expConn.entity}`,
                  whatsWrong: `The connection line between '${expRel.name}' and '${expConn.entity}' has partial participation (single line), but total participation is required.`,
                  whyWrong: `Total participation (double line) indicates mandatory existence: every instance of '${expConn.entity}' must participate in the '${expRel.name}' relationship. This allows foreign key merging with NOT NULL constraints.`,
                  whatToChange: `1. Click on the edge line connecting '${expRel.name}' and '${expConn.entity}'.\n2. In the floating editor bar, click 'Total: ON' to activate double-line notation.`,
                  status: 'warning',
                });
              }
            }
          } else {
            feedbackItems.push({
              type: 'error',
              title: `Missing Link`,
              message: `Relationship ${expRel.name} is not connected to entity ${expConn.entity}.`,
            });

            mistakes.push({
              id: `mistake-missing-link-${expRel.name}-${expConn.entity}`,
              category: 'Relationship',
              severity: 'critical',
              title: `Missing Connection between '${expRel.name}' and '${expConn.entity}'`,
              targetElement: expRel.name,
              whatsWrong: `Relationship diamond '${expRel.name}' is not connected to entity rectangle '${expConn.entity}'.`,
              whyWrong: `A relationship must connect its participating entities to establish associations and cardinalities.`,
              whatToChange: `1. Hover over the handle of '${expRel.name}' and drag a connection line to '${expConn.entity}'.\n2. Select cardinality '${expConn.cardinality}' on the newly created line.`,
              status: 'error',
            });
          }
        }
      }
    } else {
      missingRelationships.push(expRel.name);
      feedbackItems.push({
        type: 'error',
        title: `Missing Relationship`,
        message: `Expected relationship diamond '${expRel.name}' is missing on the canvas.`,
      });

      mistakes.push({
        id: `mistake-missing-rel-${expRel.name}`,
        category: 'Relationship',
        severity: 'critical',
        title: `Missing Relationship '${expRel.name}'`,
        targetElement: expRel.name,
        whatsWrong: `The relationship diamond '${expRel.name}' has not been added to the canvas.`,
        whyWrong: `The problem statement specifies an association '${expRel.name}'. In Chen notation, all entity associations require explicit relationship diamonds.`,
        whatToChange: `1. In the top toolbox palette, click 'Relationship' (or 'Identifying Rel.' if weak).\n2. Rename it to '${expRel.name}'.\n3. Connect it to ${expRel.connections.map((c) => c.entity).join(' and ')}.`,
        status: 'error',
      });

      for (const expConn of expRel.connections) {
        totalChecks += 1;
      }
    }
  }

  // 3. Evaluate EER Specializations if present
  if (groundTruth.specializations && groundTruth.specializations.length > 0) {
    for (const expSpec of groundTruth.specializations) {
      totalChecks += 2;
      const superNode = entityNodes.find(
        (en) => normalize(en.data?.label as string) === normalize(expSpec.superclass)
      );

      const specNode = specializationNodes.find(
        (sn) => (sn.data?.specType || 'disjoint') === expSpec.specType
      );

      if (superNode && specNode) {
        passedChecks += 2;
        feedbackItems.push({
          type: 'success',
          title: `EER Specialization Hierarchy`,
          message: `Superclass ${expSpec.superclass} linked with ${expSpec.specType} constraint (${
            specNode.data?.label || 'd'
          }).`,
        });
      } else {
        feedbackItems.push({
          type: 'warning',
          title: `EER Specialization Constraint`,
          message: `Ensure superclass ${expSpec.superclass} connects through an ISA specialization circle (${expSpec.specType.charAt(
            0
          )}).`,
        });

        mistakes.push({
          id: `mistake-spec-${expSpec.superclass}`,
          category: 'Specialization',
          severity: 'critical',
          title: `Missing or Incorrect Specialization Hierarchy on '${expSpec.superclass}'`,
          targetElement: expSpec.superclass,
          whatsWrong: `The EER specialization hierarchy from superclass '${expSpec.superclass}' to subclasses (${expSpec.subclasses.join(
            ', '
          )}) with constraint (${expSpec.specType === 'overlapping' ? 'o' : 'd'}) is incomplete.`,
          whyWrong: `EER modeling uses an ISA circle with 'd' (disjoint) or 'o' (overlapping) to represent subclass inheritance. Subclasses inherit all superclass attributes without duplicating them.`,
          whatToChange: `1. Add an EER Specialization circle with label '${
            expSpec.specType === 'overlapping' ? 'o' : 'd'
          }'.\n2. Connect superclass '${expSpec.superclass}' to the circle.\n3. Connect the circle to each subclass (${expSpec.subclasses.join(
            ', '
          )}).`,
          status: 'error',
        });
      }
    }
  }

  // 4. Calculate Relational Tables & Check Reductions
  let calculatedTableCount = 0;
  for (const en of entityNodes) {
    if (!en.data?.isSubclass) {
      calculatedTableCount += 1;
    }
  }
  for (const rn of relationshipNodes) {
    const relEdges = edges.filter((e) => e.source === rn.id || e.target === rn.id);
    const hasManySide = relEdges.some((e) => {
      const card = normalize((e.data?.cardinality as string) || (e.label as string));
      return card === 'n' || card === 'm' || card === 'p' || card.includes('n') || card.includes('m');
    });
    const isManyToMany =
      relEdges.filter((e) => {
        const card = normalize((e.data?.cardinality as string) || (e.label as string));
        return card === 'n' || card === 'm' || card === 'p' || card.includes('n') || card.includes('m');
      }).length >= 2;

    if (isManyToMany || !hasManySide) {
      calculatedTableCount += 1;
    }
  }

  const userTableCount = calculatedTableCount || 1;
  const expectedTableCount = question.expectedTablesCount;

  if (userTableCount !== expectedTableCount) {
    mistakes.push({
      id: 'mistake-table-count',
      category: 'Table Reduction',
      severity: 'warning',
      title: `Relational Table Count Discrepancy (Drawn: ${userTableCount} vs Expected: ${expectedTableCount})`,
      targetElement: 'Relational Schema',
      whatsWrong: `The relational mapping from your ER diagram yields ${userTableCount} tables in 1NF, whereas the optimal minimal schema requires exactly ${expectedTableCount} tables.`,
      whyWrong: `Relational schema reduction rules allow collapsing 1:1 or 1:N relationships with total participation into the participating entity table, while M:N relationships strictly require a separate junction table.`,
      whatToChange: `Review the problem's relational reduction explanation: "${question.expectedTablesExplanation}"\nEnsure total participation and cardinalities are configured properly.`,
      status: 'warning',
    });
  }

  const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
  const passed = score >= 75 && mistakes.filter((m) => m.severity === 'critical').length === 0;

  return {
    score,
    passed,
    matchedEntities,
    missingEntities,
    matchedAttributes,
    missingAttributes,
    matchedRelationships,
    missingRelationships,
    cardinalityIssues,
    userTableCount,
    expectedTableCount,
    tableDiscrepancyReason: question.expectedTablesExplanation,
    mistakes,
    feedbackItems,
  };
}
