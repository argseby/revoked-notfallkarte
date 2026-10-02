import { describe, expect, it } from 'vitest';
import { cardLabel, cleanName, maxKeys, maxName, nameFromLabel, proposalLink, validCardUrl } from '../src/lib/proposal';

function query(link: string): Record<string, string> {
  expect(link.startsWith('revoked://p?')).toBe(true);
  return Object.fromEntries(new URL(link.replace('revoked://p', 'https://x/p')).searchParams);
}

describe('proposalLink', () => {
  const link = proposalLink({ name: '  Max\nMustermann ', locale: 'de', keys: ['contact_name', 'allergies'] });

  it('names keys, never values', () => {
    expect(query(link)).toEqual({
      label: 'Notfallkarte Max Mustermann',
      keys: 'contact_name,allergies',
      from: 'Notfallkarte',
      template: 'Medical emergency card',
    });
  });

  it('sets no expiry, stamp or purpose: the card has to work when it is needed', () => {
    const q = query(link);
    expect(q.days).toBeUndefined();
    expect(q.stamp).toBeUndefined();
    expect(q.purpose).toBeUndefined();
  });

  it('percent-encodes spaces rather than writing +', () => {
    expect(link).not.toContain('+');
    expect(link).toContain('Notfallkarte%20Max');
  });

  it('drops duplicate keys', () => {
    expect(query(proposalLink({ name: 'A', locale: 'en', keys: ['a', 'a', 'b'] })).keys).toBe('a,b');
  });

  it('refuses what the app would refuse', () => {
    expect(() => proposalLink({ name: ' ', locale: 'en', keys: ['a'] })).toThrow();
    expect(() => proposalLink({ name: 'A', locale: 'en', keys: [] })).toThrow();
    expect(() => proposalLink({ name: 'A', locale: 'en', keys: ['Blood Type'] })).toThrow();
    const many = Array.from({ length: maxKeys + 1 }, (_, i) => `k${i}`);
    expect(() => proposalLink({ name: 'A', locale: 'en', keys: many })).toThrow();
  });
});

describe('label', () => {
  it('fits the 120 characters a label holds, in either language', () => {
    const long = 'x'.repeat(500);
    expect(cleanName(long)).toHaveLength(maxName);
    expect(cardLabel(long, 'de').length).toBeLessThanOrEqual(120);
    expect(cardLabel(long, 'en')).toHaveLength(120);
  });

  it('is one line', () => {
    expect(cleanName('a\r\n\tb\u0007c')).toBe('a b c');
  });

  it('gives the name back, whichever language built it', () => {
    expect(nameFromLabel(cardLabel('Max Mustermann', 'de'))).toBe('Max Mustermann');
    expect(nameFromLabel(cardLabel('Max Mustermann', 'en'))).toBe('Max Mustermann');
    expect(nameFromLabel('Renamed in revoked')).toBe('Renamed in revoked');
  });
});

describe('a proposal from this tool', () => {
  it('names the tool, its way back, its state and its own reference', () => {
    const q = query(
      proposalLink(
        { name: 'A', locale: 'en', keys: ['allergies'] },
        {
          client: 'https://notfallkarte.example',
          redirect: 'https://notfallkarte.example/',
          state: 'st',
          ref: 'card-1.contact-medical',
          challenge: 'c'.repeat(43),
          reasons: { revoke: 'r', links: 'l' },
        },
      ),
    );
    expect(q).toMatchObject({
      client: 'https://notfallkarte.example',
      redirect: 'https://notfallkarte.example/',
      state: 'st',
      ref: 'card-1.contact-medical',
      challenge: 'c'.repeat(43),
      revoke_reason: 'r',
      links_reason: 'l',
    });
  });

  it('asks to connect only when it has a challenge', () => {
    const q = query(
      proposalLink(
        { name: 'A', locale: 'en', keys: ['allergies'] },
        { client: 'https://t.example', redirect: 'https://t.example/', state: 'st', ref: 'r', reasons: { revoke: 'r', links: 'l' } },
      ),
    );
    expect(q.challenge).toBeUndefined();
    expect(q.revoke_reason).toBeUndefined();
    expect(q.poll).toBeUndefined();
  });

  it('names the server it watches, connected or not', () => {
    const q = query(
      proposalLink(
        { name: 'A', locale: 'en', keys: ['allergies'] },
        { client: 'https://t.example', redirect: 'https://t.example/', state: 'st', ref: 'r', poll: 'https://vault.example' },
      ),
    );
    expect(q.poll).toBe('https://vault.example');
    expect(q.challenge).toBeUndefined();
  });
});

describe('a pasted link', () => {
  it('has to be one a code can lead to', () => {
    expect(validCardUrl(' https://revoked.example/s/abc ')).toBe('https://revoked.example/s/abc');
    expect(validCardUrl('http://localhost:8090/s/abc')).toBe('http://localhost:8090/s/abc');
    expect(validCardUrl('http://revoked.example/s/abc')).toBeNull();
    expect(validCardUrl('revoked://p?label=x')).toBeNull();
    expect(validCardUrl('javascript:alert(1)')).toBeNull();
    expect(validCardUrl('https://user:pw@revoked.example/')).toBeNull();
    expect(validCardUrl('not a link')).toBeNull();
  });
});
