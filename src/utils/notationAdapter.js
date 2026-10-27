export const NOTATION_MODES = {
  CHEN: 'chen',
  CROWS_FOOT: 'crows_foot',
  UML: 'uml',
  MIN_MAX: 'min_max',
};

export const NOTATION_LABELS = {
  chen: 'Chen Notation',
  crows_foot: "Crow's Foot",
  uml: 'UML Class',
  min_max: 'Min-Max (ISO)',
};

export const NOTATION_DESCRIPTIONS = {
  chen: 'Classic entity-relationship model with diamond relationships and oval attributes.',
  crows_foot: "Relational entity boxes with embedded attributes and crow's foot multiplicity ends.",
  uml: 'Unified Modeling Language class boxes with attribute & method compartments and associations.',
  min_max: 'ISO/Merise style with explicit (min, max) structural cardinality constraint tuples.',
};

export function parseMinMax(label) {
  if (!label) return '(0,N)';
  const trimmed = String(label).trim();
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) return trimmed;
  if (trimmed === '1' || trimmed === '1..1') return '(1,1)';
  if (trimmed === '0..1') return '(0,1)';
  if (trimmed === 'N' || trimmed === 'M' || trimmed === '0..*') return '(0,N)';
  if (trimmed === '1..*') return '(1,N)';
  return '(1,N)';
}

export function parseUmlMultiplicity(label) {
  if (!label) return '1..*';
  const trimmed = String(label).trim();
  if (trimmed === '1') return '1..1';
  if (trimmed === 'N' || trimmed === 'M') return '0..*';
  if (trimmed === '(1,1)') return '1..1';
  if (trimmed === '(0,1)') return '0..1';
  if (trimmed === '(0,N)' || trimmed === '(0,M)') return '0..*';
  if (trimmed === '(1,N)' || trimmed === '(1,M)') return '1..*';
  if (trimmed.includes('..')) return trimmed;
  return '0..*';
}

export function parseCrowsFootMarkers(label) {
  if (!label) return { marker: 'crows-many-optional' };
  const trimmed = String(label).trim();
  if (trimmed === '1' || trimmed === '1..1' || trimmed === '(1,1)') {
    return { marker: 'crows-one-mandatory' };
  }
  if (trimmed === '0..1' || trimmed === '(0,1)') {
    return { marker: 'crows-one-optional' };
  }
  if (trimmed === '1..*' || trimmed === '(1,N)') {
    return { marker: 'crows-many-mandatory' };
  }
  return { marker: 'crows-many-optional' };
}

export function formatCardinalityForNotation(cardinality, notation) {
  if (!cardinality) return '';
  const trimmed = String(cardinality).trim();
  if (
    trimmed === 'ISA' ||
    trimmed === 'Total ISA' ||
    trimmed === 'Subclass' ||
    trimmed === 'Superclass'
  ) {
    return trimmed;
  }
  if (notation === NOTATION_MODES.MIN_MAX) {
    return parseMinMax(trimmed);
  }
  if (notation === NOTATION_MODES.UML) {
    return parseUmlMultiplicity(trimmed);
  }
  if (notation === NOTATION_MODES.CROWS_FOOT) {
    if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
      if (trimmed === '(1,1)') return '1';
      if (trimmed === '(0,1)') return '0..1';
      if (trimmed === '(1,N)' || trimmed === '(1,M)') return '1..N';
      return '0..N';
    }
    return trimmed;
  }
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    if (trimmed === '(1,1)') return '1';
    if (trimmed === '(0,1)') return '1';
    if (trimmed === '(1,N)' || trimmed === '(0,N)') return 'N';
    if (trimmed === '(1,M)' || trimmed === '(0,M)') return 'M';
  }
  if (trimmed === '1..1') return '1';
  if (trimmed === '0..1') return '1';
  if (trimmed === '1..*' || trimmed === '0..*') return 'N';
  return trimmed;
}
