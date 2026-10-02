<script lang="ts">
  import Button from '../components/Button.svelte';
  import Dialog from '../components/Dialog.svelte';
  import QrCode from '../components/QrCode.svelte';
  import RevokedButton from '../components/RevokedButton.svelte';
  import { copyText } from '../lib/confirm.svelte';
  import { handoff } from '../lib/handoff.svelte';
  import { t } from '../lib/i18n.svelte';
</script>

<!-- Shown while revoked opens: the next step happens there, and on a
     computer without the app the phone takes over through the code. -->
<Dialog open={!!handoff.current} title={handoff.current?.title ?? ''} onclose={() => handoff.close()}>
  {#if handoff.current}
    <div class="stack center">
      <p>{handoff.current.body}</p>
      {#if handoff.current.code}
        <p class="check">
          {t('propose.code')}
          <strong>{handoff.current.code}</strong>
          <span class="small muted">{t('propose.codeHint')}</span>
        </p>
      {/if}
      <RevokedButton href={handoff.current.link}>{t('propose.open')}</RevokedButton>
      <p class="small muted">{t('propose.qrHint')}</p>
      <QrCode text={handoff.current.link} size={180} />
      <p class="small muted">{t('propose.noApp')}</p>
    </div>
  {/if}
  {#snippet footer()}
    <Button icon="copy" onclick={() => handoff.current && copyText(handoff.current.link, t('propose.copied'))}
      >{t('propose.copy')}</Button
    >
    <Button variant="primary" onclick={() => handoff.close()}>{t('common.done')}</Button>
  {/snippet}
</Dialog>

<style>
  .center {
    align-items: center;
    text-align: center;
  }
  .check {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
  }
  .check strong {
    font-family: var(--font-mono, monospace);
    font-size: 24px;
    letter-spacing: 0.08em;
  }
</style>
