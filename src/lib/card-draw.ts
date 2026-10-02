// Draws a card on a canvas and turns it into the files to download. Done in
// the browser: the link a card holds goes nowhere but into its own code.

import { cardSize, cardText, contents, displayUrl, qrMatrix, wrapLines, type CardFace } from './card-face';
import { buildPdf } from './pdf-writer';

const sans = "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const mono = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

// Print colours, the same on a light and a dark page: the card is paper.
const ink = '#111111';
const soft = '#555555';
const edge = '#9a9a9a';
const band = '#b3261e';

// 300 dpi, in pixels per millimetre.
const printScale = 300 / 25.4;
const a4 = { width: 210, height: 297 };
const pointsPerMm = 72 / 25.4;

// Everything below is in millimetres from the card's top left corner; `s`
// turns them into pixels.
export function drawCard(ctx: CanvasRenderingContext2D, face: CardFace, x: number, y: number, s: number) {
  const { width, height } = cardSize;
  const margin = 5;
  const bandHeight = 10.5;
  const qrSize = 30;
  const qrLeft = width - margin - qrSize;
  const qrTop = bandHeight + 4;
  const columnWidth = qrLeft - margin - 3.5;

  const font = (size: number, weight = 400, family = sans) => {
    ctx.font = `${weight} ${size * s}px ${family}`;
  };
  const measure = (t: string) => ctx.measureText(t).width / s;

  ctx.save();
  ctx.translate(x, y);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  ctx.beginPath();
  ctx.roundRect(0, 0, width * s, height * s, 3 * s);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width * s, height * s);
  ctx.fillStyle = band;
  ctx.fillRect(0, 0, width * s, bandHeight * s);
  ctx.restore();
  ctx.lineWidth = 0.2 * s;
  ctx.strokeStyle = edge;
  ctx.stroke();

  // Both languages, whatever the page is set to: a card is read where it is
  // found, not where it was made.
  ctx.fillStyle = '#ffffff';
  font(4, 800);
  ctx.fillText(cardText.de.title, margin * s, 7 * s);
  const afterTitle = margin + measure(cardText.de.title);
  font(3, 600);
  ctx.fillText(`·  ${cardText.en.title}`, (afterTitle + 2) * s, 6.8 * s);

  let top = qrTop;
  const block = (text: string, size: number, weight: number, colour: string, maxLines: number, gap: number) => {
    font(size, weight);
    ctx.fillStyle = colour;
    const leading = size * 1.25;
    for (const line of wrapLines(measure, text, columnWidth, maxLines)) {
      ctx.fillText(line, margin * s, (top + size * 0.85) * s);
      top += leading;
    }
    top += gap;
  };
  block(face.name, 4, 700, ink, 2, 1.2);
  block(cardText.de.scan, 2.5, 700, ink, 1, 0);
  block(cardText.en.scan, 2.5, 400, ink, 1, 1.2);
  block(contents(face.groups, 'de'), 2, 400, soft, 3, 0.5);
  block(contents(face.groups, 'en'), 2, 400, soft, 3, 0);

  // Whole pixels per module, so no edge is blurred; the white card around the
  // code is its quiet zone.
  const modules = qrMatrix(face.url);
  const cell = Math.max(1, Math.floor((qrSize * s) / modules.length));
  const side = cell * modules.length;
  const left = Math.round(qrLeft * s + (qrSize * s - side) / 2);
  const upper = Math.round(qrTop * s + (qrSize * s - side) / 2);
  ctx.fillStyle = '#000000';
  modules.forEach((row, r) =>
    row.forEach((dark, c) => {
      if (dark) ctx.fillRect(left + c * cell, upper + r * cell, cell, cell);
    }),
  );

  // The link in letters, for whoever has no scanner — left out rather than
  // cut when it is too long to type anyway.
  const shown = displayUrl(face.url);
  for (const size of [2.1, 1.8, 1.5]) {
    font(size, 400, mono);
    if (measure(shown) > width - 2 * margin) continue;
    ctx.fillStyle = soft;
    ctx.fillText(shown, margin * s, (height - 2.6) * s);
    break;
  }
  ctx.restore();
}

function canvasOf(widthMm: number, heightMm: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(widthMm * printScale);
  canvas.height = Math.round(heightMm * printScale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no canvas');
  return { canvas, ctx };
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode'))), type, quality),
  );
}

// The card alone, at print resolution, its corners transparent.
export function cardPng(face: CardFace): Promise<Blob> {
  const { canvas, ctx } = canvasOf(cardSize.width, cardSize.height);
  drawCard(ctx, face, 0, 0, printScale);
  return toBlob(canvas, 'image/png');
}

// An A4 sheet with the card at its true size, to print and cut out.
export async function sheetPdf(face: CardFace, caption: string): Promise<Blob> {
  const { canvas, ctx } = canvasOf(a4.width, a4.height);
  const s = printScale;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const left = (a4.width - cardSize.width) / 2;
  const top = 25;
  drawCard(ctx, face, left * s, top * s, s);

  ctx.font = `400 ${3.2 * s}px ${sans}`;
  ctx.fillStyle = soft;
  ctx.textAlign = 'center';
  const measure = (t: string) => ctx.measureText(t).width / s;
  wrapLines(measure, caption, 150, 4).forEach((line, i) =>
    ctx.fillText(line, (a4.width / 2) * s, (top + cardSize.height + 9 + i * 4.6) * s),
  );

  const jpeg = new Uint8Array(await (await toBlob(canvas, 'image/jpeg', 0.95)).arrayBuffer());
  const pdf = buildPdf([
    {
      jpeg,
      pixelWidth: canvas.width,
      pixelHeight: canvas.height,
      width: a4.width * pointsPerMm,
      height: a4.height * pointsPerMm,
    },
  ]);
  return new Blob([pdf as BlobPart], { type: 'application/pdf' });
}

export function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
