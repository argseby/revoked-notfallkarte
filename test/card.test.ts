import { describe, expect, it } from 'vitest';
import { cardText, contents, displayUrl, fileStem, qrMatrix, wrapLines } from '../src/lib/card-face';
import { groups } from '../src/lib/emergency';
import { buildPdf } from '../src/lib/pdf-writer';

// One unit per character: enough to check where lines break.
const measure = (s: string) => s.length;

describe('wrapLines', () => {
  it('breaks between words', () => {
    expect(wrapLines(measure, 'aaa bbb ccc', 7, 3)).toEqual(['aaa bbb', 'ccc']);
    expect(wrapLines(measure, 'short', 10, 2)).toEqual(['short']);
    expect(wrapLines(measure, '', 10, 2)).toEqual([]);
  });

  it('ends what does not fit in an ellipsis, within the width', () => {
    const lines = wrapLines(measure, 'aaa bbb ccc ddd eee', 7, 2);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe('aaa bbb');
    expect(lines[1].endsWith('…')).toBe(true);
    for (const l of lines) expect(l.length).toBeLessThanOrEqual(7);
  });

  it('cuts a word wider than a line', () => {
    const lines = wrapLines(measure, 'Donaudampfschifffahrt', 8, 2);
    expect(lines).toHaveLength(1);
    expect(lines[0].length).toBeLessThanOrEqual(8);
  });
});

describe('what a card says', () => {
  it('names every group in both languages', () => {
    for (const lang of ['de', 'en'] as const) {
      for (const g of groups) expect(cardText[lang].groups[g], g).toBeTruthy();
    }
    expect(contents(['contact', 'doctor'], 'de')).toBe('Notfallkontakt, Arzt');
    expect(contents(['contact', 'doctor'], 'en')).toBe('Emergency contact, Doctor');
  });

  it('shows the link as someone would type it', () => {
    expect(displayUrl('https://revoked.example/s/abc')).toBe('revoked.example/s/abc');
    expect(displayUrl('https://revoked.example/')).toBe('revoked.example');
  });

  it('names its file after its owner', () => {
    expect(fileStem('Jörg Müßig-Çelik')).toBe('notfallkarte-jorg-mussig-celik');
    expect(fileStem('…')).toBe('notfallkarte');
  });
});

describe('the code', () => {
  it('is square, with a finder pattern in three corners', () => {
    const m = qrMatrix('https://revoked.example/s/k7m2p9xq4w');
    expect(m.length).toBeGreaterThanOrEqual(21);
    for (const row of m) expect(row).toHaveLength(m.length);
    const n = m.length;
    for (const [y, x] of [
      [0, 0],
      [0, n - 7],
      [n - 7, 0],
    ]) {
      for (let i = 0; i < 7; i++) expect(m[y][x + i] && m[y + 6][x + i] && m[y + i][x] && m[y + i][x + 6]).toBe(true);
      expect(m[y + 1][x + 1]).toBe(false);
      expect(m[y + 3][x + 3]).toBe(true);
    }
  });

  it('differs between links', () => {
    expect(qrMatrix('https://a.example/s/1')).not.toEqual(qrMatrix('https://a.example/s/2'));
  });
});

describe('the print sheet', () => {
  it('is one A4 page holding the image', () => {
    const jpeg = new Uint8Array([0xff, 0xd8, 1, 2, 3, 0xff, 0xd9]);
    const pdf = new TextDecoder('latin1').decode(
      buildPdf([{ jpeg, pixelWidth: 2480, pixelHeight: 3508, width: 595.28, height: 841.89 }]),
    );
    expect(pdf.startsWith('%PDF-1.4')).toBe(true);
    expect(pdf).toContain('/MediaBox [0 0 595.28 841.89]');
    expect(pdf).toContain('/Count 1');
    expect(pdf).toContain(`/Filter /DCTDecode /Length ${jpeg.length}`);
    expect(pdf.trimEnd().endsWith('%%EOF')).toBe(true);
    // The cross-reference table points at where each object really starts.
    const xref = Number(/startxref\n(\d+)/.exec(pdf)![1]);
    expect(pdf.slice(xref, xref + 4)).toBe('xref');
  });
});
