export interface HashTableSlot {
  index: number;
  key: number | null;
  status: 'empty' | 'occupied';
  probeCount?: number;
  originalHash?: number;
  insertionStep?: number;
}

export type StepActionType =
  | 'start_probe'
  | 'collision'
  | 'insert_success'
  | 'loop_detected'
  | 'table_full';

export interface SimulationStep {
  stepNumber: number;
  currentKey: number;
  keyIndex: number;
  totalKeys: number;
  probeIndex: number;
  calculatedIndex: number;
  baseHash: number;
  formulaExplanation: string;
  actionType: StepActionType;
  message: string;
  tableState: HashTableSlot[];
  targetSlotIndex: number;
  loadFactor: number;
  totalCollisionsSoFar: number;
  totalProbesSoFar: number;
  successfulInsertions: number;
  visitedIndicesInCurrentKey: number[];
  isFinalStepForKey: boolean;
}

export interface SimulationConfig {
  tableSize: number;
  keys: number[];
  c1: number;
  c2: number;
}

export interface SimulationResult {
  steps: SimulationStep[];
  finalTable: HashTableSlot[];
  totalCollisions: number;
  totalProbes: number;
  averageProbes: number;
  uninsertedKeys: number[];
  insertedCount: number;
  hasLoop: boolean;
}

export function isPrime(n: number): boolean {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

export function getNextPrime(n: number): number {
  let candidate = n + 1;
  while (!isPrime(candidate)) {
    candidate++;
  }
  return candidate;
}

export function parseKeysInput(input: string): number[] {
  if (!input) return [];
  return input
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => Number(s))
    .filter((n) => !isNaN(n) && Number.isInteger(n) && n >= 0);
}

export function generateRandomKeys(count: number = 6, min: number = 10, max: number = 99): number[] {
  const result = new Set<number>();
  let attempts = 0;
  while (result.size < count && attempts < 200) {
    attempts++;
    const val = Math.floor(Math.random() * (max - min + 1)) + min;
    result.add(val);
  }
  return Array.from(result);
}

export function generateQuadraticHashingSimulation(config: SimulationConfig): SimulationResult {
  const { tableSize: M, keys, c1, c2 } = config;
  const table: HashTableSlot[] = Array.from({ length: M }, (_, idx) => ({
    index: idx,
    key: null,
    status: 'empty',
  }));

  const steps: SimulationStep[] = [];
  let totalCollisions = 0;
  let totalProbes = 0;
  let successfulInsertions = 0;
  const uninsertedKeys: number[] = [];
  let globalHasLoop = false;

  for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
    const key = keys[keyIdx];
    const baseHash = ((key % M) + M) % M;
    let probe = 0;
    const visitedInThisKey: number[] = [];
    const maxProbes = M * 2;
    let inserted = false;

    while (probe < maxProbes) {
      totalProbes++;
      const quadraticOffset = c1 * probe + c2 * probe * probe;
      const rawIndex = baseHash + quadraticOffset;
      const targetIndex = ((Math.floor(rawIndex) % M) + M) % M;
      visitedInThisKey.push(targetIndex);

      const offsetDisplay = `${c1}*(${probe}) + ${c2}*(${probe}²) = ${quadraticOffset}`;
      const formulaStr = `h(${key}, ${probe}) = (${baseHash} + ${quadraticOffset}) mod ${M} = ${targetIndex}`;

      const targetSlot = table[targetIndex];

      if (targetSlot.status === 'empty') {
        table[targetIndex] = {
          ...targetSlot,
          key,
          status: 'occupied',
          probeCount: probe + 1,
          originalHash: baseHash,
          insertionStep: steps.length + 1,
        };
        successfulInsertions++;
        inserted = true;

        steps.push({
          stepNumber: steps.length + 1,
          currentKey: key,
          keyIndex: keyIdx,
          totalKeys: keys.length,
          probeIndex: probe,
          calculatedIndex: targetIndex,
          baseHash,
          formulaExplanation: `${formulaStr} → Slot [${targetIndex}] is EMPTY. Key ${key} inserted (Total probes: ${probe + 1}).`,
          actionType: 'insert_success',
          message: `Slot [${targetIndex}] is empty. Successfully inserted key ${key}!`,
          tableState: table.map((s) => ({ ...s })),
          targetSlotIndex: targetIndex,
          loadFactor: successfulInsertions / M,
          totalCollisionsSoFar: totalCollisions,
          totalProbesSoFar: totalProbes,
          successfulInsertions,
          visitedIndicesInCurrentKey: [...visitedInThisKey],
          isFinalStepForKey: true,
        });

        break;
      } else {
        totalCollisions++;

        const isCycleDetected =
          probe >= M && visitedInThisKey.filter((idx) => idx === targetIndex).length >= 2;

        if (isCycleDetected) {
          globalHasLoop = true;
          steps.push({
            stepNumber: steps.length + 1,
            currentKey: key,
            keyIndex: keyIdx,
            totalKeys: keys.length,
            probeIndex: probe,
            calculatedIndex: targetIndex,
            baseHash,
            formulaExplanation: `${formulaStr} → Slot [${targetIndex}] occupied by ${targetSlot.key}. Cycle loop detected! Quadratic probing sequence is repeating without covering the full table.`,
            actionType: 'loop_detected',
            message: `Collision at slot [${targetIndex}] (held by ${targetSlot.key}) & cycle detected at probe ${probe}.`,
            tableState: table.map((s) => ({ ...s })),
            targetSlotIndex: targetIndex,
            loadFactor: successfulInsertions / M,
            totalCollisionsSoFar: totalCollisions,
            totalProbesSoFar: totalProbes,
            successfulInsertions,
            visitedIndicesInCurrentKey: [...visitedInThisKey],
            isFinalStepForKey: true,
          });
          uninsertedKeys.push(key);
          break;
        }

        steps.push({
          stepNumber: steps.length + 1,
          currentKey: key,
          keyIndex: keyIdx,
          totalKeys: keys.length,
          probeIndex: probe,
          calculatedIndex: targetIndex,
          baseHash,
          formulaExplanation: `${formulaStr} → Slot [${targetIndex}] is OCCUPIED by key ${targetSlot.key}. Collision! Incrementing probe i to ${probe + 1}.`,
          actionType: 'collision',
          message: `Collision at slot [${targetIndex}] (occupied by ${targetSlot.key}). Probing next index...`,
          tableState: table.map((s) => ({ ...s })),
          targetSlotIndex: targetIndex,
          loadFactor: successfulInsertions / M,
          totalCollisionsSoFar: totalCollisions,
          totalProbesSoFar: totalProbes,
          successfulInsertions,
          visitedIndicesInCurrentKey: [...visitedInThisKey],
          isFinalStepForKey: false,
        });

        probe++;
      }
    }

    if (!inserted && !uninsertedKeys.includes(key)) {
      uninsertedKeys.push(key);
      steps.push({
        stepNumber: steps.length + 1,
        currentKey: key,
        keyIndex: keyIdx,
        totalKeys: keys.length,
        probeIndex: probe,
        calculatedIndex: -1,
        baseHash,
        formulaExplanation: `Unable to insert key ${key}: Maximum probe limit (${maxProbes}) reached or table is full.`,
        actionType: 'table_full',
        message: `Failed to insert key ${key} after ${maxProbes} probes.`,
        tableState: table.map((s) => ({ ...s })),
        targetSlotIndex: -1,
        loadFactor: successfulInsertions / M,
        totalCollisionsSoFar: totalCollisions,
        totalProbesSoFar: totalProbes,
        successfulInsertions,
        visitedIndicesInCurrentKey: [...visitedInThisKey],
        isFinalStepForKey: true,
      });
    }
  }

  const averageProbes = successfulInsertions > 0 ? Number((totalProbes / successfulInsertions).toFixed(2)) : 0;

  return {
    steps,
    finalTable: table,
    totalCollisions,
    totalProbes,
    averageProbes,
    uninsertedKeys,
    insertedCount: successfulInsertions,
    hasLoop: globalHasLoop,
  };
}
