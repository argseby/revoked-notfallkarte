<script lang="ts">
  import Button from '../components/Button.svelte';
  import Card from '../components/Card.svelte';
  import Icon from '../components/Icon.svelte';
  import RevokedButton from '../components/RevokedButton.svelte';
  import Segmented from '../components/Segmented.svelte';
  import TextField from '../components/TextField.svelte';
  import { cards, reasons } from '../lib/cards.svelte';
  import { connection } from '../lib/connection.svelte';
  import { handoff } from '../lib/handoff.svelte';
  import { i18n, t } from '../lib/i18n.svelte';
  import { theme } from '../lib/theme.svelte';

  let server = $state(connection.server ?? '');
  let serverInvalid = $state(false);

  function saveServer() {
    serverInvalid = !connection.setServer(server);
  }

  async function connect() {
    saveServer();
    if (serverInvalid) return;
    const { link, code } = await connection.connectLink(reasons());
    // Watching its server, this page finishes connecting by itself.
    handoff.open({ title: t('connect.title'), body: t('connect.body'), link, code }, async (signal) => {
      if (!(await connection.awaitGrant(signal))) return;
      handoff.close();
      void cards.sync();
    });
  }
</script>

<div class="stack">
  <h1 class="header">{t('tab.settings')}</h1>

  <Card>
    <div class="stack-sm">
      <h2 class="title">{t('settings.connection')}</h2>
      {#if connection.connected}
        <p class="row ok"><Icon name="check" /> {t('connect.connected', { host: connection.serverHost })}</p>
        <p class="small muted">{t('settings.connectedHint')}</p>
        {#if connection.loaded}
          <ul class="perms small">
            <li class:off={!connection.allowRevoke}>
              <Icon name={connection.allowRevoke ? 'check' : 'close'} size={14} />
              {t(connection.allowRevoke ? 'perm.revoke.on' : 'perm.revoke.off')}
            </li>
            <li class:off={!connection.allowHandOver}>
              <Icon name={connection.allowHandOver ? 'check' : 'close'} size={14} />
              {t(connection.allowHandOver ? 'perm.links.on' : 'perm.links.off')}
            </li>
          </ul>
          <p class="small muted">{t('perm.change')}</p>
        {/if}
      {:else}
        <p class="muted">{t('connect.pitch')}</p>
        <TextField
          label={t('settings.server')}
          bind:value={server}
          type="url"
          placeholder="https://revoked.example.com"
          hint={t('settings.serverHint')}
          error={serverInvalid ? t('settings.serverInvalid') : null}
          onblur={saveServer}
        />
      {/if}
    </div>
    {#snippet actions()}
      {#if connection.connected}
        <Button small variant="destructive" icon="logout" onclick={() => connection.disconnect()}
          >{t('connect.disconnect')}</Button
        >
      {:else}
        <RevokedButton onclick={connect}>{t('connect.title')}</RevokedButton>
      {/if}
    {/snippet}
  </Card>

  <Card>
    <div class="stack">
      <h2 class="title">{t('settings.display')}</h2>
      <div class="spread">
        <span>{t('settings.language')}</span>
        <Segmented
          label={t('settings.language')}
          options={[
            { value: 'de', label: 'Deutsch' },
            { value: 'en', label: 'English' },
          ]}
          bind:value={() => i18n.locale, (v) => i18n.set(v)}
        />
      </div>
      <div class="spread">
        <span>{t('settings.theme')}</span>
        <Segmented
          label={t('settings.theme')}
          options={[
            { value: 'light', label: t('settings.light') },
            { value: 'dark', label: t('settings.dark') },
          ]}
          bind:value={() => (theme.dark ? 'dark' : 'light'), (v) => theme.set(v)}
        />
      </div>
    </div>
  </Card>

  <a class="about" href="#/about"><Icon name="shield" /> {t('shell.about')}</a>
</div>

<style>
  .ok {
    color: var(--ok);
    font-weight: 550;
    flex-wrap: nowrap;
  }
  .perms {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  .perms li {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
  .perms li.off {
    color: var(--fg-muted);
  }
  .about {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-weight: 550;
    text-decoration: none;
  }
  .about:hover {
    text-decoration: underline;
  }
</style>
