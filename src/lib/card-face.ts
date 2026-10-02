// What is printed on a card, and how it is laid out. The card carries no
// value from the vault: a name its owner typed, a code that opens their link,
// and — in German and English, wherever it is found — what the code leads to.

import qrcode from 'qrcode-generator';
import type { Group } from './emergency';

export interface CardFace {
  name: string;
  url: string;
  groups: readonly Group[];
}

// ISO/IEC 7810 ID-1, the size of a bank card, in millimetres.
export const cardSize = { width: 85.6, height: 53.98 } as const;

export const cardText = {
  de: {
    title: 'NOTFALLKARTE',
    scan: 'Im Notfall Code scannen',
    groups: {
      contact: 'Notfallkontakt',
      medical: 'Allergien & Medikamente',
      doctor: 'Arzt',
      donor: 'Organspende',
      insurance: 'Versicherung',
    },
  },
  en: {
    title: 'EMERGENCY CARD',
    scan: 'In an emergency, scan the code',
    groups: {
      contact: 'Emergency contact',
      medical: 'Allergies & medication',
      doctor: 'Doctor',
      donor: 'Organ donor',
      insurance: 'Insurance',
    },
  },
} as const satisfies Record<string, { title: string; scan: string; groups: Record<Group, string> }>;

export function contents(groups: readonly Group[], lang: keyof typeof cardText): string {
  return groups.map((g) => cardText[lang].groups[g]).join(', ');
}

// The link as someone would type it: no scheme, no trailing slash.
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

// The code's modules, row by row; true is dark.
export function qrMatrix(text: string): boolean[][] {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, y) => Array.from({ length: n }, (_, x) => qr.isDark(y, x)));
}

// Breaks text into at most maxLines lines no wider than maxWidth, measured by
// the caller. What does not fit ends in an ellipsis; a single word wider than
// a line is cut.
export function wrapLines(
  measure: (s: string) => number,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const fit = (s: string): string => {
    if (measure(s) <= maxWidth) return s;
    let cut = s;
    while (cut.length > 1 && measure(cut + '…') > maxWidth) cut = cut.slice(0, -1);
    return cut.trimEnd() + '…';
  };
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (let i = 0; i < words.length; i++) {
    const next = line ? `${line} ${words[i]}` : words[i];
    if (measure(next) <= maxWidth) {
      line = next;
      continue;
    }
    if (lines.length === maxLines - 1) {
      // The last line takes what is left, cut to fit.
      return [...lines, fit(`${line ? line + ' ' : ''}${words.slice(i).join(' ')}`)];
    }
    if (line) lines.push(line);
    line = measure(words[i]) <= maxWidth ? words[i] : fit(words[i]);
  }
  if (line) lines.push(line);
  return lines;
}

// A file name from the card's name: letters and digits, dashes between.
export function fileStem(name: string): string {
  const slug = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return slug ? `notfallkarte-${slug}` : 'notfallkarte';
}
