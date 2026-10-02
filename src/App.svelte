<script lang="ts">
  import Alert from './components/Alert.svelte';
  import ConfirmDialog from './components/ConfirmDialog.svelte';
  import Icon, { type IconName } from './components/Icon.svelte';
  import Toast from './components/Toast.svelte';
  import { cards } from './lib/cards.svelte';
  import { connection } from './lib/connection.svelte';
  import { handoff } from './lib/handoff.svelte';
  import { t } from './lib/i18n.svelte';
  import type { MessageKey } from './lib/locales/en';
  import CardDialog from './views/CardDialog.svelte';
  import CardsView from './views/CardsView.svelte';
  import Landing from './views/Landing.svelte';
  import NewView from './views/NewView.svelte';
  import ProposeDialog from './views/ProposeDialog.svelte';
  import SettingsView from './views/SettingsView.svelte';

  // Three tabs, each one job; the explainer is a page of its own.
  type Tab = 'new' | 'list' | 'settings';
  type View = Tab | 'about';

  const tabs: { id: Tab; icon: IconName; label: MessageKey; short: MessageKey }[] = [
    { id: 'new', icon: 'plus', label: 'tab.new', short: 'tab.new.short' },
    { id: 'list', icon: 'card', label: 'tab.list', short: 'tab.list.short' },
    { id: 'settings', icon: 'link', label: 'tab.settings', short: 'tab.settings' },
  ];

  // With nothing in the address, someone who already has a card wants it;
  // someone new wants to make the first.
  function fromHash(): View {
    const h = window.location.hash.replace(/^#\/?/, '');
    if (h === 'about' || tabs.some((x) => x.id === h)) return h as View;
    return cards.items.length ? 'list' : 'new';
  }

  let view = $state<View>(fromHash());

  $effect(() => {
    document.title = t('app.title');
  });

  // Coming back from revoked: finish connecting if it sent a code, then show
  // the card whose link it just created — that is what they came back for.
  connection.handleReturn().then(async (status) => {
    if (status === 'created' || status === 'declined') window.location.hash = '#/list';
    if (!connection.connected) return;
    await cards.sync();
    const made = connection.returnedLink && cards.byLink(connection.returnedLink);
    if (made) cards.open = made;
  });

  // "Opened 2×" is only worth something if it is current when you look.
  // And a tab left waiting while another one finished connecting catches up.
  function refresh() {
    if (connection.adopt() && connection.connected) handoff.close();
    if (connection.connected && document.visibilityState === 'visible') void cards.sync();
  }
</script>

<svelte:window onhashchange={() => (view = fromHash())} onstorage={refresh} />
<svelte:document onvisibilitychange={refresh} />

{#if view === 'about'}
  <Landing onstart={() => (window.location.hash = '#/new')} />
{:else}
  <header>
    <div class="bar">
      <a class="brand" href="#/about">
        <img class="logo light" src="/revoced-mark-redacted-black-on-white.svg" alt="" />
        <img class="logo dark" src="/revoced-mark-redacted-white-on-black.svg" alt="" />
        <span class="name">{t('brand.name')}<small>{t('brand.by')} <span class="wordmark">Revoked</span></small></span>
      </a>
    </div>
    <nav class="tabs" aria-label={t('shell.nav')}>
      {#each tabs as tab (tab.id)}
        <a href="#/{tab.id}" class:on={view === tab.id} aria-current={view === tab.id ? 'page' : undefined}>
          <Icon name={tab.icon} />
          <span class="long">{t(tab.label)}</span>
          <span class="short">{t(tab.short)}</span>
          {#if tab.id === 'list' && cards.items.length}
            <span class="count">{cards.items.length}</span>
          {/if}
        </a>
      {/each}
    </nav>
  </header>

  <main>
    {#if connection.error === 'connect'}
      <div class="notice"><Alert tone="bad">{t('connect.failed')}</Alert></div>
    {/if}
    {#if view === 'settings'}
      <SettingsView />
    {:else if view === 'list'}
      <CardsView />
    {:else}
      <NewView oncreated={() => (window.location.hash = '#/list')} />
    {/if}
  </main>
{/if}

<CardDialog />
<ProposeDialog />
<ConfirmDialog />
<Toast />

<style>
  header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
  }
  .bar {
    max-width: 640px;
    margin: 0 auto;
    padding: var(--space-2) var(--space-4);
  }
  .tabs {
    max-width: 640px;
    margin: 0 auto;
    padding: 0 var(--space-4);
    display: flex;
    gap: var(--space-1);
  }
  .tabs a {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    color: var(--fg-muted);
    font-weight: 550;
    text-decoration: none;
    white-space: nowrap;
  }
  .tabs a:hover {
    color: var(--fg);
  }
  .tabs a.on {
    color: var(--primary);
    border-bottom-color: var(--primary);
  }
  .short {
    display: none;
  }
  .count {
    min-width: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: var(--sunken);
    color: var(--fg);
    font-size: 11px;
    line-height: 18px;
    text-align: center;
  }
  .notice {
    margin-bottom: var(--space-4);
  }
  .brand {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-weight: 700;
    font-size: 16px;
    color: inherit;
    text-decoration: none;
  }
  .logo {
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
  }
  .name {
    display: flex;
    flex-direction: column;
    line-height: 1.15;
  }
  .name small {
    font-size: 11px;
    font-weight: 500;
    color: var(--fg-muted);
  }
  .logo.dark {
    display: none;
  }
  @media (prefers-color-scheme: dark) {
    :global(:root:not([data-theme='light'])) .logo.light {
      display: none;
    }
    :global(:root:not([data-theme='light'])) .logo.dark {
      display: block;
    }
  }
  :global(:root[data-theme='dark']) .logo.light {
    display: none;
  }
  :global(:root[data-theme='dark']) .logo.dark {
    display: block;
  }
  main {
    max-width: 640px;
    margin: 0 auto;
    padding: var(--space-6) var(--space-4) var(--space-6);
  }

  @media (max-width: 560px) {
    .tabs {
      justify-content: space-between;
      gap: 0;
      padding: 0 var(--space-2);
      overflow-x: auto;
    }
    .tabs a {
      padding: var(--space-2) 6px;
      font-size: 13px;
    }
    .tabs :global(svg),
    .long,
    .count {
      display: none;
    }
    .short {
      display: inline;
    }
  }
</style>
