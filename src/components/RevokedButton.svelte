<script lang="ts">
  import type { Snippet } from 'svelte';

  // The button that hands over to revoked — the same one any site embeds
  // (examples/fill-with-revoked-button.html): black, the four-bar mark, on a
  // light or a dark page alike. With an href it is a link the app opens.
  let {
    href,
    type = 'button',
    small = false,
    disabled = false,
    onclick,
    children,
  }: {
    href?: string;
    type?: 'button' | 'submit';
    small?: boolean;
    disabled?: boolean;
    onclick?: (e: MouseEvent) => void;
    children: Snippet;
  } = $props();
</script>

{#snippet content()}
  <svg width={small ? 14 : 18} height={small ? 14 : 18} viewBox="100 100 300 300" aria-hidden="true">
    <rect x="100" y="100" width="300" height="44" />
    <rect x="140" y="185.33" width="220" height="44" />
    <rect x="100" y="270.67" width="300" height="44" />
    <rect x="180" y="356" width="140" height="44" />
  </svg>
  <span>{@render children()}</span>
{/snippet}

{#if href}
  <a class="revoked" class:small {href} {onclick}>{@render content()}</a>
{:else}
  <button class="revoked" class:small {type} {disabled} {onclick}>{@render content()}</button>
{/if}

<style>
  .revoked {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 40px;
    padding: 0 18px;
    background: #000000;
    color: #ffffff;
    border: 1px solid rgb(255 255 255 / 0.18);
    border-radius: 10px;
    font-weight: 600;
    font-size: 15px;
    line-height: 1;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    transition: opacity var(--motion);
  }
  .revoked svg {
    fill: #ffffff;
    flex: none;
  }
  .revoked:hover:not(:disabled) {
    opacity: 0.85;
  }
  .revoked.small {
    min-height: 30px;
    padding: 0 12px;
    gap: 8px;
    border-radius: 8px;
    font-size: 12px;
  }
  .revoked:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
