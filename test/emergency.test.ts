import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { refFor, refGroups, refId } from '../src/lib/connection.svelte';
import { baseKeys, defaultGroups, emergencyKeys, groupKeys, groups, keysFor, orderedGroups } from '../src/lib/emergency';
import { templateName } from '../src/lib/proposal';

interface TemplateRecord {
  key: string;
  type: string;
}
interface Template {
  name: string;
  schema: { records: TemplateRecord[]; sections: { records: TemplateRecord[] }[] };
}

// The built-in template in the revoked repository, when this tool sits next
// to it; published on its own, there is nothing to compare against.
function builtin(): Template | null {
  try {
    const path = new URL('../../templates/medical_emergency_card.json', import.meta.url);
    return JSON.parse(readFileSync(path, 'utf8')) as Template;
  } catch {
    return null;
  }
}

describe('groups', () => {
  it('hold every key once', () => {
    const all = [...baseKeys, ...groups.flatMap((g) => groupKeys[g])];
    expect(new Set(all).size).toBe(all.length);
    expect(emergencyKeys.size).toBe(all.length);
  });

  it('come out in their fixed order, whatever order they were picked in', () => {
    expect(orderedGroups(['doctor', 'contact', 'doctor', 'nope'])).toEqual(['contact', 'doctor']);
    expect(keysFor(['medical', 'contact'])).toEqual([
      'full_name',
      'contact_name',
      'contact_phone',
      'contact_relation',
      'blood_type',
      'allergies',
      'medications',
    ]);
  });

  it('start without the insurance number and the donor decision', () => {
    expect(defaultGroups).not.toContain('insurance');
    expect(defaultGroups).not.toContain('donor');
  });

  it('survive the trip through a link reference', () => {
    const ref = refFor('ab12cd34ef56ab78', groups);
    expect(ref.length).toBeLessThanOrEqual(80);
    expect(refId(ref)).toBe('ab12cd34ef56ab78');
    expect(refGroups(ref)).toEqual(groups);
    expect(refGroups('only-an-id')).toEqual([]);
  });
});

describe('the built-in template', () => {
  const template = builtin();

  it.skipIf(!template)('is the one this tool names, and holds every key it proposes', () => {
    expect(template!.name).toBe(templateName);
    const records = [...template!.schema.records, ...template!.schema.sections.flatMap((s) => s.records)];
    const keys = new Set(records.map((r) => r.key));
    for (const k of emergencyKeys) expect(keys.has(k), k).toBe(true);
    // revoked does not hand a link with a file over, so a card could not print it.
    for (const r of records) if (emergencyKeys.has(r.key)) expect(r.type, r.key).not.toBe('file');
  });
});
