import { describe, expect, it } from 'vitest';
import { emergencyKeys, groups } from '../src/lib/emergency';
import { de } from '../src/lib/locales/de';
import { en } from '../src/lib/locales/en';

describe('catalogues', () => {
  it('translate exactly the same keys', () => {
    expect(Object.keys(de).sort()).toEqual(Object.keys(en).sort());
  });

  it('name every group and field in both languages', () => {
    for (const cat of [en, de] as Record<string, unknown>[]) {
      for (const g of groups) expect(cat[`group.${g}`], g).toBeTruthy();
      for (const k of emergencyKeys) expect(cat[`field.${k}`], k).toBeTruthy();
    }
  });

  it('explain every reason a card has no link', () => {
    for (const cat of [en, de] as Record<string, unknown>[]) {
      for (const m of ['notConnected', 'noLink', 'ended', 'noPermission', 'notHandedOver']) {
        expect(cat[`card.missing.${m}`], m).toBeTruthy();
      }
    }
  });

  it('keep the reasons revoked shows within what it accepts', () => {
    for (const cat of [en, de]) {
      expect((cat['reason.revoke'] as string).length).toBeLessThanOrEqual(120);
      expect((cat['reason.links'] as string).length).toBeLessThanOrEqual(120);
    }
  });

  it('render parameters in both languages', () => {
    for (const [key, m] of Object.entries(en)) {
      const d = (de as Record<string, typeof m>)[key];
      if (typeof m !== 'function') {
        expect(typeof d, key).toBe('string');
        continue;
      }
      const params = { n: 2, host: 'h', name: 'N', names: 'X', url: 'u' };
      for (const out of [m(params), (d as typeof m)(params)]) {
        expect(out, key).not.toMatch(/undefined|\$\{/);
      }
    }
  });
});
