export interface ExpectedAttribute {
  name: string;
  isPrimary?: boolean;
  isMultivalued?: boolean;
  isDerived?: boolean;
}

export interface ExpectedEntity {
  name: string;
  isWeak?: boolean;
  isSuperclass?: boolean;
  isSubclass?: boolean;
  attributes: ExpectedAttribute[];
}

export interface ExpectedRelationship {
  name: string;
  isIdentifying?: boolean;
  attributes?: ExpectedAttribute[];
  connections: {
    entity: string;
    cardinality: string;
    isTotal?: boolean;
  }[];
}

export interface ExpectedSpecialization {
  superclass: string;
  subclasses: string[];
  specType: 'disjoint' | 'overlapping' | 'union';
  isTotal?: boolean;
}

export interface SubQuestion {
  id: string;
  prompt: string;
  type: 'mcq' | 'numerical' | 'text';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
}

export interface PracticeQuestion {
  id: string;
  exam: string;
  year: string;
  paper: string;
  category: 'Classical ER' | 'Weak Entity' | 'EER Specialization' | 'Table Reduction' | 'Diagram Analysis';
  type?: 'diagram_analysis' | 'diagram_construction';
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  statement: string;
  expectedTablesCount?: number;
  expectedTablesExplanation?: string;
  constraintsSummary?: string[];
  hints?: string[];
  explanation: string;
  groundTruth?: {
    entities: ExpectedEntity[];
    relationships: ExpectedRelationship[];
    specializations?: ExpectedSpecialization[];
  };
  initialNodes?: any[];
  initialEdges?: any[];
  subQuestions?: SubQuestion[];
}

export const PRACTICE_QUESTIONS: PracticeQuestion[] = [
  {
    id: 'gate-cs-2017-binary-cardinality',
    exam: 'GATE CS',
    year: '2017',
    paper: 'Computer Science & Information Technology',
    category: 'Classical ER',
    title: 'Binary 1:N Relationship with Total Participation & Relation Reduction',
    difficulty: 'Medium',
    statement:
      'An ER model has two entities E1 and E2 with primary keys k1 and k2 respectively. E1 and E2 are connected by a binary relationship R with cardinality 1:N (where 1 is on E1 side and N is on E2 side). Relationship R possesses its own descriptive attribute a1. Every instance of entity E2 must mandatorily participate in relationship R (total participation). Design the complete ER diagram in Chen notation and determine the minimum number of relational tables needed in 1NF.',
    expectedTablesCount: 2,
    expectedTablesExplanation:
      'Since cardinality is 1:N from E1 to E2 and E2 has total participation in R, the relationship R and its descriptive attribute a1 can be merged directly into the table for entity E2 with foreign key k1 referencing E1. This results in exactly 2 tables: E1(k1) and E2(k2, k1, a1).',
    constraintsSummary: [
      'Strong Entity E1 with Primary Key k1',
      'Strong Entity E2 with Primary Key k2',
      'Binary Relationship R between E1 and E2',
      'Cardinality: 1 on E1 side, N on E2 side',
      'Attribute a1 attached to Relationship R',
      'Total participation of E2 in R (double line)',
    ],
    hints: [
      'Add Entity E1 with primary key k1, and Entity E2 with primary key k2.',
      'Add a Relationship diamond R and attach attribute a1 to it.',
      'Connect E1 to R with cardinality 1, and E2 to R with cardinality N and Total participation toggled ON.',
    ],
    explanation:
      'In a 1:N relationship with total participation on the N-side (E2), the relationship does not require a separate table. The primary key of the 1-side (k1) along with the relationship attributes (a1) can be placed as a foreign key inside table E2. Thus, 2 relational tables are sufficient: E1(k1) and E2(k2, k1, a1).',
    groundTruth: {
      entities: [
        {
          name: 'E1',
          attributes: [{ name: 'k1', isPrimary: true }],
        },
        {
          name: 'E2',
          attributes: [{ name: 'k2', isPrimary: true }],
        },
      ],
      relationships: [
        {
          name: 'R',
          attributes: [{ name: 'a1' }],
          connections: [
            { entity: 'E1', cardinality: '1' },
            { entity: 'E2', cardinality: 'N', isTotal: true },
          ],
        },
      ],
    },
  },
  {
    id: 'gate-cs-2021-eer-hospital-hierarchy',
    exam: 'GATE CS',
    year: '2021',
    paper: 'Computer Science & Information Technology',
    category: 'EER Specialization',
    title: 'Hospital Management EER Specialization & M:N Treatment Relationship',
    difficulty: 'Hard',
    statement:
      'A hospital management system database maintains records for Doctor and Patient. A Doctor entity has DocID (Primary Key) and Specialty. A Patient entity has PatientID (Primary Key) and Name. Patient is specialized into two mutually exclusive (disjoint) subclasses: InPatient (with specific attribute RoomNumber) and OutPatient (with specific attribute NextVisitDate). A many-to-many relationship Treats connects Doctor and Patient, containing the attribute TreatmentDate. Model this complete Enhanced ER (EER) diagram.',
    expectedTablesCount: 4,
    expectedTablesExplanation:
      'The relational mapping requires: (1) Doctor(DocID, Specialty), (2) Patient(PatientID, Name), (3) InPatient(PatientID, RoomNumber) or OutPatient(PatientID, NextVisitDate) maintaining subclass integrity, and (4) Treats(DocID, PatientID, TreatmentDate) for the M:N relationship.',
    constraintsSummary: [
      'Doctor Entity with PK DocID and attribute Specialty',
      'Patient Superclass Entity with PK PatientID and attribute Name',
      'Disjoint ISA Specialization (circle d) under Patient',
      'Subclass InPatient with attribute RoomNumber',
      'Subclass OutPatient with attribute NextVisitDate',
      'Relationship Treats (M:N) connecting Doctor and Patient with attribute TreatmentDate',
    ],
    hints: [
      'Create Doctor entity with DocID (PK) and Specialty.',
      'Create Patient entity marked as Superclass with PatientID (PK) and Name.',
      'Add a Disjoint Specialization node (d) connected from Patient, and connect it to InPatient (with RoomNumber) and OutPatient (with NextVisitDate).',
      'Add relationship Treats with attribute TreatmentDate connecting Doctor (M) and Patient (N).',
    ],
    explanation:
      'EER Specialization allows sharing of common attributes (PatientID, Name) in the superclass while subclass-specific attributes reside in InPatient and OutPatient. The M:N relationship Treats requires a distinct junction table with composite primary key (DocID, PatientID, TreatmentDate).',
    groundTruth: {
      entities: [
        {
          name: 'Doctor',
          attributes: [
            { name: 'DocID', isPrimary: true },
            { name: 'Specialty' },
          ],
        },
        {
          name: 'Patient',
          isSuperclass: true,
          attributes: [
            { name: 'PatientID', isPrimary: true },
            { name: 'Name' },
          ],
        },
        {
          name: 'InPatient',
          isSubclass: true,
          attributes: [{ name: 'RoomNumber' }],
        },
        {
          name: 'OutPatient',
          isSubclass: true,
          attributes: [{ name: 'NextVisitDate' }],
        },
      ],
      specializations: [
        {
          superclass: 'Patient',
          subclasses: ['InPatient', 'OutPatient'],
          specType: 'disjoint',
        },
      ],
      relationships: [
        {
          name: 'Treats',
          attributes: [{ name: 'TreatmentDate' }],
          connections: [
            { entity: 'Doctor', cardinality: 'M' },
            { entity: 'Patient', cardinality: 'N' },
          ],
        },
      ],
    },
  },
  {
    id: 'gate-cs-2014-weak-entity-dept-dependent',
    exam: 'GATE CS',
    year: '2014',
    paper: 'Computer Science & Information Technology',
    category: 'Weak Entity',
    title: 'Department-Dependent Identifying Relationship & Partial Keys',
    difficulty: 'Medium',
    statement:
      'A corporate organization maintains records of Departments and their Dependents. The Department entity is a strong entity with primary key DeptNo and attribute DeptName. The Dependent entity is a weak entity that cannot exist without its corresponding Department. Dependent has a partial discriminator attribute DepName (dashed underline) and attribute BirthDate. The identifying relationship HasDependent links Department (1) to Dependent (N) with total participation of Dependent.',
    expectedTablesCount: 2,
    expectedTablesExplanation:
      'The weak entity Dependent is mapped to a relation whose primary key is the composite key (DeptNo, DepName), where DeptNo is the foreign key referencing Department. Thus, exactly 2 tables are created: Department(DeptNo, DeptName) and Dependent(DeptNo, DepName, BirthDate).',
    constraintsSummary: [
      'Strong Entity Department with Primary Key DeptNo and attribute DeptName',
      'Weak Entity Dependent with Partial Key DepName and attribute BirthDate',
      'Identifying Relationship HasDependent (double diamond)',
      'Cardinality 1 on Department side, N on Dependent side',
      'Total participation of Dependent in HasDependent',
    ],
    hints: [
      'Add a Strong Entity Department with primary key DeptNo and attribute DeptName.',
      'Add a Weak Entity Dependent (double border) with primary/discriminator key DepName and attribute BirthDate.',
      'Add an Identifying Relationship HasDependent (double diamond) connecting Department (1) to Dependent (N) with total participation.',
    ],
    explanation:
      'A weak entity does not possess a primary key of its own. It is identified by combining the primary key of its identifying owner entity (DeptNo) with its partial discriminator (DepName). In relational reduction, the identifying relationship is merged into the weak entity table.',
    groundTruth: {
      entities: [
        {
          name: 'Department',
          attributes: [
            { name: 'DeptNo', isPrimary: true },
            { name: 'DeptName' },
          ],
        },
        {
          name: 'Dependent',
          isWeak: true,
          attributes: [
            { name: 'DepName', isPrimary: true },
            { name: 'BirthDate' },
          ],
        },
      ],
      relationships: [
        {
          name: 'HasDependent',
          isIdentifying: true,
          connections: [
            { entity: 'Department', cardinality: '1' },
            { entity: 'Dependent', cardinality: 'N', isTotal: true },
          ],
        },
      ],
    },
  },
  {
    id: 'gate-cs-2008-min-tables-reduction',
    exam: 'GATE CS',
    year: '2008',
    paper: 'Computer Science & Information Technology',
    category: 'Table Reduction',
    title: 'Multi-Relationship Topology & Minimum Table Reduction',
    difficulty: 'Hard',
    statement:
      'Consider three entities E1, E2, and E3 with primary keys A, B, and C respectively. A binary relationship R1 connects E1 and E2 with cardinality 1:1, where E1 has total participation. Another binary relationship R2 connects E2 and E3 with cardinality M:N. Neither R1 nor R2 has descriptive attributes. Design the ER model and determine the minimum number of relational tables required in 1NF without redundancy.',
    expectedTablesCount: 3,
    expectedTablesExplanation:
      'Since R1 is 1:1 with E1 having total participation, E1 and R1 can be merged with foreign key B referencing E2: E1(A, B). Entity E2 forms table E2(B). Entity E3 forms table E3(C). Relationship R2 is M:N, which strictly requires a separate junction table R2(B, C). Total minimum tables = 3: E1_R1(A, B), E3(C), and R2(B, C) or E2(B).',
    constraintsSummary: [
      'Strong Entity E1 with PK A',
      'Strong Entity E2 with PK B',
      'Strong Entity E3 with PK C',
      'Relationship R1 (1:1) between E1 and E2 with Total participation of E1',
      'Relationship R2 (M:N) between E2 and E3',
    ],
    hints: [
      'Create three entities: E1 (PK A), E2 (PK B), and E3 (PK C).',
      'Connect E1 and E2 via relationship R1 with cardinality 1:1 and Total participation on E1.',
      'Connect E2 and E3 via relationship R2 with cardinality M:N.',
    ],
    explanation:
      'In 1:1 with total participation on one side, that side can absorb the foreign key and relationship. M:N relationships cannot be absorbed and always require a separate junction relation.',
    groundTruth: {
      entities: [
        {
          name: 'E1',
          attributes: [{ name: 'A', isPrimary: true }],
        },
        {
          name: 'E2',
          attributes: [{ name: 'B', isPrimary: true }],
        },
        {
          name: 'E3',
          attributes: [{ name: 'C', isPrimary: true }],
        },
      ],
      relationships: [
        {
          name: 'R1',
          connections: [
            { entity: 'E1', cardinality: '1', isTotal: true },
            { entity: 'E2', cardinality: '1' },
          ],
        },
        {
          name: 'R2',
          connections: [
            { entity: 'E2', cardinality: 'M' },
            { entity: 'E3', cardinality: 'N' },
          ],
        },
      ],
    },
  },
  {
    id: 'gate-it-2006-ternary-teaching-assignment',
    exam: 'GATE IT',
    year: '2006',
    paper: 'Information Technology',
    category: 'Classical ER',
    title: 'Ternary Relationship Model for University Course Offering',
    difficulty: 'Hard',
    statement:
      'A university database records semester course allocations. There are three strong entities: Instructor (PK: InstID, attribute Name), Course (PK: CourseCode, attribute Title), and Semester (PK: SemID, attribute Year). A ternary relationship Teaches connects all three entities with cardinality M:N:P and has its own descriptive attribute Classroom. Model this ternary relationship and compute the resulting relational tables.',
    expectedTablesCount: 4,
    expectedTablesExplanation:
      'Three strong entity tables: Instructor(InstID, Name), Course(CourseCode, Title), Semester(SemID, Year). One junction table for the M:N:P ternary relationship: Teaches(InstID, CourseCode, SemID, Classroom) with composite primary key (InstID, CourseCode, SemID). Total = 4 tables.',
    constraintsSummary: [
      'Strong Entity Instructor with PK InstID and attribute Name',
      'Strong Entity Course with PK CourseCode and attribute Title',
      'Strong Entity Semester with PK SemID and attribute Year',
      'Ternary Relationship Teaches connecting Instructor, Course, and Semester',
      'Descriptive attribute Classroom on Teaches',
      'Cardinality M on Instructor, N on Course, P on Semester',
    ],
    hints: [
      'Create 3 strong entities: Instructor, Course, Semester with their respective primary keys.',
      'Create a relationship diamond Teaches and attach attribute Classroom.',
      'Connect Instructor (M), Course (N), and Semester (P) to the Teaches diamond.',
    ],
    explanation:
      'A ternary relationship involves three entities. For an M:N:P ternary relationship, the relational reduction requires creating a separate table with foreign keys referencing each participant entity and any relationship attributes.',
    groundTruth: {
      entities: [
        {
          name: 'Instructor',
          attributes: [
            { name: 'InstID', isPrimary: true },
            { name: 'Name' },
          ],
        },
        {
          name: 'Course',
          attributes: [
            { name: 'CourseCode', isPrimary: true },
            { name: 'Title' },
          ],
        },
        {
          name: 'Semester',
          attributes: [
            { name: 'SemID', isPrimary: true },
            { name: 'Year' },
          ],
        },
      ],
      relationships: [
        {
          name: 'Teaches',
          attributes: [{ name: 'Classroom' }],
          connections: [
            { entity: 'Instructor', cardinality: 'M' },
            { entity: 'Course', cardinality: 'N' },
            { entity: 'Semester', cardinality: 'P' },
          ],
        },
      ],
    },
  },
  {
    id: 'gate-cs-2019-recursive-manager-hierarchy',
    exam: 'GATE CS',
    year: '2019',
    paper: 'Computer Science & Information Technology',
    category: 'Classical ER',
    title: 'Unary Recursive Relationship & Manager-Subordinate Hierarchy',
    difficulty: 'Medium',
    statement:
      'In a corporate enterprise database, an Employee entity has primary key EmpID, attribute Name, and attribute Salary. Employees are managed by other employees within the same organization. A recursive (unary) relationship Manages connects the Employee entity to itself with 1:N cardinality (one Manager manages N Subordinates). The relationship Manages has its own attribute SinceDate. Model this recursive relationship and determine the minimum number of relational tables needed in 1NF.',
    expectedTablesCount: 1,
    expectedTablesExplanation:
      'Since Manages is a 1:N recursive relationship on Employee, it can be collapsed directly into the single Employee relation by adding a self-referential foreign key MgrID referencing EmpID along with the descriptive attribute SinceDate. Thus, exactly 1 table is required: Employee(EmpID, Name, Salary, MgrID, SinceDate).',
    constraintsSummary: [
      'Strong Entity Employee with Primary Key EmpID, Name, and Salary',
      'Unary Recursive Relationship Manages on Employee',
      'Descriptive attribute SinceDate on Manages relationship',
      'Cardinality 1 on Manager role, N on Subordinate role',
    ],
    hints: [
      'Add a Strong Entity Employee with primary key EmpID and attributes Name and Salary.',
      'Add a Relationship diamond Manages with attribute SinceDate.',
      'Connect Employee to Manages with cardinality 1, and connect Employee again to Manages with cardinality N.',
    ],
    explanation:
      'A 1:N unary recursive relationship maps to a single relational table with a self-referential foreign key referencing the primary key of the same table.',
    groundTruth: {
      entities: [
        {
          name: 'Employee',
          attributes: [
            { name: 'EmpID', isPrimary: true },
            { name: 'Name' },
            { name: 'Salary' },
          ],
        },
      ],
      relationships: [
        {
          name: 'Manages',
          attributes: [{ name: 'SinceDate' }],
          connections: [
            { entity: 'Employee', cardinality: '1' },
            { entity: 'Employee', cardinality: 'N' },
          ],
        },
      ],
    },
  },
  {
    id: 'ugc-net-2020-multivalued-derived-attributes',
    exam: 'UGC NET CS',
    year: '2020',
    paper: 'Computer Science Paper II',
    category: 'Table Reduction',
    title: 'Multivalued & Derived Attributes Relational Decomposition',
    difficulty: 'Medium',
    statement:
      'An educational institution database represents Student and Department. Entity Student has primary key RollNo, attribute Name, attribute DOB, derived attribute Age (computed from DOB), and a multivalued attribute Phone (double oval). Entity Department has primary key DeptID and attribute DeptName. A binary relationship EnrollsIn connects Student (N) to Department (1) with total participation of Student. Construct the ER diagram and compute the minimum number of 1NF relations required.',
    expectedTablesCount: 3,
    expectedTablesExplanation:
      '1) Derived attribute Age is omitted from physical storage. 2) Multivalued attribute Phone cannot reside in 1NF table without violating atomic value rules, requiring a separate table Student_Phone(RollNo, Phone). 3) Student(RollNo, Name, DOB, DeptID) merges the 1:N total participation relationship. 4) Department(DeptID, DeptName). Total minimum tables = 3.',
    constraintsSummary: [
      'Student Entity with PK RollNo, Name, DOB, Derived Age (dashed oval), Multivalued Phone (double oval)',
      'Department Entity with PK DeptID and DeptName',
      'Relationship EnrollsIn connecting Student (N, Total Participation) to Department (1)',
    ],
    hints: [
      'Add Entity Student with primary key RollNo, attributes Name and DOB, derived attribute Age, and multivalued attribute Phone.',
      'Add Entity Department with primary key DeptID and attribute DeptName.',
      'Add Relationship EnrollsIn connecting Student (N with Total Participation) to Department (1).',
    ],
    explanation:
      'Multivalued attributes always require their own separate relation in 1NF to prevent non-atomic repeating groups. Derived attributes are calculated on-the-fly and do not require physical storage columns.',
    groundTruth: {
      entities: [
        {
          name: 'Student',
          attributes: [
            { name: 'RollNo', isPrimary: true },
            { name: 'Name' },
            { name: 'DOB' },
            { name: 'Age', isDerived: true },
            { name: 'Phone', isMultivalued: true },
          ],
        },
        {
          name: 'Department',
          attributes: [
            { name: 'DeptID', isPrimary: true },
            { name: 'DeptName' },
          ],
        },
      ],
      relationships: [
        {
          name: 'EnrollsIn',
          connections: [
            { entity: 'Student', cardinality: 'N', isTotal: true },
            { entity: 'Department', cardinality: '1' },
          ],
        },
      ],
    },
  },
  {
    id: 'isro-cs-2020-nested-weak-entity-hierarchy',
    exam: 'ISRO CS',
    year: '2020',
    paper: "Scientist/Engineer 'SC' Computer Science",
    category: 'Weak Entity',
    title: 'Two-Tier Nested Weak Entity Hierarchy (Building-Apartment-Room)',
    difficulty: 'Hard',
    statement:
      'A university campus housing database tracks residential complexes using a multi-tier weak entity structure. Strong entity Building has primary key BuildingID and attribute Location. Entity Apartment is a weak entity identified by owner Building; it has partial discriminator AptNo (dashed underline) and attribute Floor. Entity Room is a second-tier weak entity identified by Apartment; it has partial discriminator RoomNo and attribute AreaSqFt. Identifying relationship HasApartment links Building (1) to Apartment (N) with total participation. Identifying relationship HasRoom links Apartment (1) to Room (N) with total participation. Model this hierarchy and calculate the relational schema.',
    expectedTablesCount: 3,
    expectedTablesExplanation:
      'Relational mapping requires 3 tables: (1) Building(BuildingID, Location), (2) Apartment(BuildingID, AptNo, Floor) where (BuildingID, AptNo) forms composite PK, and (3) Room(BuildingID, AptNo, RoomNo, AreaSqFt) where the entire 3-part composite key (BuildingID, AptNo, RoomNo) forms the PK. Minimum tables = 3.',
    constraintsSummary: [
      'Strong Entity Building with PK BuildingID and attribute Location',
      'Weak Entity Apartment (double box) with Partial Key AptNo and attribute Floor',
      'Identifying Relationship HasApartment (double diamond) linking Building (1) to Apartment (N, Total)',
      'Weak Entity Room (double box) with Partial Key RoomNo and attribute AreaSqFt',
      'Identifying Relationship HasRoom (double diamond) linking Apartment (1) to Room (N, Total)',
    ],
    hints: [
      'Create strong entity Building (PK: BuildingID, Location).',
      'Create weak entity Apartment with partial key AptNo and Floor, connected to Building via identifying relationship HasApartment (1:N, total).',
      'Create second weak entity Room with partial key RoomNo and AreaSqFt, connected to Apartment via identifying relationship HasRoom (1:N, total).',
    ],
    explanation:
      'In nested weak entities, the primary key cascades down the hierarchy. Room requires the primary key of Apartment (which itself includes BuildingID) plus its own discriminator RoomNo.',
    groundTruth: {
      entities: [
        {
          name: 'Building',
          attributes: [
            { name: 'BuildingID', isPrimary: true },
            { name: 'Location' },
          ],
        },
        {
          name: 'Apartment',
          isWeak: true,
          attributes: [
            { name: 'AptNo', isPrimary: true },
            { name: 'Floor' },
          ],
        },
        {
          name: 'Room',
          isWeak: true,
          attributes: [
            { name: 'RoomNo', isPrimary: true },
            { name: 'AreaSqFt' },
          ],
        },
      ],
      relationships: [
        {
          name: 'HasApartment',
          isIdentifying: true,
          connections: [
            { entity: 'Building', cardinality: '1' },
            { entity: 'Apartment', cardinality: 'N', isTotal: true },
          ],
        },
        {
          name: 'HasRoom',
          isIdentifying: true,
          connections: [
            { entity: 'Apartment', cardinality: '1' },
            { entity: 'Room', cardinality: 'N', isTotal: true },
          ],
        },
      ],
    },
  },
  {
    id: 'gate-cs-2018-mn-total-participation-both-sides',
    exam: 'GATE CS',
    year: '2018',
    paper: 'Computer Science & Information Technology',
    category: 'Classical ER',
    title: 'M:N Relationship with Total Participation on Both Sides',
    difficulty: 'Medium',
    statement:
      'A publishing house database models Authors and Books. Entity Author has primary key AuthorID and attribute AuthorName. Entity Book has primary key ISBN and attribute Title. The relationship Writes links Author and Book with M:N cardinality and descriptive attribute RoyaltyPercent. Every Author in the database must have written at least one Book, and every Book must have at least one Author (Total participation on both sides). Design the ER diagram and determine the minimum number of relational tables in 1NF.',
    expectedTablesCount: 3,
    expectedTablesExplanation:
      'In an M:N relationship, neither entity can absorb the foreign key without introducing repeating groups or null values. Even with total participation on both ends, M:N strictly mandates a distinct cross-reference junction table. Minimum tables = 3: Author(AuthorID, AuthorName), Book(ISBN, Title), and Writes(AuthorID, ISBN, RoyaltyPercent).',
    constraintsSummary: [
      'Strong Entity Author with PK AuthorID and attribute AuthorName',
      'Strong Entity Book with PK ISBN and attribute Title',
      'Relationship Writes (M:N) with attribute RoyaltyPercent',
      'Total participation on Author side (double line to Writes)',
      'Total participation on Book side (double line to Writes)',
    ],
    hints: [
      'Create Author (PK: AuthorID, AuthorName) and Book (PK: ISBN, Title).',
      'Create relationship Writes with descriptive attribute RoyaltyPercent.',
      'Connect Author to Writes with cardinality M and Total participation ON; connect Book to Writes with cardinality N and Total participation ON.',
    ],
    explanation:
      'Unlike 1:1 or 1:N where total participation allows collapsing the relationship into one of the entity tables, an M:N relationship cannot be merged regardless of participation constraints.',
    groundTruth: {
      entities: [
        {
          name: 'Author',
          attributes: [
            { name: 'AuthorID', isPrimary: true },
            { name: 'AuthorName' },
          ],
        },
        {
          name: 'Book',
          attributes: [
            { name: 'ISBN', isPrimary: true },
            { name: 'Title' },
          ],
        },
      ],
      relationships: [
        {
          name: 'Writes',
          attributes: [{ name: 'RoyaltyPercent' }],
          connections: [
            { entity: 'Author', cardinality: 'M', isTotal: true },
            { entity: 'Book', cardinality: 'N', isTotal: true },
          ],
        },
      ],
    },
  },
  {
    id: 'ugc-net-2021-eer-overlapping-specialization',
    exam: 'UGC NET CS',
    year: '2021',
    paper: 'Computer Science & Applications',
    category: 'EER Specialization',
    title: 'Vehicle Overlapping Specialization (o) with Total Completeness',
    difficulty: 'Hard',
    statement:
      'An automotive dealership catalog models Vehicles. Superclass entity Vehicle has primary key VIN, attribute Make, and attribute Price. The vehicle classification is an Overlapping Specialization (Circle o) with Total Completeness (double line) into two non-exclusive subclasses: Car (specific attribute MaxSpeed) and Truck (specific attribute PayloadCapacity). An individual vehicle can be both a Car and a Truck simultaneously (e.g., utility coupe / crossover). Construct the EER diagram.',
    expectedTablesCount: 3,
    expectedTablesExplanation:
      'Because specialization is overlapping, separate subclass tables referencing the superclass or multiple boolean flags are required. Subclass mapping: Vehicle(VIN, Make, Price), Car(VIN, MaxSpeed), and Truck(VIN, PayloadCapacity). Total tables = 3.',
    constraintsSummary: [
      'Superclass Entity Vehicle with PK VIN, Make, and Price',
      'Overlapping Specialization node (Circle o) with Total Completeness',
      'Subclass Car with specific attribute MaxSpeed',
      'Subclass Truck with specific attribute PayloadCapacity',
    ],
    hints: [
      'Create superclass entity Vehicle with VIN (PK), Make, and Price.',
      'Add an Overlapping Specialization node (o) with isTotal set to true.',
      'Connect Vehicle to the specialization node, and connect the specialization node to subclasses Car (MaxSpeed) and Truck (PayloadCapacity).',
    ],
    explanation:
      'Overlapping specialization allows an entity instance to belong to multiple subclasses at the same time. The (o) symbol distinguishes it from disjoint (d) specialization.',
    groundTruth: {
      entities: [
        {
          name: 'Vehicle',
          isSuperclass: true,
          attributes: [
            { name: 'VIN', isPrimary: true },
            { name: 'Make' },
            { name: 'Price' },
          ],
        },
        {
          name: 'Car',
          isSubclass: true,
          attributes: [{ name: 'MaxSpeed' }],
        },
        {
          name: 'Truck',
          isSubclass: true,
          attributes: [{ name: 'PayloadCapacity' }],
        },
      ],
      specializations: [
        {
          superclass: 'Vehicle',
          subclasses: ['Car', 'Truck'],
          specType: 'overlapping',
          isTotal: true,
        },
      ],
      relationships: [],
    },
  },
  {
    id: 'gate-cs-2022-enterprise-banking-schema',
    exam: 'GATE CS',
    year: '2022',
    paper: 'Computer Science & Information Technology',
    category: 'Table Reduction',
    title: 'Enterprise Banking Multi-Entity Relational Schema Reduction',
    difficulty: 'Hard',
    statement:
      'A nationalized banking system consists of three entities: Branch (PK: BranchName, attribute City), Customer (PK: CustID, attribute CustName), and Account (PK: AccountNo, attribute Balance). Relationship HoldsAccount links Branch (1) to Account (N) with total participation of Account. Relationship CustAccount links Customer (M) to Account (N) with descriptive attribute AccessDate. Design the complete ER model in Chen notation and determine the minimum number of relational tables needed without information loss.',
    expectedTablesCount: 4,
    expectedTablesExplanation:
      '1) Branch(BranchName, City). 2) Account(AccountNo, Balance, BranchName) merges the 1:N total participation relationship HoldsAccount with BranchName as foreign key. 3) Customer(CustID, CustName). 4) CustAccount(CustID, AccountNo, AccessDate) junction table for M:N relationship. Total minimum tables = 4.',
    constraintsSummary: [
      'Strong Entity Branch with PK BranchName and attribute City',
      'Strong Entity Customer with PK CustID and attribute CustName',
      'Strong Entity Account with PK AccountNo and attribute Balance',
      'Relationship HoldsAccount (1:N) connecting Branch (1) to Account (N, Total)',
      'Relationship CustAccount (M:N) connecting Customer (M) to Account (N) with attribute AccessDate',
    ],
    hints: [
      'Create three entities: Branch (BranchName PK, City), Customer (CustID PK, CustName), Account (AccountNo PK, Balance).',
      'Add relationship HoldsAccount connecting Branch (1) to Account (N, Total participation).',
      'Add relationship CustAccount with attribute AccessDate connecting Customer (M) and Account (N).',
    ],
    explanation:
      'HoldsAccount (1:N with total participation on N) merges directly into Account table. CustAccount (M:N) requires a separate junction table. Total minimum tables = 4.',
    groundTruth: {
      entities: [
        {
          name: 'Branch',
          attributes: [
            { name: 'BranchName', isPrimary: true },
            { name: 'City' },
          ],
        },
        {
          name: 'Customer',
          attributes: [
            { name: 'CustID', isPrimary: true },
            { name: 'CustName' },
          ],
        },
        {
          name: 'Account',
          attributes: [
            { name: 'AccountNo', isPrimary: true },
            { name: 'Balance' },
          ],
        },
      ],
      relationships: [
        {
          name: 'HoldsAccount',
          connections: [
            { entity: 'Branch', cardinality: '1' },
            { entity: 'Account', cardinality: 'N', isTotal: true },
          ],
        },
        {
          name: 'CustAccount',
          attributes: [{ name: 'AccessDate' }],
          connections: [
            { entity: 'Customer', cardinality: 'M' },
            { entity: 'Account', cardinality: 'N' },
          ],
        },
      ],
    },
  },
  {
    id: 'gate-cs-analysis-minimal-tables',
    exam: 'GATE CS',
    year: '2018',
    paper: 'Computer Science & Information Technology',
    category: 'Diagram Analysis',
    type: 'diagram_analysis',
    title: 'Diagram Analysis: Table Reduction & Merging Minimization',
    difficulty: 'Medium',
    statement:
      'Analyze the given Chen ER diagram containing entities E1, E2, E3 and binary relationships R1 and R2. Entity E1 has primary key e11 and non-key attribute e12. Entity E2 has primary key e21 and attribute e22. Entity E3 has primary key e31 and attribute e32. Relationship R1 connects E1 (1) to E2 (N) with total participation of E2. Relationship R2 connects E2 (M) to E3 (N) with a descriptive attribute r2_date. Evaluate the relational mapping rules, key propagations, and minimal table counts.',
    expectedTablesCount: 3,
    expectedTablesExplanation:
      '1) Table E1(e11, e12) with PK {e11}. 2) Table E2_R1(e21, e22, e11) with PK {e21} and FK e11 referencing E1 (merged because 1:N with total participation on N-side). 3) Table E3(e31, e32) with PK {e31}. 4) Table R2(e21, e31, r2_date) with composite PK {e21, e31}. Total minimal relational schemas = 3 (if E3 non-key is subsumed) or 4 in standard 3NF.',
    constraintsSummary: [
      'Strong Entity E1 with primary key e11 and attribute e12',
      'Strong Entity E2 with primary key e21 and attribute e22',
      'Strong Entity E3 with primary key e31 and attribute e32',
      '1:N Relationship R1 from E1 to E2 with total participation on E2 (double line)',
      'M:N Relationship R2 between E2 and E3 with descriptive attribute r2_date',
    ],
    hints: [
      'For a 1:N relationship where the N-side entity has total participation, the relationship can be merged directly into the N-side entity table with a NOT NULL foreign key.',
      'A Many-to-Many (M:N) relationship cannot be merged into either participating entity without causing multivalued attribute violations or extensive NULL padding.',
    ],
    explanation:
      'Relational conversion process:\n1. Entity E1 produces table E1(e11, e12) with Primary Key {e11}.\n2. Relationship R1 is 1:N from E1 to E2 with total participation on E2. Entity E2 produces table E2(e21, e22, e11) where e11 is a Foreign Key referencing E1. Since every E2 entity participates in R1, e11 cannot be NULL. Relationship R1 does not need its own table.\n3. Entity E3 produces table E3(e31, e32) with Primary Key {e31}.\n4. Relationship R2 is M:N between E2 and E3 with attribute r2_date. It must be mapped to a separate junction table R2(e21, e31, r2_date) with composite Primary Key {e21, e31}.\n\nThus, 4 distinct relational tables are produced in standard normalized form (or 3 when considering minimum reduction variants where independent standalone entity tables are optimized).',
    initialNodes: [
      { id: 'ent-e1', type: 'entity', position: { x: 80, y: 180 }, data: { label: 'E1' } },
      { id: 'attr-e11', type: 'attribute', position: { x: 30, y: 70 }, data: { label: 'e11', isPrimary: true } },
      { id: 'attr-e12', type: 'attribute', position: { x: 150, y: 70 }, data: { label: 'e12' } },
      { id: 'rel-r1', type: 'relationship', position: { x: 290, y: 180 }, data: { label: 'R1' } },
      { id: 'ent-e2', type: 'entity', position: { x: 490, y: 180 }, data: { label: 'E2' } },
      { id: 'attr-e21', type: 'attribute', position: { x: 430, y: 70 }, data: { label: 'e21', isPrimary: true } },
      { id: 'attr-e22', type: 'attribute', position: { x: 560, y: 70 }, data: { label: 'e22' } },
      { id: 'rel-r2', type: 'relationship', position: { x: 490, y: 350 }, data: { label: 'R2' } },
      { id: 'attr-r2-date', type: 'attribute', position: { x: 650, y: 350 }, data: { label: 'r2_date' } },
      { id: 'ent-e3', type: 'entity', position: { x: 490, y: 500 }, data: { label: 'E3' } },
      { id: 'attr-e31', type: 'attribute', position: { x: 380, y: 590 }, data: { label: 'e31', isPrimary: true } },
      { id: 'attr-e32', type: 'attribute', position: { x: 580, y: 590 }, data: { label: 'e32' } },
    ],
    initialEdges: [
      { id: 'e-e1-a11', source: 'ent-e1', target: 'attr-e11', type: 'cardinality' },
      { id: 'e-e1-a12', source: 'ent-e1', target: 'attr-e12', type: 'cardinality' },
      { id: 'e-r1-e1', source: 'rel-r1', target: 'ent-e1', type: 'cardinality', label: '1', data: { cardinality: '1' } },
      { id: 'e-r1-e2', source: 'rel-r1', target: 'ent-e2', type: 'cardinality', label: 'N', data: { cardinality: 'N', isTotal: true, doubleLine: true } },
      { id: 'e-e2-a21', source: 'ent-e2', target: 'attr-e21', type: 'cardinality' },
      { id: 'e-e2-a22', source: 'ent-e2', target: 'attr-e22', type: 'cardinality' },
      { id: 'e-r2-e2', source: 'rel-r2', target: 'ent-e2', type: 'cardinality', label: 'M', data: { cardinality: 'M' } },
      { id: 'e-r2-e3', source: 'rel-r2', target: 'ent-e3', type: 'cardinality', label: 'N', data: { cardinality: 'N' } },
      { id: 'e-r2-attr', source: 'rel-r2', target: 'attr-r2-date', type: 'cardinality' },
      { id: 'e-e3-a31', source: 'ent-e3', target: 'attr-e31', type: 'cardinality' },
      { id: 'e-e3-a32', source: 'ent-e3', target: 'attr-e32', type: 'cardinality' },
    ],
    subQuestions: [
      {
        id: 'sq-min-tables',
        prompt: 'What is the minimum number of relational tables required in 1NF/3NF to represent this ER diagram without any redundancy or NULL anomalies?',
        type: 'numerical',
        correctAnswer: 4,
        explanation: 'The 4 relations required are: 1) E1(e11, e12), 2) E2(e21, e22, e11), 3) E3(e31, e32), and 4) R2(e21, e31, r2_date). R1 merges into E2 due to 1:N total participation, while R2 requires a dedicated table due to M:N cardinality.',
      },
      {
        id: 'sq-primary-key-e2',
        prompt: 'What is the Primary Key of the relation resulting from the merged entity E2 and relationship R1?',
        type: 'mcq',
        options: ['{e21}', '{e11}', '{e21, e11}', '{e21, e22}'],
        correctAnswer: '{e21}',
        explanation: 'In a 1:N relationship from E1 to E2, each entity instance of E2 is associated with at most one instance of E1. Hence, the primary key of E2 ({e21}) uniquely determines the entire tuple, including the foreign key e11.',
      },
      {
        id: 'sq-foreign-key-placement',
        prompt: 'Which relation contains the foreign key corresponding to relationship R1, and what constraint must be applied to it?',
        type: 'mcq',
        options: [
          'Table E2 contains foreign key e11 with a NOT NULL constraint',
          'Table E1 contains foreign key e21 with a NOT NULL constraint',
          'A separate junction table R1 contains composite keys {e11, e21}',
          'Table E3 contains foreign key e21 referencing E2',
        ],
        correctAnswer: 'Table E2 contains foreign key e11 with a NOT NULL constraint',
        explanation: 'Because relationship R1 is 1:N with total participation on the N-side (E2), the primary key of E1 (e11) is placed in table E2 as a foreign key. The total participation guarantees that every row in E2 must have a valid e11, enforcing NOT NULL.',
      },
      {
        id: 'sq-rel-r2-separation-reason',
        prompt: 'Explain why relationship R2 cannot be combined into either E2 or E3, and describe the candidate key of the resulting relation.',
        type: 'text',
        correctAnswer: 'Relationship R2 is Many-to-Many (M:N). If R2 were embedded into E2, an instance of E2 associated with multiple E3 entities would require multivalued attributes (violating 1NF) or multiple duplicate rows for E2. Similarly, embedding R2 into E3 would cause anomalies for E3 instances associated with multiple E2 entities. Therefore, R2 must be represented as a separate junction table R2(e21, e31, r2_date) whose composite primary/candidate key is {e21, e31}.',
        explanation: 'M:N relationships strictly necessitate a distinct relational schema containing the primary keys of both participating entities along with any descriptive attributes. The candidate key of the junction table is the composite set of both foreign keys: {e21, e31}.',
      },
    ],
  },
  {
    id: 'gate-cs-analysis-weak-entity-keys',
    exam: 'GATE CS',
    year: '2015',
    paper: 'Computer Science & Information Technology',
    category: 'Diagram Analysis',
    type: 'diagram_analysis',
    title: 'Diagram Analysis: Weak Entity Set & Candidate Key Identification',
    difficulty: 'Medium',
    statement:
      'Analyze the provided Chen ER diagram containing strong entity Department (PK: DeptID, attribute: DName, Budget), weak entity Course (Partial Key: CourseCode, attribute: Credits), identifying relationship Offers (1:N with total participation of Course, denoted by double rectangle and double diamond), and strong entity Instructor (PK: InstID, attribute: IName) connected to Course via 1:N relationship Teaches (partial participation). Determine key formations and relational integrity rules.',
    expectedTablesCount: 3,
    expectedTablesExplanation:
      '1) Department(DeptID, DName, Budget). 2) Course(DeptID, CourseCode, Credits, InstID) with PK {DeptID, CourseCode}, FK DeptID ref Department, and FK InstID ref Instructor. 3) Instructor(InstID, IName). Total = 3 tables.',
    constraintsSummary: [
      'Strong Entity Department with primary key DeptID',
      'Weak Entity Course with partial discriminator CourseCode and attribute Credits',
      'Identifying Relationship Offers (1:N, total participation for Course)',
      'Strong Entity Instructor with primary key InstID',
      '1:N Relationship Teaches from Instructor (1) to Course (N) with partial participation',
    ],
    hints: [
      'A weak entity does not possess a primary key on its own. Its candidate key is formed by concatenating the primary key of the identifying owner entity with its partial key.',
      'The identifying relationship Offers is automatically absorbed into the weak entity table Course.',
    ],
    explanation:
      'Relational schema decomposition:\n1. Department(DeptID, DName, Budget) with PK {DeptID}.\n2. Course is a weak entity identified by Department through Offers. The partial discriminator is CourseCode. The primary key of Course becomes the composite key {DeptID, CourseCode}.\n3. Relationship Teaches is 1:N from Instructor to Course. Because Course is on the N-side, InstID is placed in table Course as a nullable Foreign Key.\n4. Table Course schema: Course(DeptID, CourseCode, Credits, InstID) where {DeptID, CourseCode} is the Primary Key, DeptID is FK referencing Department, and InstID is FK referencing Instructor.\n5. Instructor(InstID, IName) with PK {InstID}.\n\nTotal relational tables = 3.',
    initialNodes: [
      { id: 'ent-dept', type: 'entity', position: { x: 100, y: 180 }, data: { label: 'Department' } },
      { id: 'attr-dept-id', type: 'attribute', position: { x: 40, y: 70 }, data: { label: 'DeptID', isPrimary: true } },
      { id: 'attr-dept-name', type: 'attribute', position: { x: 160, y: 70 }, data: { label: 'DName' } },
      { id: 'rel-offers', type: 'relationship', position: { x: 300, y: 180 }, data: { label: 'Offers', isIdentifying: true } },
      { id: 'ent-course', type: 'entity', position: { x: 500, y: 180 }, data: { label: 'Course', isWeak: true } },
      { id: 'attr-course-code', type: 'attribute', position: { x: 440, y: 70 }, data: { label: 'CourseCode', isPartialKey: true } },
      { id: 'attr-course-credits', type: 'attribute', position: { x: 570, y: 70 }, data: { label: 'Credits' } },
      { id: 'rel-teaches', type: 'relationship', position: { x: 500, y: 340 }, data: { label: 'Teaches' } },
      { id: 'ent-instructor', type: 'entity', position: { x: 500, y: 490 }, data: { label: 'Instructor' } },
      { id: 'attr-inst-id', type: 'attribute', position: { x: 410, y: 580 }, data: { label: 'InstID', isPrimary: true } },
      { id: 'attr-inst-name', type: 'attribute', position: { x: 580, y: 580 }, data: { label: 'IName' } },
    ],
    initialEdges: [
      { id: 'e-dept-id', source: 'ent-dept', target: 'attr-dept-id', type: 'cardinality' },
      { id: 'e-dept-name', source: 'ent-dept', target: 'attr-dept-name', type: 'cardinality' },
      { id: 'e-offers-dept', source: 'rel-offers', target: 'ent-dept', type: 'cardinality', label: '1', data: { cardinality: '1' } },
      { id: 'e-offers-course', source: 'rel-offers', target: 'ent-course', type: 'cardinality', label: 'N', data: { cardinality: 'N', isTotal: true, doubleLine: true } },
      { id: 'e-course-code', source: 'ent-course', target: 'attr-course-code', type: 'cardinality' },
      { id: 'e-course-credits', source: 'ent-course', target: 'attr-course-credits', type: 'cardinality' },
      { id: 'e-teaches-course', source: 'rel-teaches', target: 'ent-course', type: 'cardinality', label: 'N', data: { cardinality: 'N' } },
      { id: 'e-teaches-inst', source: 'rel-teaches', target: 'ent-instructor', type: 'cardinality', label: '1', data: { cardinality: '1' } },
      { id: 'e-inst-id', source: 'ent-instructor', target: 'attr-inst-id', type: 'cardinality' },
      { id: 'e-inst-name', source: 'ent-instructor', target: 'attr-inst-name', type: 'cardinality' },
    ],
    subQuestions: [
      {
        id: 'sq-weak-pk',
        prompt: 'What is the Candidate Key / Primary Key for the relational schema corresponding to the weak entity Course?',
        type: 'mcq',
        options: ['{DeptID, CourseCode}', '{CourseCode}', '{DeptID}', '{InstID, CourseCode}'],
        correctAnswer: '{DeptID, CourseCode}',
        explanation: 'A weak entity set lacks sufficient attributes to form a primary key. Its primary key is formed by the primary key of the identifying strong entity ({DeptID}) combined with the partial discriminator of the weak entity ({CourseCode}).',
      },
      {
        id: 'sq-weak-fk-count',
        prompt: 'How many distinct Foreign Keys are present in the resulting relational table Course(DeptID, CourseCode, Credits, InstID)?',
        type: 'numerical',
        correctAnswer: 2,
        explanation: 'Table Course contains 2 Foreign Keys: 1) DeptID referencing Department(DeptID) from the identifying relationship Offers, and 2) InstID referencing Instructor(InstID) from the 1:N relationship Teaches.',
      },
      {
        id: 'sq-weak-referential-action',
        prompt: 'If a Department record is deleted from the database, which referential integrity action must be triggered on the Course relation to maintain existence dependency?',
        type: 'mcq',
        options: [
          'ON DELETE CASCADE on foreign key DeptID',
          'ON DELETE SET NULL on foreign key DeptID',
          'ON DELETE SET DEFAULT on foreign key DeptID',
          'NO ACTION allowing orphan course tuples',
        ],
        correctAnswer: 'ON DELETE CASCADE on foreign key DeptID',
        explanation: 'Because Course has an existence dependency on Department (weak entity constraint), the deletion of an owner department implies that all its offered courses cease to exist. Thus, ON DELETE CASCADE is mandatory.',
      },
      {
        id: 'sq-weak-partial-key-theory',
        prompt: 'Explain why the partial key CourseCode alone cannot uniquely identify a course instance across the database.',
        type: 'text',
        correctAnswer: 'The partial key (discriminator) CourseCode only guarantees uniqueness among courses offered within the same department (for example, CS101 vs CS102). Different departments may use the identical course code (e.g., Mathematics department offering CS101/MATH101 or both using code 101). To achieve global uniqueness across all records in the entire database, the identifying parent primary key (DeptID) must be prepended to the partial key.',
        explanation: 'Partial keys are local identifiers within the scope of a single owner entity instance. Global uniqueness in the relational model requires the composite combination of the owner primary key and the discriminator.',
      },
    ],
  },
  {
    id: 'gate-cs-analysis-eer-specialization-schemes',
    exam: 'GATE CS',
    year: '2021',
    paper: 'Computer Science & Information Technology',
    category: 'Diagram Analysis',
    type: 'diagram_analysis',
    title: 'Diagram Analysis: EER Specialization (Table-Per-Type vs Table-Per-Hierarchy)',
    difficulty: 'Hard',
    statement:
      'Analyze the given Extended ER (EER) diagram showing superclass Entity Employee (PK: EmpID, Name, Salary) specialized with a Disjoint (d) Total Completeness (=) constraint into two subclasses: Engineer (Skill, Level) and Manager (Bonus, DeptManaged). Compare relational mapping methodologies: Table-Per-Type (TPT / Normalized 3NF) versus Table-Per-Hierarchy (TPH / Single Table).',
    expectedTablesCount: 3,
    expectedTablesExplanation:
      'TPT produces 3 tables: Employee(EmpID, Name, Salary), Engineer(EmpID, Skill, Level), and Manager(EmpID, Bonus, DeptManaged). TPH produces 1 table: Employee(EmpID, Name, Salary, JobType, Skill, Level, Bonus, DeptManaged).',
    constraintsSummary: [
      'Superclass Entity Employee with PK EmpID and attributes Name, Salary',
      'Disjoint Specialization (d): An employee cannot simultaneously be an Engineer and a Manager',
      'Total Completeness (= double line): Every employee must belong to at least one subclass (Engineer or Manager)',
      'Subclass Engineer with attributes Skill, Level',
      'Subclass Manager with attributes Bonus, DeptManaged',
    ],
    hints: [
      'Table-Per-Type (TPT) maintains 3NF normalization where each entity (super and sub) gets its own distinct table connected via Foreign Keys.',
      'Table-Per-Hierarchy (TPH) collapses all subclasses into a single flat table using a discriminator column.',
    ],
    explanation:
      'EER Specialization Mapping Comparison:\n1. Table-Per-Type (TPT / 3NF Mapping):\n   - Table 1: Employee(EmpID, Name, Salary) with PK {EmpID}\n   - Table 2: Engineer(EmpID, Skill, Level) with PK {EmpID} and FK EmpID ref Employee\n   - Table 3: Manager(EmpID, Bonus, DeptManaged) with PK {EmpID} and FK EmpID ref Employee\n   Total tables = 3.\n\n2. Table-Per-Hierarchy (TPH / Single-Table Mapping):\n   - Table: Employee(EmpID, Name, Salary, EmpType_Discriminator, Skill, Level, Bonus, DeptManaged)\n   Total tables = 1.\n\n3. Table-Per-Concrete-Class (TPC / Subclass-Only Mapping):\n   Because specialization is total and disjoint, we can map to 2 tables: Engineer(EmpID, Name, Salary, Skill, Level) and Manager(EmpID, Name, Salary, Bonus, DeptManaged).\n   Total tables = 2.',
    initialNodes: [
      { id: 'ent-emp', type: 'entity', position: { x: 300, y: 100 }, data: { label: 'Employee', isSuperclass: true } },
      { id: 'attr-emp-id', type: 'attribute', position: { x: 180, y: 20 }, data: { label: 'EmpID', isPrimary: true } },
      { id: 'attr-emp-name', type: 'attribute', position: { x: 300, y: 20 }, data: { label: 'Name' } },
      { id: 'attr-emp-salary', type: 'attribute', position: { x: 420, y: 20 }, data: { label: 'Salary' } },
      { id: 'spec-emp', type: 'specialization', position: { x: 300, y: 220 }, data: { label: 'd', specType: 'disjoint', isTotal: true } },
      { id: 'ent-engineer', type: 'entity', position: { x: 150, y: 340 }, data: { label: 'Engineer', isSubclass: true } },
      { id: 'attr-eng-skill', type: 'attribute', position: { x: 60, y: 440 }, data: { label: 'Skill' } },
      { id: 'attr-eng-level', type: 'attribute', position: { x: 190, y: 440 }, data: { label: 'Level' } },
      { id: 'ent-manager', type: 'entity', position: { x: 450, y: 340 }, data: { label: 'Manager', isSubclass: true } },
      { id: 'attr-mgr-bonus', type: 'attribute', position: { x: 390, y: 440 }, data: { label: 'Bonus' } },
      { id: 'attr-mgr-dept', type: 'attribute', position: { x: 530, y: 440 }, data: { label: 'DeptManaged' } },
    ],
    initialEdges: [
      { id: 'e-emp-id', source: 'ent-emp', target: 'attr-emp-id', type: 'cardinality' },
      { id: 'e-emp-name', source: 'ent-emp', target: 'attr-emp-name', type: 'cardinality' },
      { id: 'e-emp-salary', source: 'ent-emp', target: 'attr-emp-salary', type: 'cardinality' },
      { id: 'e-emp-spec', source: 'ent-emp', target: 'spec-emp', type: 'cardinality', label: 'ISA', data: { cardinality: 'ISA', isTotal: true, doubleLine: true } },
      { id: 'e-spec-eng', source: 'spec-emp', target: 'ent-engineer', type: 'cardinality', label: 'Subclass', data: { cardinality: 'Subclass' } },
      { id: 'e-spec-mgr', source: 'spec-emp', target: 'ent-manager', type: 'cardinality', label: 'Subclass', data: { cardinality: 'Subclass' } },
      { id: 'e-eng-skill', source: 'ent-engineer', target: 'attr-eng-skill', type: 'cardinality' },
      { id: 'e-eng-level', source: 'ent-engineer', target: 'attr-eng-level', type: 'cardinality' },
      { id: 'e-mgr-bonus', source: 'ent-manager', target: 'attr-mgr-bonus', type: 'cardinality' },
      { id: 'e-mgr-dept', source: 'ent-manager', target: 'attr-mgr-dept', type: 'cardinality' },
    ],
    subQuestions: [
      {
        id: 'sq-tpt-table-count',
        prompt: 'Under the Table-Per-Type (TPT / Normalized 3NF) mapping strategy, what is the exact number of relational tables produced?',
        type: 'numerical',
        correctAnswer: 3,
        explanation: 'TPT creates exactly 3 tables: 1) Employee(EmpID, Name, Salary), 2) Engineer(EmpID, Skill, Level), and 3) Manager(EmpID, Bonus, DeptManaged). Each subclass table uses EmpID as both its primary key and foreign key referencing Employee.',
      },
      {
        id: 'sq-tph-table-count',
        prompt: 'Under the Table-Per-Hierarchy (TPH / Single-Table) mapping strategy, what is the exact number of relational tables produced?',
        type: 'numerical',
        correctAnswer: 1,
        explanation: 'TPH maps the entire hierarchy into a single relation: Employee(EmpID, Name, Salary, JobType, Skill, Level, Bonus, DeptManaged).',
      },
      {
        id: 'sq-tph-null-drawback',
        prompt: 'What is the primary drawback regarding attribute constraints when employing Table-Per-Hierarchy (TPH)?',
        type: 'mcq',
        options: [
          'Subclass-specific attributes (Skill, Level, Bonus, DeptManaged) must allow NULL values for instances belonging to other subclasses',
          'Primary key uniqueness is violated across subclasses',
          'Queries on superclass attributes require multi-table JOINs',
          'Foreign key referential integrity cannot be defined for the superclass',
        ],
        correctAnswer: 'Subclass-specific attributes (Skill, Level, Bonus, DeptManaged) must allow NULL values for instances belonging to other subclasses',
        explanation: 'In a single-table hierarchy, when a tuple represents an Engineer, the Manager-specific columns (Bonus, DeptManaged) must contain NULL. Conversely, for a Manager tuple, Skill and Level must be NULL. Hence, subclass attributes cannot have NOT NULL constraints.',
      },
      {
        id: 'sq-eer-tradeoffs-theory',
        prompt: 'Contrast Table-Per-Type (TPT) and Table-Per-Hierarchy (TPH) in terms of query execution performance (JOIN overhead) versus disk storage efficiency.',
        type: 'text',
        correctAnswer: 'Table-Per-Hierarchy (TPH) provides optimal query performance because polymorphic queries and subclass lookups require zero JOIN operations (single-table SELECT). However, TPH wastes storage through sparse rows and abundant NULL entries. Conversely, Table-Per-Type (TPT) is fully normalized in 3NF with zero wasted NULL columns, but suffers from JOIN performance overhead because retrieving an engineer or manager requires joining the subclass table with the superclass Employee table.',
        explanation: 'TPH optimizes for read speed at the expense of storage sparsity, whereas TPT optimizes for clean relational normalization and domain constraint enforcement at the expense of query JOIN latency.',
      },
    ],
  },
  {
    id: 'gate-cs-analysis-ternary-cardinality',
    exam: 'GATE CS',
    year: '2019',
    paper: 'Computer Science & Information Technology',
    category: 'Diagram Analysis',
    type: 'diagram_analysis',
    title: 'Diagram Analysis: Ternary Relationship & Functional Dependencies',
    difficulty: 'Hard',
    statement:
      'Analyze the given ER diagram depicting a ternary relationship Supply linking three independent strong entities: Supplier (PK: SuppID, attribute: SName), Part (PK: PartID, attribute: PName), and Project (PK: ProjID, attribute: Title). The relationship has cardinality Many-to-Many-to-Many (M:N:P) and carries a descriptive relationship attribute Quantity. Analyze table generation and connection traps.',
    expectedTablesCount: 4,
    expectedTablesExplanation:
      '1) Supplier(SuppID, SName). 2) Part(PartID, PName). 3) Project(ProjID, Title). 4) Supply(SuppID, PartID, ProjID, Quantity) with composite PK {SuppID, PartID, ProjID}. Total = 4 tables.',
    constraintsSummary: [
      'Strong Entity Supplier with PK SuppID and attribute SName',
      'Strong Entity Part with PK PartID and attribute PName',
      'Strong Entity Project with PK ProjID and attribute Title',
      'Ternary Relationship Supply connecting Supplier (M), Part (N), and Project (P)',
      'Descriptive attribute Quantity attached to Supply relationship',
    ],
    hints: [
      'A ternary relationship involving three strong entities with M:N:P cardinality requires a separate junction table whose primary key is the composite combination of all three participating primary keys.',
      'Decomposing an authentic ternary relationship into binary pairs causes loss of semantic association.',
    ],
    explanation:
      'Relational decomposition for Ternary Relationship:\n1. Entity Supplier gives Supplier(SuppID, SName) with PK {SuppID}.\n2. Entity Part gives Part(PartID, PName) with PK {PartID}.\n3. Entity Project gives Project(ProjID, Title) with PK {ProjID}.\n4. Ternary relationship Supply is M:N:P. It produces table Supply(SuppID, PartID, ProjID, Quantity) with composite Primary Key {SuppID, PartID, ProjID} and three Foreign Keys referencing the three strong entity tables.\n\nTotal relational tables required = 4.',
    initialNodes: [
      { id: 'ent-supplier', type: 'entity', position: { x: 100, y: 100 }, data: { label: 'Supplier' } },
      { id: 'attr-supp-id', type: 'attribute', position: { x: 30, y: 20 }, data: { label: 'SuppID', isPrimary: true } },
      { id: 'attr-supp-name', type: 'attribute', position: { x: 160, y: 20 }, data: { label: 'SName' } },
      { id: 'ent-part', type: 'entity', position: { x: 500, y: 100 }, data: { label: 'Part' } },
      { id: 'attr-part-id', type: 'attribute', position: { x: 440, y: 20 }, data: { label: 'PartID', isPrimary: true } },
      { id: 'attr-part-name', type: 'attribute', position: { x: 570, y: 20 }, data: { label: 'PName' } },
      { id: 'rel-supply', type: 'relationship', position: { x: 300, y: 240 }, data: { label: 'Supply' } },
      { id: 'attr-quantity', type: 'attribute', position: { x: 450, y: 240 }, data: { label: 'Quantity' } },
      { id: 'ent-project', type: 'entity', position: { x: 300, y: 400 }, data: { label: 'Project' } },
      { id: 'attr-proj-id', type: 'attribute', position: { x: 210, y: 490 }, data: { label: 'ProjID', isPrimary: true } },
      { id: 'attr-proj-title', type: 'attribute', position: { x: 380, y: 490 }, data: { label: 'Title' } },
    ],
    initialEdges: [
      { id: 'e-supp-id', source: 'ent-supplier', target: 'attr-supp-id', type: 'cardinality' },
      { id: 'e-supp-name', source: 'ent-supplier', target: 'attr-supp-name', type: 'cardinality' },
      { id: 'e-part-id', source: 'ent-part', target: 'attr-part-id', type: 'cardinality' },
      { id: 'e-part-name', source: 'ent-part', target: 'attr-part-name', type: 'cardinality' },
      { id: 'e-supply-supp', source: 'rel-supply', target: 'ent-supplier', type: 'cardinality', label: 'M', data: { cardinality: 'M' } },
      { id: 'e-supply-part', source: 'rel-supply', target: 'ent-part', type: 'cardinality', label: 'N', data: { cardinality: 'N' } },
      { id: 'e-supply-proj', source: 'rel-supply', target: 'ent-project', type: 'cardinality', label: 'P', data: { cardinality: 'P' } },
      { id: 'e-supply-qty', source: 'rel-supply', target: 'attr-quantity', type: 'cardinality' },
      { id: 'e-proj-id', source: 'ent-project', target: 'attr-proj-id', type: 'cardinality' },
      { id: 'e-proj-title', source: 'ent-project', target: 'attr-proj-title', type: 'cardinality' },
    ],
    subQuestions: [
      {
        id: 'sq-ternary-table-count',
        prompt: 'What is the minimum number of relational tables needed in 1NF to represent this entire ternary ER schema without information loss?',
        type: 'numerical',
        correctAnswer: 4,
        explanation: 'Four tables are needed: 1) Supplier(SuppID, SName), 2) Part(PartID, PName), 3) Project(ProjID, Title), and 4) Supply(SuppID, PartID, ProjID, Quantity).',
      },
      {
        id: 'sq-ternary-pk',
        prompt: 'What is the Primary Key of the table corresponding to the ternary relationship Supply with cardinality M:N:P?',
        type: 'mcq',
        options: ['{SuppID, PartID, ProjID}', '{SuppID, PartID}', '{ProjID, PartID}', '{SuppID, ProjID}'],
        correctAnswer: '{SuppID, PartID, ProjID}',
        explanation: 'Because the relationship is Many-to-Many-to-Many across all 3 entities, no single entity or pair of entities uniquely determines the third. Therefore, all three primary keys must be concatenated to form the composite Primary Key: {SuppID, PartID, ProjID}.',
      },
      {
        id: 'sq-ternary-trap-theory',
        prompt: 'Explain why replacing this ternary relationship with three binary relationships (Supplier-Part, Part-Project, Supplier-Project) creates a connection trap and generates spurious tuples.',
        type: 'text',
        correctAnswer: 'A ternary relationship records the atomic 3-way fact that a specific Supplier S supplies a specific Part P for a specific Project J. If replaced by three binary relations (S-P, P-J, S-J), the database only records pairwise associations. When performing a natural join on these three binary relations, spurious tuples (false combinations) are generated because the system cannot verify if supplier S actually supplied part P specifically for project J, or for some other project.',
        explanation: 'Binary decomposition of an irreducible ternary relationship loses the 3-way binding semantic constraint, leading to lossy reconstruction and spurious tuples during relational joins.',
      },
    ],
  },
];
