<script lang="ts">
  import { drawCard } from '../lib/card-draw';
  import { cardSize, type CardFace } from '../lib/card-face';
  import { t } from '../lib/i18n.svelte';

  // The card as it will print, drawn by the same code that makes the files.
  let { face }: { face: CardFace } = $props();

  let canvas: HTMLCanvasElement | undefined = $state();

  $effect(() => {
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    // Sharp on a dense screen, whatever width the layout gives it.
    const width = Math.round(420 * Math.max(2, window.devicePixelRatio || 1));
    canvas.width = width;
    canvas.height = Math.round((width * cardSize.height) / cardSize.width);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCard(ctx, face, 0, 0, width / cardSize.width);
  });
</script>

<!-- The text inside is what a screen reader gets in place of the drawing. -->
<canvas bind:this={canvas}>{t('card.preview', { name: face.name, url: face.url })}</canvas>

<style>
  canvas {
    display: block;
    width: 100%;
    max-width: 420px;
    aspect-ratio: 85.6 / 53.98;
    border-radius: 3.5% / 5.5%;
    box-shadow: 0 6px 24px rgb(0 0 0 / 0.18);
  }
</style>
