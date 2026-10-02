<script lang="ts">
  import Alert from '../components/Alert.svelte';
  import Card from '../components/Card.svelte';
  import CheckRow from '../components/CheckRow.svelte';
  import RevokedButton from '../components/RevokedButton.svelte';
  import TextField from '../components/TextField.svelte';
  import { cards } from '../lib/cards.svelte';
  import { groupKeys, groups, type Group } from '../lib/emergency';
  import { t } from '../lib/i18n.svelte';
  import type { MessageKey } from '../lib/locales/en';
  import { maxName } from '../lib/proposal';

  let { oncreated }: { oncreated: () => void } = $props();

  // What a group sends, in words.
  function includes(g: Group): string {
    return groupKeys[g].map((k) => t(`field.${k}` as MessageKey)).join(', ');
  }

  async function start() {
    const card = cards.save();
    if (!card) return;
    // The card is in the list now; that is where its link will show up.
    oncreated();
    await cards.propose(card);
  }
</script>

<div class="stack">
  <div class="stack-sm">
    <h1 class="header">{t('new.title')}</h1>
    <p class="muted">{t('tool.note')}</p>
  </div>

  <Card>
    <form
      class="stack"
      onsubmit={(e) => {
        e.preventDefault();
        start();
      }}
    >
      <TextField
        label={t('tool.name')}
        placeholder={t('tool.namePlaceholder')}
        hint={t('tool.nameHint')}
        bind:value={cards.name}
        maxlength={maxName}
        autocomplete="name"
        required
      />

      <fieldset class="groups">
        <legend class="label">{t('tool.groups')}</legend>
        <p class="small muted">{t('tool.always')}</p>
        {#each groups as g (g)}
          <CheckRow checked={cards.picked.includes(g)} onchange={() => cards.toggle(g)}>
            <span class="text">
              <span class="name">{t(`group.${g}` as MessageKey)}</span>
              <span class="small muted">{includes(g)}</span>
            </span>
          </CheckRow>
        {/each}
      </fieldset>

      <Alert tone="warn">{t('tool.public')}</Alert>

      <div class="go">
        <RevokedButton type="submit" disabled={!cards.canSave}>{t('tool.continue')}</RevokedButton>
      </div>
    </form>
  </Card>
</div>

<style>
  .groups {
    border: 0;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }
  .label {
    font-size: 12px;
    font-weight: 600;
    color: var(--fg-muted);
    margin-bottom: var(--space-2);
  }
  .text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .name {
    font-weight: 600;
  }
  .go {
    display: flex;
    justify-content: flex-end;
  }
  @media (max-width: 480px) {
    .go :global(.revoked) {
      width: 100%;
    }
  }
</style>
