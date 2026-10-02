<script lang="ts">
  import Button from '../components/Button.svelte';
  import RevokedButton from '../components/RevokedButton.svelte';
  import { cards, type Card } from '../lib/cards.svelte';
  import { confirm, toast } from '../lib/confirm.svelte';
  import { connection, type LinkStatus } from '../lib/connection.svelte';
  import { formatDate, t } from '../lib/i18n.svelte';
  import type { MessageKey } from '../lib/locales/en';

  function status(l: LinkStatus): string {
    const state = t(`link.${l.status}` as MessageKey);
    if (l.status !== 'active') return state;
    return `${state} · ${l.viewCount > 0 ? t('link.opened', { n: l.viewCount }) : t('link.notOpened')}`;
  }

  function leadsTo(card: Card): string {
    return t('list.groups', { names: card.groups.map((g) => t(`group.${g}` as MessageKey)).join(', ') });
  }

  async function reopen(card: Card) {
    await cards.propose(card);
  }

  // Removing a card only takes it off this list. A link that is still live is
  // said out loud: ended here when the owner allowed that, otherwise left for
  // them to revoke in revoked — until then a printed card keeps working.
  async function remove(card: Card) {
    const link = connection.linkFor(card.id);
    const live = link?.status === 'active' || link?.status === 'paused';
    const revoke = live && connection.allowRevoke;
    const ok = await confirm.ask({
      title: t('remove.title', { name: card.name }),
      message: t(revoke ? 'remove.revokes' : live ? 'remove.staysLive' : 'remove.plain'),
      action: t(revoke ? 'remove.revokeAction' : 'remove.action'),
      destructive: true,
    });
    if (!ok) return;
    if (revoke && !(await connection.revoke(link!.id))) {
      toast.show(t('remove.revokeFailed'));
      return;
    }
    cards.remove(card);
  }
</script>

<div class="stack">
  <div class="spread">
    <h1 class="header">{t('list.title')}</h1>
    {#if cards.items.length}
      <Button small variant="primary" icon="plus" onclick={() => (window.location.hash = '#/new')}>{t('tab.new')}</Button>
    {/if}
  </div>

  {#if cards.items.length}
    <ul class="list">
      {#each cards.items as card (card.id)}
        {@const link = connection.linkFor(card.id)}
        <li>
          <div class="grow">
            <span class="name">{card.name}</span>
            <span class="small muted">{leadsTo(card)} · {formatDate(card.created)}</span>
            {#if link}
              <span class="small status" class:live={link.status === 'active'}>{status(link)}</span>
            {:else if connection.connected}
              <span class="small muted">{t('link.none')}</span>
            {/if}
          </div>
          <div class="actions">
            <Button small variant="primary" icon="qr" onclick={() => (cards.open = card)}>{t('list.card')}</Button>
            <span title={t('list.openHint')}>
              <RevokedButton small onclick={() => reopen(card)}>{t('list.open')}</RevokedButton>
            </span>
            <Button small icon="trash" tooltip={t('tool.remove')} onclick={() => remove(card)} />
          </div>
        </li>
      {/each}
    </ul>
    {#if !connection.connected}
      <p class="small muted">{t('list.connectHint')} <a href="#/settings">{t('tab.settings')}</a></p>
    {/if}
  {:else}
    <div class="empty">
      <p class="muted">{t('list.empty')}</p>
      <Button variant="primary" icon="plus" onclick={() => (window.location.hash = '#/new')}>{t('tab.new')}</Button>
    </div>
  {/if}
</div>

<style>
  .list {
    list-style: none;
    margin: 0;
    padding: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
  }
  .list li {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
  }
  .list li + li {
    border-top: 1px solid var(--border);
  }
  .grow {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .name {
    font-weight: 600;
    overflow-wrap: anywhere;
  }
  .status {
    color: var(--fg-muted);
  }
  .status.live {
    color: var(--primary);
    font-weight: 550;
  }
  .actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
  .actions span {
    display: inline-flex;
  }
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-6);
    border: 1px dashed var(--border-strong);
    border-radius: var(--radius-lg);
    text-align: center;
  }
  @media (max-width: 520px) {
    .list li {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
