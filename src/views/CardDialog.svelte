<script lang="ts">
  import Alert from '../components/Alert.svelte';
  import Button from '../components/Button.svelte';
  import CardPreview from '../components/CardPreview.svelte';
  import Dialog from '../components/Dialog.svelte';
  import RevokedButton from '../components/RevokedButton.svelte';
  import TextField from '../components/TextField.svelte';
  import { cardPng, save, sheetPdf } from '../lib/card-draw';
  import { fileStem, type CardFace } from '../lib/card-face';
  import { cards } from '../lib/cards.svelte';
  import { copyText, toast } from '../lib/confirm.svelte';
  import { connection } from '../lib/connection.svelte';
  import { t } from '../lib/i18n.svelte';
  import type { MessageKey } from '../lib/locales/en';

  const card = $derived(cards.open);
  const url = $derived(card ? cards.urlFor(card) : null);
  const missing = $derived(card ? cards.missing(card) : null);
  const face = $derived<CardFace | null>(card && url ? { name: card.name, url, groups: card.groups } : null);
  // A link revoked handed over is known to be this card's; a pasted one is not.
  const pasted = $derived(!!card && !!url && !connection.linkFor(card.id)?.url);

  let paste = $state('');
  let pasteError = $state<string | null>(null);
  let busy = $state<'png' | 'pdf' | null>(null);

  function close() {
    cards.open = null;
    paste = '';
    pasteError = null;
  }

  function usePasted() {
    if (!card) return;
    pasteError = cards.paste(card, paste) ? null : t('card.pasteInvalid');
    if (!pasteError) paste = '';
  }

  // Creating the link happens in revoked; this dialog makes way for that one.
  async function create() {
    if (!card) return;
    const current = card;
    close();
    await cards.propose(current);
  }

  async function download(kind: 'png' | 'pdf') {
    if (!face) return;
    busy = kind;
    try {
      const blob = kind === 'png' ? await cardPng(face) : await sheetPdf(face, t('card.caption'));
      save(blob, `${fileStem(face.name)}.${kind}`);
    } catch {
      toast.show(t('card.failed'));
    } finally {
      busy = null;
    }
  }
</script>

<Dialog open={!!card} title={card ? t('card.title', { name: card.name }) : ''} onclose={close}>
  {#if card}
    {#if face}
      <div class="stack center">
        <CardPreview {face} />
        <p>{t('card.ready')}</p>
        {#if pasted}
          <Alert tone="warn">{t('card.pasted')}</Alert>
        {:else}
          <p class="small muted">{t('card.test')}</p>
        {/if}
      </div>
    {:else if missing}
      <div class="stack">
        <Alert tone="info">{t(`card.missing.${missing}` as MessageKey)}</Alert>
        {#if missing === 'notConnected' || missing === 'noLink' || missing === 'ended'}
          <div class="row">
            <RevokedButton onclick={create}>{t('card.create')}</RevokedButton>
          </div>
        {/if}
        <form
          class="stack-sm"
          onsubmit={(e) => {
            e.preventDefault();
            usePasted();
          }}
        >
          <TextField
            label={t('card.paste')}
            type="url"
            placeholder="https://"
            hint={t('card.pasteHint')}
            error={pasteError}
            bind:value={paste}
            autocomplete="off"
          />
          <div class="row">
            <Button type="submit" disabled={!paste.trim()}>{t('card.pasteAction')}</Button>
          </div>
        </form>
      </div>
    {/if}
  {/if}
  {#snippet footer()}
    {#if face}
      <Button icon="copy" onclick={() => copyText(face.url, t('card.copied'))}>{t('card.copy')}</Button>
      <Button icon="download" busy={busy === 'png'} disabled={busy !== null} onclick={() => download('png')}
        >{t('card.png')}</Button
      >
      <Button
        variant="primary"
        icon="download"
        busy={busy === 'pdf'}
        disabled={busy !== null}
        onclick={() => download('pdf')}>{t('card.pdf')}</Button
      >
    {:else}
      <Button variant="primary" onclick={close}>{t('common.done')}</Button>
    {/if}
  {/snippet}
</Dialog>

<style>
  .center {
    align-items: center;
    text-align: center;
  }
</style>
