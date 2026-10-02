// What an emergency card can hold, keyed by the built-in "Medical emergency
// card" template (templates/medical_emergency_card.json). Keeping the same
// keys means revoked finds the records a proposal names, and asks for any it
// does not hold yet with the template's label and input. Labels live in the
// locale catalogues.

export type Group = 'contact' | 'medical' | 'doctor' | 'donor' | 'insurance';

// In the order a first responder reads them.
export const groups: Group[] = ['contact', 'medical', 'doctor', 'donor', 'insurance'];

export const groupKeys: Record<Group, readonly string[]> = {
  contact: ['contact_name', 'contact_phone', 'contact_relation'],
  medical: ['blood_type', 'allergies', 'medications'],
  doctor: ['doctor_name', 'doctor_phone'],
  donor: ['organ_donor'],
  insurance: ['insurance_provider', 'insurance_number'],
};

// Whose card it is. Every card leads to it: the rest says little to a helper
// who does not know who they are reading about. The key is the one the
// "Personal information" template uses, so a vault that holds the name
// already is not asked twice.
export const baseKeys: readonly string[] = ['full_name'];

// Anyone who finds the card can scan it, so a new card starts with what helps
// in the first minutes. The insurance number and the donor decision are the
// owner's to add.
export const defaultGroups: Group[] = ['contact', 'medical', 'doctor'];

export const emergencyKeys = new Set([...baseKeys, ...groups.flatMap((g) => groupKeys[g])]);

export function isGroup(g: unknown): g is Group {
  return groups.includes(g as Group);
}

// Groups in their fixed order, each once.
export function orderedGroups(picked: readonly string[]): Group[] {
  return groups.filter((g) => picked.includes(g));
}

export function keysFor(picked: readonly Group[]): string[] {
  return [...baseKeys, ...orderedGroups(picked).flatMap((g) => groupKeys[g])];
}
