export interface QuadraticSubQuestion {
  id: string;
  prompt: string;
  type: 'mcq' | 'numerical' | 'text';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
}

export interface ExpectedSlotState {
  index: number;
  key: number | null;
  probeCount?: number;
  originalHash?: number;
}

export interface QuadraticPracticeQuestion {
  id: string;
  exam: string;
  year: string;
  paper: string;
  category: 'Probe Sequence' | 'Collision Resolution' | 'Table State' | 'Search & Cost' | 'Theory & Clustering';
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  statement: string;
  tableSize: number;
  keys: number[];
  c1: number;
  c2: number;
  hashFormulaDisplay: string;
  constraintsSummary: string[];
  hints: string[];
  explanation: string;
  subQuestions: QuadraticSubQuestion[];
  expectedTableState?: ExpectedSlotState[];
}

export const QUADRATIC_PRACTICE_QUESTIONS: QuadraticPracticeQuestion[] = [
  {
    id: 'gate-cs-2021-size11-consecutive',
    exam: 'GATE CS',
    year: '2021',
    paper: 'Computer Science & Information Technology',
    category: 'Collision Resolution',
    title: 'Quadratic Probing with Table Size 11 & Consecutive Hash Collisions',
    difficulty: 'Medium',
    tableSize: 11,
    keys: [43, 23, 1, 61, 28, 15],
    c1: 0,
    c2: 1,
    hashFormulaDisplay: 'h(k, i) = (k + i²) mod 11',
    statement:
      'Given an open addressing hash table of size M = 11 with hash function h(k) = k mod 11. Collisions are resolved using Quadratic Probing with the formula h(k, i) = (h(k) + i²) mod 11, where i = 0, 1, 2, ... represents the probe attempt number. The keys 43, 23, 1, 61, 28, and 15 are inserted in that order into an initially empty hash table. Trace the insertion sequence, determine collision counts, and identify final key placements.',
    constraintsSummary: [
      'Hash table size M = 11 (Prime number)',
      'Primary hash function: h(k) = k mod 11',
      'Quadratic probe sequence: offset i² (c₁ = 0, c₂ = 1)',
      'Insertion order: 43, 23, 1, 61, 28, 15',
    ],
    hints: [
      'Calculate the initial hash for each key: h(43) = 10, h(23) = 1, h(1) = 1, h(61) = 6, h(28) = 6, h(15) = 4.',
      'Key 1 collides with key 23 at slot 1. For i = 1, calculate (1 + 1²) mod 11 = 2 (Empty).',
      'Key 28 collides with key 61 at slot 6. For i = 1, calculate (6 + 1²) mod 11 = 7 (Empty).',
      'Key 15 has h(15) = 15 mod 11 = 4. Check if slot 4 is currently occupied.',
    ],
    explanation:
      'Detailed step-by-step trace:\n' +
      '1. Insert 43: h(43) = 43 mod 11 = 10. Slot 10 is empty -> Stored at index 10 (0 collisions, 1 probe).\n' +
      '2. Insert 23: h(23) = 23 mod 11 = 1. Slot 1 is empty -> Stored at index 1 (0 collisions, 1 probe).\n' +
      '3. Insert 1: h(1) = 1 mod 11 = 1. Slot 1 is occupied by 23! Probe i=1: (1 + 1²) mod 11 = 2. Slot 2 is empty -> Stored at index 2 (1 collision, 2 probes).\n' +
      '4. Insert 61: h(61) = 61 mod 11 = 6. Slot 6 is empty -> Stored at index 6 (0 collisions, 1 probe).\n' +
      '5. Insert 28: h(28) = 28 mod 11 = 6. Slot 6 is occupied by 61! Probe i=1: (6 + 1²) mod 11 = 7. Slot 7 is empty -> Stored at index 7 (1 collision, 2 probes).\n' +
      '6. Insert 15: h(15) = 15 mod 11 = 4. Slot 4 is empty -> Stored at index 4 (0 collisions, 1 probe).\n' +
      'Total collisions across all insertions = 2. Total probes = 8.',
    subQuestions: [
      {
        id: 'q1-1',
        prompt: 'At which index in the hash table is key 15 stored?',
        type: 'numerical',
        correctAnswer: 4,
        explanation: 'h(15) = 15 mod 11 = 4. Since slot 4 is empty, key 15 is directly placed at index 4 on the first probe.',
      },
      {
        id: 'q1-2',
        prompt: 'At which index in the hash table is key 1 stored?',
        type: 'numerical',
        correctAnswer: 2,
        explanation: 'h(1) = 1 mod 11 = 1, which is occupied by key 23. Probe i=1 yields (1 + 1²) mod 11 = 2, which is empty. Thus key 1 is stored at index 2.',
      },
      {
        id: 'q1-3',
        prompt: 'What is the total number of collisions that occur during the insertion of all 6 keys?',
        type: 'numerical',
        correctAnswer: 2,
        explanation: 'Key 1 collides at slot 1 (1 collision). Key 28 collides at slot 6 (1 collision). Keys 43, 23, 61, 15 do not collide. Total = 1 + 1 = 2.',
      },
      {
        id: 'q1-4',
        prompt: 'If key 37 is inserted next into this table, which slot will it occupy?',
        type: 'mcq',
        options: ['Slot 4', 'Slot 5', 'Slot 8', 'Slot 9'],
        correctAnswer: 'Slot 5',
        explanation: 'h(37) = 37 mod 11 = 4. Slot 4 is already occupied by key 15. Probe i=1 yields (4 + 1²) mod 11 = 5. Slot 5 is empty, so key 37 is placed in Slot 5.',
      },
    ],
    expectedTableState: [
      { index: 0, key: null },
      { index: 1, key: 23, probeCount: 1, originalHash: 1 },
      { index: 2, key: 1, probeCount: 2, originalHash: 1 },
      { index: 3, key: null },
      { index: 4, key: 15, probeCount: 1, originalHash: 4 },
      { index: 5, key: null },
      { index: 6, key: 61, probeCount: 1, originalHash: 6 },
      { index: 7, key: 28, probeCount: 2, originalHash: 6 },
      { index: 8, key: null },
      { index: 9, key: null },
      { index: 10, key: 43, probeCount: 1, originalHash: 10 },
    ],
  },
  {
    id: 'gate-cs-2017-linear-quadratic-constants',
    exam: 'GATE CS',
    year: '2017',
    paper: 'Computer Science & Information Technology',
    category: 'Probe Sequence',
    title: 'Probing with Linear and Quadratic Terms (c₁ = 1, c₂ = 1)',
    difficulty: 'Medium',
    tableSize: 7,
    keys: [10, 20, 30, 40, 17],
    c1: 1,
    c2: 1,
    hashFormulaDisplay: 'h(k, i) = (k + i + i²) mod 7',
    statement:
      'An open-addressed hash table of size m = 7 uses the hash function h(k) = k mod 7 and quadratic probing defined by h(k, i) = (h(k) + i + i²) mod 7, where i = 0, 1, 2, ... The keys 10, 20, 30, 40, and 17 are inserted sequentially into an initially empty hash table. Find the final index where key 17 is stored, the number of collisions it encounters, and the sequence of probed slots.',
    constraintsSummary: [
      'Table size m = 7',
      'Hash function: h(k) = k mod 7',
      'Formula constants: c₁ = 1, c₂ = 1 -> offset (i + i²)',
      'Keys inserted in order: 10, 20, 30, 40, 17',
    ],
    hints: [
      'h(10) = 3 (Slot 3), h(20) = 6 (Slot 6), h(30) = 2 (Slot 2), h(40) = 5 (Slot 5).',
      'For key 17: h(17) = 3. Slot 3 is occupied by key 10.',
      'Check i=1: (3 + 1 + 1²) mod 7 = 5 mod 7 = 5 (occupied by 40).',
      'Check i=2: (3 + 2 + 4) mod 7 = 9 mod 7 = 2 (occupied by 30).',
      'Check i=3: (3 + 3 + 9) mod 7 = 15 mod 7 = 1 (check if empty).',
    ],
    explanation:
      'Insertion steps:\n' +
      '1. Key 10: h(10) = 10 mod 7 = 3 -> Slot 3 (empty).\n' +
      '2. Key 20: h(20) = 20 mod 7 = 6 -> Slot 6 (empty).\n' +
      '3. Key 30: h(30) = 30 mod 7 = 2 -> Slot 2 (empty).\n' +
      '4. Key 40: h(40) = 40 mod 7 = 5 -> Slot 5 (empty).\n' +
      '5. Key 17: h(17) = 17 mod 7 = 3.\n' +
      '   - i = 0: slot 3 -> Collides with 10!\n' +
      '   - i = 1: (3 + 1 + 1) mod 7 = 5 -> Collides with 40!\n' +
      '   - i = 2: (3 + 2 + 4) mod 7 = 9 mod 7 = 2 -> Collides with 30!\n' +
      '   - i = 3: (3 + 3 + 9) mod 7 = 15 mod 7 = 1 -> Slot 1 is EMPTY! Key 17 inserted into slot 1.',
    subQuestions: [
      {
        id: 'q2-1',
        prompt: 'At which index in the hash table is key 17 inserted?',
        type: 'numerical',
        correctAnswer: 1,
        explanation: 'At probe i=3, (3 + 3 + 3²) mod 7 = 15 mod 7 = 1. Slot 1 is empty, so key 17 is placed in slot 1.',
      },
      {
        id: 'q2-2',
        prompt: 'How many collisions does key 17 encounter before finding an empty slot?',
        type: 'numerical',
        correctAnswer: 3,
        explanation: 'Key 17 encounters collisions at slot 3 (i=0), slot 5 (i=1), and slot 2 (i=2), totaling 3 collisions.',
      },
      {
        id: 'q2-3',
        prompt: 'What is the exact sequence of table indices probed for key 17?',
        type: 'mcq',
        options: ['3, 5, 2, 1', '3, 4, 6, 1', '3, 5, 0, 1', '3, 6, 2, 1'],
        correctAnswer: '3, 5, 2, 1',
        explanation: 'i=0 gives 3; i=1 gives (3+2)%7=5; i=2 gives (3+6)%7=2; i=3 gives (3+12)%7=1. Hence sequence is 3, 5, 2, 1.',
      },
      {
        id: 'q2-4',
        prompt: 'What is the load factor (α = N / M) of the hash table after all 5 keys are inserted?',
        type: 'mcq',
        options: ['0.71', '0.50', '0.83', '0.60'],
        correctAnswer: '0.71',
        explanation: '5 slots out of 7 are occupied: α = 5 / 7 ≈ 0.714.',
      },
    ],
    expectedTableState: [
      { index: 0, key: null },
      { index: 1, key: 17, probeCount: 4, originalHash: 3 },
      { index: 2, key: 30, probeCount: 1, originalHash: 2 },
      { index: 3, key: 10, probeCount: 1, originalHash: 3 },
      { index: 4, key: null },
      { index: 5, key: 40, probeCount: 1, originalHash: 5 },
      { index: 6, key: 20, probeCount: 1, originalHash: 6 },
    ],
  },
  {
    id: 'gate-cs-2014-search-cost-size13',
    exam: 'GATE CS',
    year: '2014',
    paper: 'Computer Science & Information Technology',
    category: 'Search & Cost',
    title: 'Secondary Clustering & Search Probes in Size 13 Table',
    difficulty: 'Hard',
    tableSize: 13,
    keys: [25, 38, 12, 51, 64, 77],
    c1: 0,
    c2: 1,
    hashFormulaDisplay: 'h(k, i) = (k + i²) mod 13',
    statement:
      'Consider an initially empty hash table of size M = 13 with primary hash function h(k) = k mod 13 and quadratic probing formula h(k, i) = (h(k) + i²) mod 13. Notice that all keys {25, 38, 12, 51, 64, 77} produce the exact same primary hash: 12 mod 13 = 12. Evaluate the secondary clustering pattern, number of probes to search for key 77, and final index of 64.',
    constraintsSummary: [
      'Table size M = 13 (Prime)',
      'Primary hash h(k) = k mod 13 = 12 for all keys',
      'Quadratic offset: i² mod 13 (0, 1, 4, 9, 3, 12...)',
      'Keys inserted: 25, 38, 12, 51, 64, 77',
    ],
    hints: [
      'Because every key hashes to 12, each successive key follows the exact same probe sequence (Secondary Clustering).',
      'Offset sequence for base 12: i=0 -> 12; i=1 -> (12+1)%13 = 0; i=2 -> (12+4)%13 = 3; i=3 -> (12+9)%13 = 8; i=4 -> (12+16)%13 = 2; i=5 -> (12+25)%13 = 11.',
      'Key 25 takes slot 12 (1 probe). Key 38 takes slot 0 (2 probes). Key 12 takes slot 3 (3 probes)...',
    ],
    explanation:
      'Detailed trace of secondary clustering:\n' +
      '1. Key 25: i=0 -> slot 12. Placed at 12 (1 probe).\n' +
      '2. Key 38: i=0 -> 12 (occupied); i=1 -> (12+1)%13 = 0. Placed at 0 (2 probes).\n' +
      '3. Key 12: i=0 -> 12; i=1 -> 0; i=2 -> (12+4)%13 = 3. Placed at 3 (3 probes).\n' +
      '4. Key 51: i=0 -> 12; i=1 -> 0; i=2 -> 3; i=3 -> (12+9)%13 = 8. Placed at 8 (4 probes).\n' +
      '5. Key 64: i=0..3 occupied; i=4 -> (12+16)%13 = 28%13 = 2. Placed at 2 (5 probes).\n' +
      '6. Key 77: i=0..4 occupied; i=5 -> (12+25)%13 = 37%13 = 11. Placed at 11 (6 probes).\n' +
      'To search for 77, the algorithm must verify slots 12, 0, 3, 8, 2, and finally 11, requiring exactly 6 probes.',
    subQuestions: [
      {
        id: 'q3-1',
        prompt: 'How many probes are required to successfully locate key 77 in the hash table?',
        type: 'numerical',
        correctAnswer: 6,
        explanation: 'Searching for 77 checks slots 12, 0, 3, 8, 2, and 11, taking 6 probes.',
      },
      {
        id: 'q3-2',
        prompt: 'At which table index does key 64 reside?',
        type: 'numerical',
        correctAnswer: 2,
        explanation: 'Key 64 was inserted at probe i=4: (12 + 4²) mod 13 = 28 mod 13 = 2.',
      },
      {
        id: 'q3-3',
        prompt: 'What is the total number of collisions encountered across the insertion of all 6 keys?',
        type: 'numerical',
        correctAnswer: 15,
        explanation: 'Key 25: 0; Key 38: 1; Key 12: 2; Key 51: 3; Key 64: 4; Key 77: 5. Sum = 0 + 1 + 2 + 3 + 4 + 5 = 15 collisions.',
      },
      {
        id: 'q3-4',
        prompt: 'What is the average number of probes per key for this set of insertions?',
        type: 'mcq',
        options: ['3.5', '2.5', '4.0', '3.0'],
        correctAnswer: '3.5',
        explanation: 'Total probes = 1 + 2 + 3 + 4 + 5 + 6 = 21. Average probes = 21 / 6 = 3.5.',
      },
    ],
    expectedTableState: [
      { index: 0, key: 38, probeCount: 2, originalHash: 12 },
      { index: 1, key: null },
      { index: 2, key: 64, probeCount: 5, originalHash: 12 },
      { index: 3, key: 12, probeCount: 3, originalHash: 12 },
      { index: 4, key: null },
      { index: 5, key: null },
      { index: 6, key: null },
      { index: 7, key: null },
      { index: 8, key: 51, probeCount: 4, originalHash: 12 },
      { index: 9, key: null },
      { index: 10, key: null },
      { index: 11, key: 77, probeCount: 6, originalHash: 12 },
      { index: 12, key: 25, probeCount: 1, originalHash: 12 },
    ],
  },
  {
    id: 'gate-cs-2024-nat-multiples-shift',
    exam: 'GATE CS',
    year: '2024',
    paper: 'Computer Science & Information Technology',
    category: 'Table State',
    title: 'Sum of Indices for Multiples of Modulus with Shift (c₁ = 2, c₂ = 1)',
    difficulty: 'Hard',
    tableSize: 17,
    keys: [34, 51, 68],
    c1: 2,
    c2: 1,
    hashFormulaDisplay: 'h(k, i) = (k + 2i + i²) mod 17',
    statement:
      'An open addressing hash table of prime capacity M = 17 resolves collisions using quadratic probing with formula h(k, i) = (k mod 17 + 2i + i²) mod 17. Keys 34, 51, and 68 (all exact multiples of 17, so h(k) = 0) are inserted in order into the initially empty table. Find the sum of the slot indices where these three keys are stored.',
    constraintsSummary: [
      'Capacity M = 17 (Prime)',
      'Primary hash h(k) = k mod 17 = 0 for 34, 51, 68',
      'Probing polynomial: 2i + i²',
      'Keys to insert: 34, 51, 68',
    ],
    hints: [
      'h(34) = h(51) = h(68) = 0.',
      'Key 34: i=0 -> slot (0 + 0) mod 17 = 0. Placed in slot 0.',
      'Key 51: i=0 (occupied); i=1 -> (0 + 2(1) + 1²) mod 17 = 3 mod 17 = 3. Placed in slot 3.',
      'Key 68: i=0 (occupied), i=1 (occupied at slot 3); i=2 -> (0 + 2(2) + 2²) mod 17 = (4 + 4) mod 17 = 8.',
    ],
    explanation:
      'Step-by-step resolution:\n' +
      '1. Key 34: h(34) = 0. Slot 0 is empty -> stored at index 0.\n' +
      '2. Key 51: h(51) = 0 (occupied by 34).\n' +
      '   - i = 1: (0 + 2(1) + 1²) mod 17 = 3. Slot 3 is empty -> stored at index 3.\n' +
      '3. Key 68: h(68) = 0 (occupied).\n' +
      '   - i = 1: slot 3 (occupied by 51).\n' +
      '   - i = 2: (0 + 2(2) + 2²) mod 17 = (4 + 4) mod 17 = 8. Slot 8 is empty -> stored at index 8.\n' +
      'Sum of indices = 0 + 3 + 8 = 11.',
    subQuestions: [
      {
        id: 'q4-1',
        prompt: 'What is the sum of the slot indices where keys 34, 51, and 68 are stored? (NAT)',
        type: 'numerical',
        correctAnswer: 11,
        explanation: 'The keys are stored at indices 0, 3, and 8. Sum = 0 + 3 + 8 = 11.',
      },
      {
        id: 'q4-2',
        prompt: 'At which slot index is key 68 stored?',
        type: 'numerical',
        correctAnswer: 8,
        explanation: 'Key 68 requires probe i=2: (0 + 2*2 + 4) mod 17 = 8. It is stored at slot 8.',
      },
      {
        id: 'q4-3',
        prompt: 'What is the slot index probed on the 3rd collision attempt (probe i = 3) for any key hashing to 0?',
        type: 'numerical',
        correctAnswer: 15,
        explanation: '(0 + 2*3 + 3²) mod 17 = (6 + 9) mod 17 = 15.',
      },
    ],
    expectedTableState: [
      { index: 0, key: 34, probeCount: 1, originalHash: 0 },
      { index: 1, key: null },
      { index: 2, key: null },
      { index: 3, key: 51, probeCount: 2, originalHash: 0 },
      { index: 4, key: null },
      { index: 5, key: null },
      { index: 6, key: null },
      { index: 7, key: null },
      { index: 8, key: 68, probeCount: 3, originalHash: 0 },
      { index: 9, key: null },
      { index: 10, key: null },
      { index: 11, key: null },
      { index: 12, key: null },
      { index: 13, key: null },
      { index: 14, key: null },
      { index: 15, key: null },
      { index: 16, key: null },
    ],
  },
  {
    id: 'isro-cs-2020-quadratic-properties',
    exam: 'ISRO CS',
    year: '2020',
    paper: 'Computer Science Scientist/Engineer',
    category: 'Theory & Clustering',
    title: 'Quadratic Probing Guarantees & Secondary Clustering Analysis',
    difficulty: 'Medium',
    tableSize: 11,
    keys: [12, 23, 34, 45, 56],
    c1: 0,
    c2: 1,
    hashFormulaDisplay: 'h(k, i) = (k + i²) mod 11',
    statement:
      'Consider the theoretical foundations of Quadratic Probing in open addressing hash tables. Given table size M = 11 and formula h(k, i) = (h(k) + i²) mod 11. Answer the fundamental questions on insertion guarantees, clustering phenomena, and probe coverage.',
    constraintsSummary: [
      'Table size M is prime (M = 11)',
      'Probe offset: i² mod M',
      'Load factor threshold: α < 0.5',
    ],
    hints: [
      'Linear probing creates primary clustering (contiguous clusters). Quadratic probing eliminates primary clustering but retains secondary clustering.',
      'For prime M, quadratic probing with c₁=0, c₂=1 visits exactly (M + 1)/2 distinct slots in the first (M + 1)/2 probes.',
      'If load factor α ≤ 0.5, at least one of these (M + 1)/2 probed slots must be empty, guaranteeing insertion.',
    ],
    explanation:
      'Key theorems of Quadratic Probing:\n' +
      '1. Primary vs Secondary Clustering: Quadratic probing prevents primary clustering because probing jumps quadratically away from the collision. However, keys with the same initial hash h(k) trace the identical probe sequence, causing Secondary Clustering.\n' +
      '2. Prime Table Guarantee: If M is prime and α < 0.5, quadratic probing is guaranteed to find an empty slot. The distinct slots visited are (M + 1)/2 = (11 + 1)/2 = 6 unique slots.\n' +
      '3. Search time: Average case is O(1/(1-α)), but worst-case search is O(M).',
    subQuestions: [
      {
        id: 'q5-1',
        prompt: 'Which of the following statements about Quadratic Probing is TRUE?',
        type: 'mcq',
        options: [
          'It completely eliminates secondary clustering',
          'If table size M is prime and load factor α < 0.5, an empty slot is guaranteed to be found',
          'It is guaranteed to examine all M slots for any arbitrary table size',
          'Worst-case search time is O(1)',
        ],
        correctAnswer: 'If table size M is prime and load factor α < 0.5, an empty slot is guaranteed to be found',
        explanation: 'By the Quadratic Probing Theorem, if M is prime and α < 0.5, the first (M+1)/2 probes visit distinct slots, guaranteeing that at least one empty slot is found.',
      },
      {
        id: 'q5-2',
        prompt: 'If table size M = 11, what is the maximum number of distinct slots that the probe sequence (h(k) + i²) mod 11 can examine before repeating?',
        type: 'numerical',
        correctAnswer: 6,
        explanation: 'For prime M, the number of distinct quadratic residues is (M + 1)/2 = (11 + 1)/2 = 6 slots (0, 1, 4, 9, 5, 3).',
      },
      {
        id: 'q5-3',
        prompt: 'Why does secondary clustering occur in quadratic probing?',
        type: 'mcq',
        options: [
          'Keys with different initial hashes follow the same path',
          'Keys that hash to the same initial slot follow the exact same probe sequence',
          'The load factor exceeds 1.0',
          'Deleted slots cause infinite loops',
        ],
        correctAnswer: 'Keys that hash to the same initial slot follow the exact same probe sequence',
        explanation: 'Because the probe offset i² depends only on probe number i and not on key k, any two keys with the same primary hash will trace identical collision paths.',
      },
    ],
  },
  {
    id: 'ugc-net-cs-2019-power-of-two',
    exam: 'UGC NET CS',
    year: '2019',
    paper: 'Computer Science Paper II',
    category: 'Table State',
    title: 'Hopgood-Davenport Permutation on Power-of-2 Tables (c₁ = 0.5, c₂ = 0.5)',
    difficulty: 'Medium',
    tableSize: 8,
    keys: [16, 24, 32, 40],
    c1: 0.5,
    c2: 0.5,
    hashFormulaDisplay: 'h(k, i) = (k + 0.5i + 0.5i²) mod 8',
    statement:
      'When the hash table size M is a power of 2 (e.g. M = 8 = 2³), standard quadratic probing with i² fails to visit all slots. However, the Hopgood-Davenport formula h(k, i) = (h(k) + (i + i²)/2) mod 8 guarantees visiting every single slot 0, ..., M-1 (a complete permutation). Keys 16, 24, 32, and 40 (all having h(k) = 0) are inserted in order. Find the final placement of each key.',
    constraintsSummary: [
      'Table size M = 8 (Power of 2: 2³)',
      'Primary hash h(k) = k mod 8 = 0',
      'Offset formula: (i + i²)/2 mod 8',
      'Keys to insert: 16, 24, 32, 40',
    ],
    hints: [
      'Calculate (i + i²)/2 for each i:',
      'i=0: 0; i=1: (1+1)/2 = 1; i=2: (2+4)/2 = 3; i=3: (3+9)/2 = 6; i=4: (4+16)/2 = 10 mod 8 = 2.',
      'Check which slot each key fills sequentially.',
    ],
    explanation:
      'Offset evaluation:\n' +
      '- i=0: 0 -> Key 16 stored at index 0.\n' +
      '- i=1: (1+1)/2 = 1 -> Key 24 stored at index 1.\n' +
      '- i=2: (2+4)/2 = 3 -> Key 32 stored at index 3.\n' +
      '- i=3: (3+9)/2 = 6 -> Key 40 stored at index 6.\n' +
      'The offsets produced for i=0..7 are 0, 1, 3, 6, 2, 7, 5, 4, which is a full permutation of all 8 slots.',
    subQuestions: [
      {
        id: 'q6-1',
        prompt: 'At which index is key 32 stored?',
        type: 'numerical',
        correctAnswer: 3,
        explanation: 'At probe i=2: (0 + (2 + 4)/2) mod 8 = 3 mod 8 = 3. Slot 3 is empty, so key 32 is stored at slot 3.',
      },
      {
        id: 'q6-2',
        prompt: 'At which index is key 40 stored?',
        type: 'numerical',
        correctAnswer: 6,
        explanation: 'At probe i=3: (0 + (3 + 9)/2) mod 8 = 12/2 mod 8 = 6 mod 8 = 6. Key 40 is placed in slot 6.',
      },
      {
        id: 'q6-3',
        prompt: 'What is the full sequence of offsets produced by (i + i²)/2 mod 8 for i = 0 to 7?',
        type: 'mcq',
        options: [
          '0, 1, 3, 6, 2, 7, 5, 4',
          '0, 1, 4, 1, 0, 1, 4, 1',
          '0, 2, 4, 6, 0, 2, 4, 6',
          '0, 1, 2, 3, 4, 5, 6, 7',
        ],
        correctAnswer: '0, 1, 3, 6, 2, 7, 5, 4',
        explanation: 'The offsets are 0, 1, 3, 6, 10%8=2, 15%8=7, 21%8=5, 28%8=4. This is a complete permutation.',
      },
    ],
    expectedTableState: [
      { index: 0, key: 16, probeCount: 1, originalHash: 0 },
      { index: 1, key: 24, probeCount: 2, originalHash: 0 },
      { index: 2, key: null },
      { index: 3, key: 32, probeCount: 3, originalHash: 0 },
      { index: 4, key: null },
      { index: 5, key: null },
      { index: 6, key: 40, probeCount: 4, originalHash: 0 },
      { index: 7, key: null },
    ],
  },
  {
    id: 'gate-cs-2010-custom-hash-linear',
    exam: 'GATE CS',
    year: '2010',
    paper: 'Computer Science & Information Technology',
    category: 'Probe Sequence',
    title: 'Linear Modulo Primary Hash h(k) = (2k + 3) mod 11 with Quadratic Probing',
    difficulty: 'Medium',
    tableSize: 11,
    keys: [3, 5, 7, 12, 16],
    c1: 0,
    c2: 1,
    hashFormulaDisplay: 'h(k, i) = ((2k + 3) + i²) mod 11',
    statement:
      'An open-address hash table of size 11 uses the primary hash function h(k) = (2k + 3) mod 11 and resolves collisions using quadratic probing h(k, i) = (h(k) + i²) mod 11. The keys 3, 5, 7, 12, and 16 are inserted sequentially into an initially empty table. Find the initial hash of 16, the slot where 16 is stored, and the total collision count.',
    constraintsSummary: [
      'Table capacity M = 11',
      'Primary hash h(k) = (2k + 3) mod 11',
      'Quadratic probe: (h(k) + i²) mod 11',
      'Keys inserted: 3, 5, 7, 12, 16',
    ],
    hints: [
      'Compute h(k) for each key: h(3) = 9, h(5) = 13 mod 11 = 2, h(7) = 17 mod 11 = 6, h(12) = 27 mod 11 = 5, h(16) = 35 mod 11 = 2.',
      'Key 16 hashes to 2, which is already occupied by key 5.',
      'Check probe i=1 for key 16: (2 + 1²) mod 11 = 3.',
    ],
    explanation:
      'Step-by-step trace:\n' +
      '1. Key 3: h(3) = (2*3 + 3) mod 11 = 9 -> Slot 9 (empty).\n' +
      '2. Key 5: h(5) = (2*5 + 3) mod 11 = 13 mod 11 = 2 -> Slot 2 (empty).\n' +
      '3. Key 7: h(7) = (2*7 + 3) mod 11 = 17 mod 11 = 6 -> Slot 6 (empty).\n' +
      '4. Key 12: h(12) = (2*12 + 3) mod 11 = 27 mod 11 = 5 -> Slot 5 (empty).\n' +
      '5. Key 16: h(16) = (2*16 + 3) mod 11 = 35 mod 11 = 2. Slot 2 is occupied by 5!\n' +
      '   - Probe i=1: (2 + 1²) mod 11 = 3. Slot 3 is empty -> stored at index 3.\n' +
      'Total collisions = 1 (experienced by key 16).',
    subQuestions: [
      {
        id: 'q7-1',
        prompt: 'What is the initial hash index h(16) before resolving collisions?',
        type: 'numerical',
        correctAnswer: 2,
        explanation: 'h(16) = (2*16 + 3) mod 11 = 35 mod 11 = 2.',
      },
      {
        id: 'q7-2',
        prompt: 'At which table slot is key 16 ultimately stored?',
        type: 'numerical',
        correctAnswer: 3,
        explanation: 'Probe i=1 gives (2 + 1²) mod 11 = 3, which is empty. Key 16 is stored at index 3.',
      },
      {
        id: 'q7-3',
        prompt: 'How many total collisions are encountered across all 5 insertions?',
        type: 'numerical',
        correctAnswer: 1,
        explanation: 'Keys 3, 5, 7, 12 do not collide. Only key 16 collides at slot 2. Total collisions = 1.',
      },
    ],
    expectedTableState: [
      { index: 0, key: null },
      { index: 1, key: null },
      { index: 2, key: 5, probeCount: 1, originalHash: 2 },
      { index: 3, key: 16, probeCount: 2, originalHash: 2 },
      { index: 4, key: null },
      { index: 5, key: 12, probeCount: 1, originalHash: 5 },
      { index: 6, key: 7, probeCount: 1, originalHash: 6 },
      { index: 7, key: null },
      { index: 8, key: null },
      { index: 9, key: 3, probeCount: 1, originalHash: 9 },
      { index: 10, key: null },
    ],
  },
  {
    id: 'tifr-cs-2022-nonprime-cycle',
    exam: 'TIFR CS',
    year: '2022',
    paper: 'Computer & Systems Sciences',
    category: 'Theory & Clustering',
    title: 'Unvisited Slots and Infinite Loop Vulnerability in Non-Prime Table Size',
    difficulty: 'Hard',
    tableSize: 10,
    keys: [10, 20, 30, 40, 50, 60],
    c1: 0,
    c2: 1,
    hashFormulaDisplay: 'h(k, i) = (k + i²) mod 10',
    statement:
      'Consider an open addressing hash table of composite size M = 10 using quadratic probing (h(k) + i²) mod 10. Multiple keys with h(k) = 0 (such as multiples of 10) are inserted. Analyze the sequence of probed slots, identify the slots that can never be reached, and explain what happens when the visited slots are full but other table slots remain empty.',
    constraintsSummary: [
      'Table size M = 10 (Composite, not prime)',
      'Primary hash h(k) = 0 for keys {10, 20, 30, 40, 50, 60}',
      'Formula: i² mod 10',
    ],
    hints: [
      'Examine the quadratic residues modulo 10: 0²=0, 1²=1, 2²=4, 3²=9, 4²=6, 5²=5, 6²=6, 7²=9, 8²=4, 9²=1.',
      'Notice that the set of probed indices is strictly {0, 1, 4, 5, 6, 9}.',
      'Slots 2, 3, 7, and 8 will NEVER be visited by any probe from h(k)=0, regardless of how many probes are made.',
    ],
    explanation:
      'Quadratic Residue Cycle Analysis:\n' +
      '- For M = 10, i² mod 10 cycles through {0, 1, 4, 9, 6, 5, 6, 9, 4, 1, 0...}.\n' +
      '- Exactly 6 unique slots ({0, 1, 4, 5, 6, 9}) can be reached from base hash 0.\n' +
      '- Slots 2, 3, 7, and 8 are unreachable from base hash 0.\n' +
      '- After inserting 6 keys into the 6 reachable slots, attempting to insert a 7th key hashing to 0 will cycle infinitely through occupied slots, failing to insert even though 4 slots remain empty!',
    subQuestions: [
      {
        id: 'q8-1',
        prompt: 'How many distinct slots in the hash table of size 10 can ever be probed starting from index 0?',
        type: 'numerical',
        correctAnswer: 6,
        explanation: 'The unique residues of i² mod 10 are {0, 1, 4, 5, 6, 9}, which equals 6 distinct slots.',
      },
      {
        id: 'q8-2',
        prompt: 'Which set of slots in the table of size 10 can NEVER be visited by any probe sequence starting from index 0?',
        type: 'mcq',
        options: [
          'Slots 2, 3, 7, and 8',
          'Slots 1, 3, 5, and 7',
          'Slots 0, 2, 4, and 6',
          'Slots 5, 6, 7, and 8',
        ],
        correctAnswer: 'Slots 2, 3, 7, and 8',
        explanation: 'No integer square i² ends in 2, 3, 7, or 8. Therefore, slots 2, 3, 7, and 8 can never be visited.',
      },
      {
        id: 'q8-3',
        prompt: 'If slots 0, 1, 4, 5, 6, and 9 are all filled, and empty slots remain at indices 2, 3, 7, 8, what happens when inserting another key with h(k) = 0?',
        type: 'mcq',
        options: [
          'It successfully inserts into slot 2',
          'It enters an infinite cycle/loop and fails to insert despite available space',
          'It automatically switches to linear probing',
          'It resizes the hash table to size 11',
        ],
        correctAnswer: 'It enters an infinite cycle/loop and fails to insert despite available space',
        explanation: 'Since the quadratic offsets only generate indices {0, 1, 4, 5, 6, 9}, and all 6 are occupied, probing cycles infinitely through occupied slots and fails.',
      },
    ],
  },
  {
    id: 'gate-cs-2019-probe-counting-size11',
    exam: 'GATE CS',
    year: '2019',
    paper: 'Computer Science & Information Technology',
    category: 'Search & Cost',
    title: 'Average Successful Search Probes in Quadratic Hash Table',
    difficulty: 'Medium',
    tableSize: 11,
    keys: [22, 33, 44, 55, 66],
    c1: 0,
    c2: 1,
    hashFormulaDisplay: 'h(k, i) = (k + i²) mod 11',
    statement:
      'Consider inserting keys 22, 33, 44, 55, and 66 into an initially empty hash table of size M = 11 using hash function h(k) = k mod 11 and quadratic probing h(k, i) = (h(k) + i²) mod 11. Notice that all 5 keys produce primary hash 0. Calculate the number of probes needed to insert each key, the final placement of key 55, and the average number of probes per key for a successful search.',
    constraintsSummary: [
      'Table capacity M = 11 (Prime)',
      'Primary hash h(k) = 0 for all keys (22, 33, 44, 55, 66)',
      'Quadratic probing formula: (0 + i²) mod 11',
    ],
    hints: [
      'All keys hash to 0. Trace probes for i = 0, 1, 2, 3, 4:',
      'i=0 -> 0; i=1 -> 1; i=2 -> 4; i=3 -> 9; i=4 -> 16 mod 11 = 5.',
      'Key 22 occupies 0 (1 probe). Key 33 occupies 1 (2 probes). Key 44 occupies 4 (3 probes). Key 55 occupies 9 (4 probes). Key 66 occupies 5 (5 probes).',
    ],
    explanation:
      'Detailed trace:\n' +
      '1. Key 22: i=0 -> slot 0 (empty). Stored at 0 (1 probe, 0 collisions).\n' +
      '2. Key 33: i=0 (occupied); i=1 -> (0 + 1) mod 11 = 1. Stored at 1 (2 probes, 1 collision).\n' +
      '3. Key 44: i=0, 1 (occupied); i=2 -> (0 + 4) mod 11 = 4. Stored at 4 (3 probes, 2 collisions).\n' +
      '4. Key 55: i=0, 1, 2 (occupied); i=3 -> (0 + 9) mod 11 = 9. Stored at 9 (4 probes, 3 collisions).\n' +
      '5. Key 66: i=0, 1, 2, 3 (occupied); i=4 -> (0 + 16) mod 11 = 5. Stored at 5 (5 probes, 4 collisions).\n' +
      'Total probes = 1 + 2 + 3 + 4 + 5 = 15. Average probes = 15 / 5 = 3.0.',
    subQuestions: [
      {
        id: 'q9-1',
        prompt: 'At which slot index is key 55 stored?',
        type: 'numerical',
        correctAnswer: 9,
        explanation: 'At probe i=3: (0 + 3²) mod 11 = 9. Slot 9 is empty, so key 55 is stored at index 9.',
      },
      {
        id: 'q9-2',
        prompt: 'How many probes are required to successfully locate key 66 in the table?',
        type: 'numerical',
        correctAnswer: 5,
        explanation: 'Searching for key 66 visits slots 0, 1, 4, 9, and finally 5, requiring exactly 5 probes.',
      },
      {
        id: 'q9-3',
        prompt: 'What is the average number of probes per key for a successful search across all 5 keys?',
        type: 'numerical',
        correctAnswer: 3,
        explanation: 'Total probes for keys (22, 33, 44, 55, 66) = 1 + 2 + 3 + 4 + 5 = 15. Average = 15 / 5 = 3.0.',
      },
    ],
    expectedTableState: [
      { index: 0, key: 22, probeCount: 1, originalHash: 0 },
      { index: 1, key: 33, probeCount: 2, originalHash: 0 },
      { index: 2, key: null },
      { index: 3, key: null },
      { index: 4, key: 44, probeCount: 3, originalHash: 0 },
      { index: 5, key: 66, probeCount: 5, originalHash: 0 },
      { index: 6, key: null },
      { index: 7, key: null },
      { index: 8, key: null },
      { index: 9, key: 55, probeCount: 4, originalHash: 0 },
      { index: 10, key: null },
    ],
  },
  {
    id: 'gate-cs-2015-deletion-tombstones',
    exam: 'GATE CS',
    year: '2015',
    paper: 'Computer Science & Information Technology',
    category: 'Collision Resolution',
    title: 'Lazy Deletion (Tombstones) & Search Integrity in Quadratic Probing',
    difficulty: 'Hard',
    tableSize: 7,
    keys: [14, 21, 28],
    c1: 0,
    c2: 1,
    hashFormulaDisplay: 'h(k, i) = (k + i²) mod 7',
    statement:
      'A hash table of size M = 7 uses h(k) = k mod 7 and quadratic probing (h(k) + i²) mod 7. Keys 14, 21, and 28 (all with h(k) = 0) are inserted: 14 at slot 0, 21 at slot 1, and 28 at slot 4. Subsequently, key 21 is deleted. Analyze the effect of naive deletion vs. lazy deletion (tombstones) on a subsequent search for key 28 and insertion of key 35.',
    constraintsSummary: [
      'Table size M = 7',
      'Keys 14, 21, 28 inserted at slots 0, 1, 4',
      'Key 21 deleted from slot 1',
    ],
    hints: [
      'In open addressing, an empty slot terminates the search algorithm.',
      'If slot 1 is simply reset to EMPTY, searching for 28 checks slot 0 (occupied by 14), then slot 1 (empty), and immediately terminates claiming 28 is NOT found!',
      'With a tombstone (DELETED marker), search continues past slot 1 to slot 4, finding key 28.',
      'When inserting key 35, the insertion algorithm can reuse the tombstone slot 1.',
    ],
    explanation:
      'Deletion mechanics in open addressing:\n' +
      '1. Naive deletion: Setting slot 1 to null breaks probe chains. Searching for 28 visits slot 0 (not 28), then slot 1 (null -> search stops), falsely concluding key 28 is absent.\n' +
      '2. Lazy deletion: Marking slot 1 with a special TOMBSTONE / DELETED flag allows searches to continue past slot 1 to slot 4, finding 28 in 3 probes.\n' +
      '3. Re-use: When inserting a new key (e.g. 35 with h(35)=0), the first tombstone slot encountered (slot 1) can be overwritten with the new key.',
    subQuestions: [
      {
        id: 'q10-1',
        prompt: 'If slot 1 is cleared to standard EMPTY (null), what does a search for key 28 return?',
        type: 'mcq',
        options: [
          'Key Not Found (False Negative)',
          'Key Found at slot 4',
          'Infinite Loop',
          'Segment Violation',
        ],
        correctAnswer: 'Key Not Found (False Negative)',
        explanation: 'Because search in open addressing stops upon encountering an empty slot, slot 1 prematurely aborts the search.',
      },
      {
        id: 'q10-2',
        prompt: 'When slot 1 is marked with a Tombstone (DELETED), how many probes are required to find key 28?',
        type: 'numerical',
        correctAnswer: 3,
        explanation: 'Probe 0 checks slot 0 (14); probe 1 checks slot 1 (Tombstone, continue); probe 2 checks slot 4 (28, found!). Total = 3 probes.',
      },
      {
        id: 'q10-3',
        prompt: 'If key 35 is now inserted with slot 1 marked as Tombstone, at which slot will key 35 be placed?',
        type: 'numerical',
        correctAnswer: 1,
        explanation: 'Insertions can reuse tombstone slots. Since slot 0 is occupied by 14, probe 1 finds tombstone at slot 1 and inserts key 35 there.',
      },
    ],
    expectedTableState: [
      { index: 0, key: 14, probeCount: 1, originalHash: 0 },
      { index: 1, key: 21, probeCount: 2, originalHash: 0 },
      { index: 2, key: null },
      { index: 3, key: null },
      { index: 4, key: 28, probeCount: 3, originalHash: 0 },
      { index: 5, key: null },
      { index: 6, key: null },
    ],
  },
  {
    id: 'isro-cs-2018-alternating-quadratic-probing',
    exam: 'ISRO CS',
    year: '2018',
    paper: 'Computer Science Scientist/Engineer',
    category: 'Probe Sequence',
    title: 'Alternating Sign Quadratic Probing Sequence ((-1)^(i-1) · i²)',
    difficulty: 'Medium',
    tableSize: 11,
    keys: [14, 25, 36, 47],
    c1: 1,
    c2: 1,
    hashFormulaDisplay: 'h(k, i) = (k + i + i²) mod 11',
    statement:
      'An open addressing hash table of size M = 11 uses quadratic probing defined by h(k, i) = (k mod 11 + i + i²) mod 11. Keys 14, 25, 36, and 47 are inserted in order into the initially empty hash table. Trace the quadratic probe sequence and find the index where key 47 is stored.',
    constraintsSummary: [
      'Table size M = 11 (Prime)',
      'Primary hash h(k) = k mod 11',
      'Polynomial: i + i²',
      'Keys to insert: 14, 25, 36, 47',
    ],
    hints: [
      'h(14) = 14 mod 11 = 3 -> Slot 3.',
      'h(25) = 25 mod 11 = 3 (collides with 14!). Try i=1: (3 + 1 + 1²) mod 11 = 5 -> Slot 5.',
      'h(36) = 36 mod 11 = 3 (collides with 14!). Try i=1: (3 + 2) = 5 (collides with 25!). Try i=2: (3 + 2 + 4) mod 11 = 9 -> Slot 9.',
      'h(47) = 47 mod 11 = 3. Check i=1 (slot 5), i=2 (slot 9), i=3: (3 + 3 + 9) mod 11 = 15 mod 11 = 4.',
    ],
    explanation:
      'Step-by-step trace:\n' +
      '1. Key 14: h(14) = 3. Slot 3 is empty -> stored at index 3.\n' +
      '2. Key 25: h(25) = 3 (occupied by 14). i=1: (3 + 1 + 1) mod 11 = 5. Slot 5 is empty -> stored at index 5.\n' +
      '3. Key 36: h(36) = 3 (occupied). i=1: slot 5 (occupied by 25). i=2: (3 + 2 + 4) mod 11 = 9. Slot 9 is empty -> stored at index 9.\n' +
      '4. Key 47: h(47) = 3 (occupied). i=1: slot 5 (occupied). i=2: slot 9 (occupied). i=3: (3 + 3 + 9) mod 11 = 15 mod 11 = 4. Slot 4 is empty -> stored at index 4.',
    subQuestions: [
      {
        id: 'q11-1',
        prompt: 'At which index in the hash table is key 47 stored?',
        type: 'numerical',
        correctAnswer: 4,
        explanation: 'Key 47 finds an empty slot at probe i=3: (3 + 3 + 9) mod 11 = 15 mod 11 = 4.',
      },
      {
        id: 'q11-2',
        prompt: 'How many total collisions did key 47 encounter before finding an empty slot?',
        type: 'numerical',
        correctAnswer: 3,
        explanation: 'Key 47 collided at slot 3 (i=0), slot 5 (i=1), and slot 9 (i=2), totaling 3 collisions.',
      },
      {
        id: 'q11-3',
        prompt: 'What is the slot index probed at attempt i = 2 for any key with primary hash 3?',
        type: 'numerical',
        correctAnswer: 9,
        explanation: '(3 + 2 + 2²) mod 11 = (3 + 6) mod 11 = 9.',
      },
    ],
    expectedTableState: [
      { index: 0, key: null },
      { index: 1, key: null },
      { index: 2, key: null },
      { index: 3, key: 14, probeCount: 1, originalHash: 3 },
      { index: 4, key: 47, probeCount: 4, originalHash: 3 },
      { index: 5, key: 25, probeCount: 2, originalHash: 3 },
      { index: 6, key: null },
      { index: 7, key: null },
      { index: 8, key: null },
      { index: 9, key: 36, probeCount: 3, originalHash: 3 },
      { index: 10, key: null },
    ],
  },
  {
    id: 'gate-cs-2012-cluster-elimination',
    exam: 'GATE CS',
    year: '2012',
    paper: 'Computer Science & Information Technology',
    category: 'Theory & Clustering',
    title: 'Clustering Classification: Linear vs Quadratic vs Double Hashing',
    difficulty: 'Easy',
    tableSize: 11,
    keys: [10, 21, 32, 43],
    c1: 0,
    c2: 1,
    hashFormulaDisplay: 'h(k, i) = (k + i²) mod 11',
    statement:
      'Compare collision resolution techniques in open-addressed hash tables: Linear Probing h(k, i) = (h(k) + i) mod M, Quadratic Probing h(k, i) = (h(k) + c₁i + c₂i²) mod M, and Double Hashing h(k, i) = (h₁(k) + i·h₂(k)) mod M. Analyze which schemes eliminate Primary Clustering and Secondary Clustering.',
    constraintsSummary: [
      'Primary Clustering: Long runs of contiguous occupied slots',
      'Secondary Clustering: Identical probe sequence for keys with same initial hash',
    ],
    hints: [
      'Linear probing creates both primary clustering and secondary clustering.',
      'Quadratic probing eliminates primary clustering by jumping away from occupied clusters, but keys with identical initial hashes still follow identical probe sequences (secondary clustering).',
      'Double hashing eliminates secondary clustering because probe steps h₂(k) vary per key.',
    ],
    explanation:
      'Clustering breakdown:\n' +
      '- Linear Probing: Suffers from Primary Clustering (contiguous blocks) and Secondary Clustering.\n' +
      '- Quadratic Probing: Completely eliminates Primary Clustering, but suffers from Secondary Clustering because keys with h(k₁) = h(k₂) probe the identical sequence.\n' +
      '- Double Hashing: Eliminates BOTH Primary and Secondary Clustering.',
    subQuestions: [
      {
        id: 'q12-1',
        prompt: 'Which of the following collision resolution schemes suffers from Secondary Clustering but NOT Primary Clustering?',
        type: 'mcq',
        options: [
          'Linear Probing',
          'Quadratic Probing',
          'Double Hashing',
          'Separate Chaining',
        ],
        correctAnswer: 'Quadratic Probing',
        explanation: 'Quadratic probing prevents contiguous cluster growth (primary clustering) but causes identical probe sequences for keys with the same base hash (secondary clustering).',
      },
      {
        id: 'q12-2',
        prompt: 'Why does Double Hashing successfully eliminate Secondary Clustering whereas Quadratic Probing does not?',
        type: 'mcq',
        options: [
          'Double hashing uses two hash tables',
          'The probe step size in double hashing depends on the key value via h2(k)',
          'Double hashing requires prime table sizes',
          'Double hashing uses chaining buckets',
        ],
        correctAnswer: 'The probe step size in double hashing depends on the key value via h2(k)',
        explanation: 'Because h2(k) depends on key k, two keys colliding at h1(k) will take different step sizes, avoiding secondary clustering.',
      },
    ],
  },
  {
    id: 'ugc-net-cs-2022-hash-division-table13',
    exam: 'UGC NET CS',
    year: '2022',
    paper: 'Computer Science Paper II',
    category: 'Table State',
    title: 'Two-Pass Modulo & Quadratic Probing with Intermediate Collisions',
    difficulty: 'Medium',
    tableSize: 13,
    keys: [10, 23, 36, 49, 15],
    c1: 0,
    c2: 1,
    hashFormulaDisplay: 'h(k, i) = ((k + 3) + i²) mod 13',
    statement:
      'An open addressing hash table of size M = 13 uses the primary hash function h(k) = (k + 3) mod 13 and resolves collisions using quadratic probing h(k, i) = (h(k) + i²) mod 13. The keys 10, 23, 36, 49, and 15 are inserted in order. Find the final slot indices of keys 49 and 15, and the total collision count.',
    constraintsSummary: [
      'Table size M = 13 (Prime)',
      'Primary hash: h(k) = (k + 3) mod 13',
      'Keys inserted: 10, 23, 36, 49, 15',
    ],
    hints: [
      'h(10) = (10 + 3) mod 13 = 0 -> Slot 0.',
      'h(23) = (23 + 3) mod 13 = 0. Collides at 0! Probe i=1: (0 + 1) mod 13 = 1 -> Slot 1.',
      'h(36) = (36 + 3) mod 13 = 0. Collides at 0, 1! Probe i=2: (0 + 4) mod 13 = 4 -> Slot 4.',
      'h(49) = (49 + 3) mod 13 = 0. Collides at 0, 1, 4! Probe i=3: (0 + 9) mod 13 = 9 -> Slot 9.',
      'h(15) = (15 + 3) mod 13 = 18 mod 13 = 5. Check slot 5.',
    ],
    explanation:
      'Step-by-step trace:\n' +
      '1. Key 10: h(10) = (10+3)%13 = 0 -> Slot 0 is empty (0 collisions, 1 probe).\n' +
      '2. Key 23: h(23) = 0 (occupied). i=1: (0+1)%13 = 1 -> Slot 1 is empty (1 collision, 2 probes).\n' +
      '3. Key 36: h(36) = 0 (occupied). i=1: slot 1 (occupied). i=2: (0+4)%13 = 4 -> Slot 4 is empty (2 collisions, 3 probes).\n' +
      '4. Key 49: h(49) = 0 (occupied). i=1: slot 1 (occupied). i=2: slot 4 (occupied). i=3: (0+9)%13 = 9 -> Slot 9 is empty (3 collisions, 4 probes).\n' +
      '5. Key 15: h(15) = (15+3)%13 = 5 -> Slot 5 is empty (0 collisions, 1 probe).\n' +
      'Total collisions = 0 + 1 + 2 + 3 + 0 = 6.',
    subQuestions: [
      {
        id: 'q13-1',
        prompt: 'At which index in the hash table is key 49 stored?',
        type: 'numerical',
        correctAnswer: 9,
        explanation: 'Key 49 collides at slots 0, 1, and 4 before being placed in slot 9 at probe i=3.',
      },
      {
        id: 'q13-2',
        prompt: 'At which index in the hash table is key 15 stored?',
        type: 'numerical',
        correctAnswer: 5,
        explanation: 'h(15) = (15 + 3) mod 13 = 5. Slot 5 is empty, so key 15 is directly placed in slot 5.',
      },
      {
        id: 'q13-3',
        prompt: 'What is the total number of collisions encountered while inserting all 5 keys?',
        type: 'numerical',
        correctAnswer: 6,
        explanation: 'Collisions: Key 10: 0; Key 23: 1; Key 36: 2; Key 49: 3; Key 15: 0. Total = 6.',
      },
    ],
    expectedTableState: [
      { index: 0, key: 10, probeCount: 1, originalHash: 0 },
      { index: 1, key: 23, probeCount: 2, originalHash: 0 },
      { index: 2, key: null },
      { index: 3, key: null },
      { index: 4, key: 36, probeCount: 3, originalHash: 0 },
      { index: 5, key: 15, probeCount: 1, originalHash: 5 },
      { index: 6, key: null },
      { index: 7, key: null },
      { index: 8, key: null },
      { index: 9, key: 49, probeCount: 4, originalHash: 0 },
      { index: 10, key: null },
      { index: 11, key: null },
      { index: 12, key: null },
    ],
  },
  {
    id: 'gate-cs-2007-minimum-table-size',
    exam: 'GATE CS',
    year: '2007',
    paper: 'Computer Science & Information Technology',
    category: 'Theory & Clustering',
    title: 'Minimum Prime Table Size to Guarantee Insertion without Infinite Probing',
    difficulty: 'Hard',
    tableSize: 23,
    keys: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    c1: 0,
    c2: 1,
    hashFormulaDisplay: 'h(k, i) = (k + i²) mod 23',
    statement:
      'A hash table using quadratic probing with c₁ = 0 and c₂ = 1 needs to insert N = 10 keys without the risk of entering an infinite probe loop. According to the Quadratic Probing Theorem, if table size M is prime and load factor α = N / M ≤ 0.5, an empty slot is ALWAYS guaranteed to be found. Find the minimum prime table size M that satisfies this guarantee.',
    constraintsSummary: [
      'Number of keys to insert: N = 10',
      'Load factor condition: α = N / M ≤ 0.5',
      'Table size M must be a prime number',
    ],
    hints: [
      'From N / M ≤ 0.5, we get M ≥ 2N = 2 * 10 = 20.',
      'The table size M must be a prime number ≥ 20.',
      'Check primes starting from 20: 21 (composite: 3*7), 22 (composite: 2*11), 23 (PRIME!).',
    ],
    explanation:
      'Mathematical derivation:\n' +
      '1. The Quadratic Probing Theorem guarantees finding an empty slot if M is prime and load factor α ≤ 0.5.\n' +
      '2. For N = 10 keys: 10 / M ≤ 0.5  =>  M ≥ 20.\n' +
      '3. Since M must be prime, the smallest prime number greater than or equal to 20 is 23.\n' +
      '4. If M = 19 were chosen, 10 / 19 ≈ 0.526 > 0.5, which violates the theorem guarantee for the 10th key.',
    subQuestions: [
      {
        id: 'q14-1',
        prompt: 'What is the minimum prime table size M required to guarantee insertion of 10 keys under the α ≤ 0.5 condition? (NAT)',
        type: 'numerical',
        correctAnswer: 23,
        explanation: 'M >= 2 * 10 = 20. The smallest prime >= 20 is 23.',
      },
      {
        id: 'q14-2',
        prompt: 'For table size M = 23, how many distinct slots will the probe sequence (h(k) + i²) mod 23 examine in the first (M + 1)/2 probes?',
        type: 'numerical',
        correctAnswer: 12,
        explanation: '(M + 1) / 2 = (23 + 1) / 2 = 12 distinct slots.',
      },
      {
        id: 'q14-3',
        prompt: 'If M = 19 was chosen instead, is successful insertion guaranteed for the 10th key under the theorem?',
        type: 'mcq',
        options: [
          'No, because the load factor exceeds 0.5',
          'Yes, because 19 is prime',
          'Yes, because 10 is less than 19',
          'No, because 19 is an even number',
        ],
        correctAnswer: 'No, because the load factor exceeds 0.5',
        explanation: 'At 10 keys, α = 10/19 ≈ 0.53 > 0.5, so the guarantee that at least one of the examined slots is empty no longer holds.',
      },
    ],
  },
  {
    id: 'nielit-cs-2023-collision-cost-comparison',
    exam: 'NIELIT CS',
    year: '2023',
    paper: 'Scientist B Technical Paper',
    category: 'Search & Cost',
    title: 'Collision & Probe Comparison: Linear vs Quadratic on Identical Input',
    difficulty: 'Medium',
    tableSize: 7,
    keys: [7, 14, 21, 28],
    c1: 0,
    c2: 1,
    hashFormulaDisplay: 'h(k, i) = (k + i²) mod 7',
    statement:
      'Compare Linear Probing vs Quadratic Probing (offset i²) on table size M = 7 with primary hash h(k) = k mod 7. Keys 7, 14, 21, and 28 (all having h(k) = 0) are inserted in order. In linear probing, keys occupy contiguous slots 0, 1, 2, 3 (Primary Cluster). In quadratic probing, trace the non-contiguous slots occupied by these keys.',
    constraintsSummary: [
      'Table size M = 7',
      'All keys {7, 14, 21, 28} have h(k) = 0',
      'Quadratic probe offset: i² mod 7',
    ],
    hints: [
      'Key 7: i=0 -> slot 0.',
      'Key 14: i=0 (occupied); i=1 -> (0 + 1) mod 7 = 1.',
      'Key 21: i=0, 1 (occupied); i=2 -> (0 + 4) mod 7 = 4.',
      'Key 28: i=0, 1, 4 (occupied); i=3 -> (0 + 9) mod 7 = 2.',
    ],
    explanation:
      'Comparison of final slot assignments:\n' +
      '- Linear Probing: 7 -> 0, 14 -> 1, 21 -> 2, 28 -> 3 (Contiguous cluster of length 4).\n' +
      '- Quadratic Probing: 7 -> 0, 14 -> 1, 21 -> 4, 28 -> 2 (Dispersed slots: 0, 1, 4, 2).\n' +
      'By distributing collisions across quadratic residues (0, 1, 4, 2), quadratic probing prevents contiguous block formation.',
    subQuestions: [
      {
        id: 'q15-1',
        prompt: 'In quadratic probing, at which slot index does key 21 get stored?',
        type: 'numerical',
        correctAnswer: 4,
        explanation: 'At probe i=2: (0 + 2²) mod 7 = 4. Slot 4 is empty, so key 21 is stored at index 4.',
      },
      {
        id: 'q15-2',
        prompt: 'In quadratic probing, at which slot index does key 28 get stored?',
        type: 'numerical',
        correctAnswer: 2,
        explanation: 'At probe i=3: (0 + 3²) mod 7 = 9 mod 7 = 2. Slot 2 is empty, so key 28 is stored at index 2.',
      },
      {
        id: 'q15-3',
        prompt: 'Why does quadratic probing outperform linear probing as the table becomes more crowded?',
        type: 'mcq',
        options: [
          'It eliminates primary clustering by jumping quadratically away from occupied clusters',
          'It allows storing multiple keys in the same bucket',
          'It dynamically resizes the table',
          'It guarantees O(1) worst-case search time',
        ],
        correctAnswer: 'It eliminates primary clustering by jumping quadratically away from occupied clusters',
        explanation: 'Quadratic probing breaks up contiguous runs of occupied slots, keeping search chains shorter on average.',
      },
    ],
    expectedTableState: [
      { index: 0, key: 7, probeCount: 1, originalHash: 0 },
      { index: 1, key: 14, probeCount: 2, originalHash: 0 },
      { index: 2, key: 28, probeCount: 4, originalHash: 0 },
      { index: 3, key: null },
      { index: 4, key: 21, probeCount: 3, originalHash: 0 },
      { index: 5, key: null },
      { index: 6, key: null },
    ],
  },
];
