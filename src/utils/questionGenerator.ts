import { PracticeQuestion } from '../data/practiceQuestions';
import { generateWithModelFallback } from './geminiClient.js';

export interface GenerateQuestionOptions {
  exam: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  customScenario?: string;
  topicNotes?: string;
}

export const PRESET_SCENARIOS = [
  {
    title: 'Hospital Surgery & Anesthesiology Multi-Entity Management',
    exam: 'GATE CS',
    category: 'Table Reduction',
    difficulty: 'Hard' as const,
    prompt:
      'A multi-specialty hospital management database models Surgeon (PK: SurgeonID, Name, Specialty), Patient (PK: PatientID, Name, BloodGroup), and OperatingRoom (PK: RoomNo, Floor). A ternary/binary scheduling relationship Surgery connects Surgeon (M), Patient (N), and Room with descriptive attribute SurgeryDate. Weak entity Prescription (partial key RxNo, DateIssued) is identified by Patient via Prescribes (1:N, total). Calculate minimum 1NF tables.',
  },
  {
    title: 'Airline Flight Operations & Aircraft Subclass Specialization',
    exam: 'UGC NET CS',
    category: 'EER Specialization',
    difficulty: 'Medium' as const,
    prompt:
      'An international airline tracks FleetAircraft (PK: TailNumber, Model, Year). Aircraft is specialized into CargoPlane (PayloadTons, CargoDoorType) and PassengerPlane (MaxSeats, EntertainmentSystem) via disjoint total specialization (d). A relationship Operates connects PassengerPlane (1) to Flight (N) with total participation of Flight. Model the EER hierarchy and relational tables.',
  },
  {
    title: 'University Research Grant & Faculty-Student Collaboration',
    exam: 'ISRO CS',
    category: 'Weak Entity',
    difficulty: 'Medium' as const,
    prompt:
      'A scientific university database has Professor (PK: ProfID, ProfName, Department) and Grant (PK: GrantNo, Title, Amount). Weak entity Milestone (partial key MilestoneNum, Deadline) is owned by Grant via HasMilestone (1:N, total). A relationship Leads links Professor (1) to Grant (N) with total participation on Grant. Model the ER schema and calculate 1NF relations.',
  },
  {
    title: 'Fintech Multi-Currency Wallet & Recursive Referral Hierarchy',
    exam: 'GATE CS',
    category: 'Classical ER',
    difficulty: 'Hard' as const,
    prompt:
      'A decentralized fintech app represents User (PK: UserID, UserName, Country). A recursive relationship RefersOn connects User (1) to User (N) representing referral trees with descriptive attribute RewardBonus. Weak entity TransactionLog (partial key TxnSeq, Amount, TxnTime) belongs to User via LogsTxn (1:N, total). Determine the minimal schema without redundancy.',
  },
  {
    title: 'E-Commerce Warehouse Logistics & Multi-Vendor Inventory',
    exam: 'GATE CS',
    category: 'Table Reduction',
    difficulty: 'Medium' as const,
    prompt:
      'An e-commerce marketplace models Vendor (PK: VendorID, CompanyName), Warehouse (PK: WarehouseCode, City, Capacity), and Item (PK: SKU, ItemTitle, Price). A relationship Stocks connects Warehouse (M) and Item (N) with descriptive attribute QuantityOnHand. Item has multivalued attribute CategoryTags (double oval). Calculate minimal tables in 1NF.',
  },
];

// Rich Procedural Question Bank for instant fallback
const PROCEDURAL_QUESTION_TEMPLATES: PracticeQuestion[] = [
  {
    id: 'gen-hospital-surgery-scheduling',
    exam: 'GATE CS',
    year: '2025 Model Exam',
    paper: 'Computer Science & Information Technology',
    category: 'Table Reduction',
    title: 'Hospital Surgery Scheduling & Weak Prescription Hierarchy',
    difficulty: 'Hard',
    statement:
      'A multi-specialty hospital tracks Doctors (PK: DoctorID, Name, Department) and Patients (PK: PatientID, PatientName, Age). A relationship Treats links Doctor (1) to Patient (N) with total participation of Patient. A weak entity Prescription has partial discriminator RxNumber and attribute DateIssued, identified by Patient through identifying relationship Prescribes (1:N, total). Model this system and compute the minimum number of relational tables in 1NF.',
    expectedTablesCount: 3,
    expectedTablesExplanation:
      '1) Doctor(DoctorID, Name, Department). 2) Patient(PatientID, PatientName, Age, DoctorID) absorbs the 1:N total relationship Treats. 3) Prescription(PatientID, RxNumber, DateIssued) with composite PK (PatientID, RxNumber). Total minimum tables = 3.',
    constraintsSummary: [
      'Strong Entity Doctor with PK DoctorID, Name, Department',
      'Strong Entity Patient with PK PatientID, PatientName, Age',
      'Relationship Treats (1:N) with Total Participation on Patient',
      'Weak Entity Prescription with Partial Key RxNumber and DateIssued',
      'Identifying Relationship Prescribes (1:N, Total) linking Patient to Prescription',
    ],
    hints: [
      'Create Doctor (PK: DoctorID) and Patient (PK: PatientID).',
      'Connect Doctor (1) to Patient (N, Total) via Treats.',
      'Create Weak Entity Prescription with partial key RxNumber and connect from Patient via identifying relationship Prescribes (1:N, Total).',
    ],
    explanation:
      'Weak entity relations always inherit the primary key of their owner entity as part of their composite primary key. Total participation in 1:N enables direct foreign key merging.',
    groundTruth: {
      entities: [
        {
          name: 'Doctor',
          attributes: [
            { name: 'DoctorID', isPrimary: true },
            { name: 'Name' },
            { name: 'Department' },
          ],
        },
        {
          name: 'Patient',
          attributes: [
            { name: 'PatientID', isPrimary: true },
            { name: 'PatientName' },
            { name: 'Age' },
          ],
        },
        {
          name: 'Prescription',
          isWeak: true,
          attributes: [
            { name: 'RxNumber', isPrimary: true },
            { name: 'DateIssued' },
          ],
        },
      ],
      relationships: [
        {
          name: 'Treats',
          connections: [
            { entity: 'Doctor', cardinality: '1' },
            { entity: 'Patient', cardinality: 'N', isTotal: true },
          ],
        },
        {
          name: 'Prescribes',
          isIdentifying: true,
          connections: [
            { entity: 'Patient', cardinality: '1' },
            { entity: 'Prescription', cardinality: 'N', isTotal: true },
          ],
        },
      ],
    },
  },
  {
    id: 'gen-aviation-fleet-hierarchy',
    exam: 'UGC NET CS',
    year: '2024 Practice Exam',
    paper: 'Computer Science Paper II',
    category: 'EER Specialization',
    title: 'Aviation Fleet Disjoint Specialization & Flight Operations',
    difficulty: 'Medium',
    statement:
      'An airline catalog represents Aircraft as a superclass with PK TailNumber, Model, and ManufactureYear. Aircraft is specialized into two mutually exclusive subclasses: CargoAircraft (attribute MaxPayloadTons) and PassengerAircraft (attribute PassengerCapacity) under a Total Disjoint Specialization constraint (d). Entity Flight (PK: FlightNumber, Destination) is operated by PassengerAircraft with 1:N cardinality (one aircraft operates N flights) and total participation on Flight. Construct the EER diagram.',
    expectedTablesCount: 3,
    expectedTablesExplanation:
      '1) Aircraft(TailNumber, Model, ManufactureYear). 2) CargoAircraft(TailNumber, MaxPayloadTons). 3) PassengerAircraft(TailNumber, PassengerCapacity). 4) Flight(FlightNumber, Destination, TailNumber) merges the 1:N total participation. Total tables = 4 in general EER mapping, or 3 if merged.',
    constraintsSummary: [
      'Superclass Aircraft with PK TailNumber, Model, ManufactureYear',
      'Total Disjoint Specialization circle (d, double line) into CargoAircraft and PassengerAircraft',
      'Entity Flight with PK FlightNumber and Destination',
      'Relationship Operates linking PassengerAircraft (1) to Flight (N, Total)',
    ],
    hints: [
      'Add Superclass Aircraft with PK TailNumber.',
      'Add Specialization node (d) with Total Participation ON.',
      'Add Subclasses CargoAircraft (MaxPayloadTons) and PassengerAircraft (PassengerCapacity).',
      'Connect PassengerAircraft to Flight (1:N, Total) via Operates.',
    ],
    explanation:
      'In disjoint specialization, instances belong to exactly one subclass. Flight references the specific subclass PassengerAircraft via foreign key.',
    groundTruth: {
      entities: [
        {
          name: 'Aircraft',
          isSuperclass: true,
          attributes: [
            { name: 'TailNumber', isPrimary: true },
            { name: 'Model' },
            { name: 'ManufactureYear' },
          ],
        },
        {
          name: 'CargoAircraft',
          isSubclass: true,
          attributes: [{ name: 'MaxPayloadTons' }],
        },
        {
          name: 'PassengerAircraft',
          isSubclass: true,
          attributes: [{ name: 'PassengerCapacity' }],
        },
        {
          name: 'Flight',
          attributes: [
            { name: 'FlightNumber', isPrimary: true },
            { name: 'Destination' },
          ],
        },
      ],
      specializations: [
        {
          superclass: 'Aircraft',
          subclasses: ['CargoAircraft', 'PassengerAircraft'],
          specType: 'disjoint',
          isTotal: true,
        },
      ],
      relationships: [
        {
          name: 'Operates',
          connections: [
            { entity: 'PassengerAircraft', cardinality: '1' },
            { entity: 'Flight', cardinality: 'N', isTotal: true },
          ],
        },
      ],
    },
  },
  {
    id: 'gen-ecommerce-multivalued-inventory',
    exam: 'ISRO CS',
    year: '2024 Exam Series',
    paper: "Scientist/Engineer 'SC'",
    category: 'Table Reduction',
    title: 'E-Commerce Warehouse Inventory & Multivalued Tags Decomposition',
    difficulty: 'Medium',
    statement:
      'An online retail logistics system tracks Warehouse (PK: WarehouseID, City) and Product (PK: ProductID, Title, Price, Multivalued attribute CategoryTags). A relationship Stores connects Warehouse (M) and Product (N) with descriptive attribute QuantityInStock. Construct the ER diagram in Chen notation and determine the minimum number of relational tables needed in 1NF.',
    expectedTablesCount: 4,
    expectedTablesExplanation:
      '1) Warehouse(WarehouseID, City). 2) Product(ProductID, Title, Price). 3) Product_CategoryTags(ProductID, CategoryTags) for multivalued attribute. 4) Stores(WarehouseID, ProductID, QuantityInStock) junction table for M:N relationship. Total minimum tables = 4.',
    constraintsSummary: [
      'Strong Entity Warehouse with PK WarehouseID and City',
      'Strong Entity Product with PK ProductID, Title, Price, and Multivalued CategoryTags (double oval)',
      'Relationship Stores (M:N) with descriptive attribute QuantityInStock',
    ],
    hints: [
      'Add Warehouse (WarehouseID PK, City).',
      'Add Product (ProductID PK, Title, Price, Multivalued CategoryTags).',
      'Add relationship Stores with attribute QuantityInStock connecting Warehouse (M) and Product (N).',
    ],
    explanation:
      'Multivalued attributes violate 1NF atomic value constraints and must be decomposed into a separate table. M:N relationships require their own cross-reference table.',
    groundTruth: {
      entities: [
        {
          name: 'Warehouse',
          attributes: [
            { name: 'WarehouseID', isPrimary: true },
            { name: 'City' },
          ],
        },
        {
          name: 'Product',
          attributes: [
            { name: 'ProductID', isPrimary: true },
            { name: 'Title' },
            { name: 'Price' },
            { name: 'CategoryTags', isMultivalued: true },
          ],
        },
      ],
      relationships: [
        {
          name: 'Stores',
          attributes: [{ name: 'QuantityInStock' }],
          connections: [
            { entity: 'Warehouse', cardinality: 'M' },
            { entity: 'Product', cardinality: 'N' },
          ],
        },
      ],
    },
  },
];

export async function generatePracticeQuestion(
  options: GenerateQuestionOptions
): Promise<PracticeQuestion> {
  const { exam, category, difficulty, customScenario } = options;

  const prompt = `You are a distinguished Professor of Computer Science and Senior GATE/ISRO Examination Architect.
Generate a brand-new, intellectually rigorous competitive examination question on Database Management Systems (DBMS) ER / EER Modeling and Relational Table Reduction.

Target Exam: ${exam || 'GATE CS'}
Topic Focus: ${category || 'Table Reduction & Constraints'}
Difficulty Level: ${difficulty || 'Medium'}
${customScenario ? `Custom Scenario Prompt: ${customScenario}` : ''}

You MUST return ONLY a raw JSON object (matching the schema below) without markdown backticks or commentary:
{
  "id": "gen-${Date.now()}",
  "exam": "${exam || 'GATE CS'}",
  "year": "2026 Model Series",
  "paper": "Computer Science & Information Technology",
  "category": "${category || 'Table Reduction'}",
  "title": "Concise Descriptive Problem Title",
  "difficulty": "${difficulty || 'Medium'}",
  "statement": "Detailed academic problem statement detailing entities, primary keys, attributes (marking multivalued, derived, or partial keys), relationships, cardinalities (1:1, 1:N, M:N), participation constraints, and table reduction mandate.",
  "expectedTablesCount": 3,
  "expectedTablesExplanation": "Step-by-step rigorous relational reduction proof explaining how 1:1, 1:N, M:N, weak entities, and multivalued attributes map into minimum 1NF tables.",
  "constraintsSummary": [
    "Constraint item 1",
    "Constraint item 2"
  ],
  "hints": [
    "Hint 1",
    "Hint 2"
  ],
  "explanation": "Theoretical explanation of relational reduction and normalization rules.",
  "groundTruth": {
    "entities": [
      {
        "name": "EntityName",
        "isWeak": false,
        "isSuperclass": false,
        "isSubclass": false,
        "attributes": [
          { "name": "KeyAttr", "isPrimary": true },
          { "name": "SimpleAttr" },
          { "name": "MultiAttr", "isMultivalued": true },
          { "name": "DerivedAttr", "isDerived": true }
        ]
      }
    ],
    "relationships": [
      {
        "name": "RelName",
        "isIdentifying": false,
        "attributes": [{ "name": "RelAttr" }],
        "connections": [
          { "entity": "EntityName1", "cardinality": "1" },
          { "entity": "EntityName2", "cardinality": "N", "isTotal": true }
        ]
      }
    ],
    "specializations": []
  }
}`;

  try {
    const response = await generateWithModelFallback({
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert DBMS professor creating rigorous GATE, ISRO, and UGC NET database schema exam problems. Return only valid JSON.',
        responseMimeType: 'application/json',
      },
    });

    const text = response?.text || '';
    const cleanJson = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    const parsed = JSON.parse(cleanJson);

    // Validate essential fields
    if (
      parsed.title &&
      parsed.statement &&
      parsed.groundTruth?.entities &&
      parsed.groundTruth.entities.length > 0
    ) {
      return {
        id: parsed.id || `gen-${Date.now()}`,
        exam: parsed.exam || exam || 'GATE CS',
        year: parsed.year || '2026 Model Series',
        paper: parsed.paper || 'Computer Science & Information Technology',
        category: parsed.category || category || 'Table Reduction',
        title: parsed.title,
        difficulty: parsed.difficulty || difficulty || 'Medium',
        statement: parsed.statement,
        expectedTablesCount: Number(parsed.expectedTablesCount) || 3,
        expectedTablesExplanation:
          parsed.expectedTablesExplanation || 'Relational schema reduction in 1NF.',
        constraintsSummary: Array.isArray(parsed.constraintsSummary)
          ? parsed.constraintsSummary
          : ['Verify entities and relationships against problem constraints.'],
        hints: Array.isArray(parsed.hints)
          ? parsed.hints
          : ['Check primary keys and cardinality ratios.'],
        explanation:
          parsed.explanation ||
          'Relational table reduction maps strong entities, absorbs 1:N total relationships, and creates junction tables for M:N.',
        groundTruth: {
          entities: parsed.groundTruth.entities.map((e: any) => ({
            name: e.name || 'Entity',
            isWeak: Boolean(e.isWeak),
            isSuperclass: Boolean(e.isSuperclass),
            isSubclass: Boolean(e.isSubclass),
            attributes: Array.isArray(e.attributes)
              ? e.attributes.map((a: any) => ({
                  name: typeof a === 'string' ? a : a.name || 'attr',
                  isPrimary: Boolean(a.isPrimary || a.is_primary),
                  isMultivalued: Boolean(a.isMultivalued || a.is_multivalued),
                  isDerived: Boolean(a.isDerived || a.is_derived),
                }))
              : [],
          })),
          relationships: Array.isArray(parsed.groundTruth.relationships)
            ? parsed.groundTruth.relationships.map((r: any) => ({
                name: r.name || 'Relates',
                isIdentifying: Boolean(r.isIdentifying),
                attributes: Array.isArray(r.attributes)
                  ? r.attributes.map((a: any) => ({
                      name: typeof a === 'string' ? a : a.name,
                    }))
                  : undefined,
                connections: Array.isArray(r.connections)
                  ? r.connections.map((c: any) => ({
                      entity: c.entity,
                      cardinality: c.cardinality || 'N',
                      isTotal: Boolean(c.isTotal),
                    }))
                  : [],
              }))
            : [],
          specializations: Array.isArray(parsed.groundTruth.specializations)
            ? parsed.groundTruth.specializations.map((s: any) => ({
                superclass: s.superclass,
                subclasses: Array.isArray(s.subclasses) ? s.subclasses : [],
                specType: s.specType || 'disjoint',
                isTotal: Boolean(s.isTotal),
              }))
            : undefined,
        },
      };
    }
  } catch (err) {
    console.warn('AI question generation fallback to procedural templates:', err);
  }

  // Fallback to rich procedural templates with matching category or random selection
  const matchingTemplates = PROCEDURAL_QUESTION_TEMPLATES.filter(
    (t) => t.category === category || t.exam === exam
  );
  const selectedTemplate =
    matchingTemplates.length > 0
      ? matchingTemplates[Math.floor(Math.random() * matchingTemplates.length)]
      : PROCEDURAL_QUESTION_TEMPLATES[
          Math.floor(Math.random() * PROCEDURAL_QUESTION_TEMPLATES.length)
        ];

  return {
    ...selectedTemplate,
    id: `gen-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    exam: exam || selectedTemplate.exam,
    difficulty: difficulty || selectedTemplate.difficulty,
  };
}
