import { connection, refFor, refGroups, refId, sleep } from './connection.svelte';
import { defaultGroups, groups as allGroups, isGroup, keysFor, orderedGroups, type Group } from './emergency';
import { handoff } from './handoff.svelte';
import { i18n, t } from './i18n.svelte';
import { cleanName, nameFromLabel, proposalLink, validCardUrl, type Reasons } from './proposal';

export interface Card {
  id: string;
  name: string;
  groups: Group[];
  created: string;
}

// Why a card has no link to print yet.
export type Missing = 'notConnected' | 'noLink' | 'ended' | 'noPermission' | 'notHandedOver';

// The list of cards: whose it is and which groups it holds, never a value.
// Kept in this browser only. Once connected, a card this browser does not
// know is rebuilt from the link proposed for it, so another browser shows the
// cards that have a link — not the ones that never got one.
const storageKey = 'notfallkarte.cards';
// Cards removed here, so a link that still exists does not bring them back.
const removedKey = 'notfallkarte.removed';
// How often, and for how long, a page waits for the link revoked is asked to
// create: filling in what the vault lacks takes a while.
const askEvery = 3000;
const awaitLinkFor = 15 * 60_000;

function isCard(c: unknown): c is Card {
  const x = c as Partial<Card> | null;
  return (
    !!x &&
    typeof x.id === 'string' &&
    /^[A-Za-z0-9_-]{1,64}$/.test(x.id) &&
    typeof x.name === 'string' &&
    x.name.length > 0 &&
    typeof x.created === 'string' &&
    Array.isArray(x.groups) &&
    x.groups.length > 0 &&
    x.groups.every(isGroup)
  );
}

function readLocal(): Card[] {
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    return Array.isArray(raw) ? raw.filter(isCard) : [];
  } catch {
    return [];
  }
}

function readRemoved(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(removedKey) ?? '[]');
    return Array.isArray(raw) ? raw.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

// Why Notfallkarte asks for what the owner may allow or not.
export function reasons(): Reasons {
  return { revoke: t('reason.revoke'), links: t('reason.links') };
}

function newId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

class Cards {
  items = $state<Card[]>(readLocal());

  name = $state('');
  picked = $state<Group[]>([...defaultGroups]);

  canSave = $derived(cleanName(this.name).length > 0 && this.picked.length > 0);

  // The card whose code is on screen, to look at and download.
  open = $state<Card | null>(null);

  // Links typed in by hand, by card. They last as long as the tab: this tool
  // keeps no link of its own, only what revoked hands it.
  #pasted = $state<Record<string, string>>({});

  toggle(g: Group) {
    this.picked = this.picked.includes(g) ? this.picked.filter((x) => x !== g) : orderedGroups([...this.picked, g]);
  }

  // Once connected, a card known only through its link is added to the list.
  async sync() {
    if (!(await connection.refresh())) return;
    const known = new Set([...this.items.map((c) => c.id), ...readRemoved()]);
    const found: Card[] = [];
    // Newest first, so a card proposed twice comes back as it was last.
    for (const link of connection.links) {
      const card = {
        id: refId(link.ref),
        name: nameFromLabel(link.label),
        groups: allGroups.filter((g) => refGroups(link.ref).includes(g)),
        created: link.created,
      };
      if (known.has(card.id) || !isCard(card)) continue;
      known.add(card.id);
      found.push(card);
    }
    if (!found.length) return;
    this.items = [...this.items, ...found].sort((a, b) => b.created.localeCompare(a.created));
    this.#writeLocal();
  }

  // Saves the card and returns it, ready to open in revoked.
  save(): Card | null {
    if (!this.canSave) return null;
    const card: Card = {
      id: newId(),
      name: cleanName(this.name),
      groups: orderedGroups(this.picked),
      created: new Date().toISOString(),
    };
    this.items = [card, ...this.items];
    this.name = '';
    this.picked = [...defaultGroups];
    this.#writeLocal();
    return card;
  }

  // The proposal for a card. Its groups decide what goes in; the owner can
  // untick anything in revoked before the link exists. Not connected yet, it
  // asks to connect on the way — connected is how the link gets back here.
  async linkFor(c: Card): Promise<{ link: string; code?: string }> {
    const { state, challenge, code } = await connection.prepare(!connection.connected);
    const link = proposalLink(
      { name: c.name, locale: i18n.locale, keys: keysFor(c.groups) },
      {
        client: connection.client,
        redirect: connection.redirect,
        state,
        ref: refFor(c.id, c.groups),
        challenge,
        reasons: reasons(),
        poll: connection.watched ?? undefined,
      },
    );
    return { link, code };
  }

  // Opens revoked with the proposal for a card. A page that watches its
  // server then shows the card by itself once its link exists.
  async propose(c: Card) {
    const { link, code } = await this.linkFor(c);
    const before = connection.linkFor(c.id)?.id ?? null;
    handoff.open(
      { title: t('propose.title'), body: t('propose.body', { name: c.name }), link, code },
      async (signal) => {
        if (!(await this.#awaitLink(c, before, signal))) return;
        handoff.close();
        this.open = c;
      },
    );
  }

  // Waits for a link for the card other than the one it had: connected first
  // if it is not, then asking until revoked has created it or the dialog
  // closes.
  async #awaitLink(c: Card, before: string | null, signal: AbortSignal): Promise<boolean> {
    if (!connection.watched) return false;
    if (!connection.connected && !(await connection.awaitGrant(signal))) return false;
    const until = Date.now() + awaitLinkFor;
    while (!signal.aborted && Date.now() < until) {
      await this.sync();
      if (signal.aborted || !connection.connected) return false;
      const link = connection.linkFor(c.id);
      if (link && link.id !== before) return true;
      await sleep(askEvery, signal);
    }
    return false;
  }

  // The link a card's code holds: the one revoked handed over, else one
  // pasted here.
  urlFor(c: Card): string | null {
    return connection.linkFor(c.id)?.url ?? this.#pasted[c.id] ?? null;
  }

  missing(c: Card): Missing | null {
    if (this.urlFor(c)) return null;
    if (!connection.connected) return 'notConnected';
    const link = connection.linkFor(c.id);
    if (!link) return 'noLink';
    if (link.status !== 'active') return 'ended';
    return connection.allowHandOver ? 'notHandedOver' : 'noPermission';
  }

  // False when what was pasted is not a link a code could lead to.
  paste(c: Card, raw: string): boolean {
    const url = validCardUrl(raw);
    if (!url) return false;
    this.#pasted = { ...this.#pasted, [c.id]: url };
    return true;
  }

  // The card a link belongs to, e.g. the one revoked just created.
  byLink(linkId: string): Card | null {
    const link = connection.links.find((l) => l.id === linkId);
    return (link && this.items.find((c) => c.id === refId(link.ref))) ?? null;
  }

  remove(c: Card) {
    this.items = this.items.filter((x) => x.id !== c.id);
    if (this.open?.id === c.id) this.open = null;
    this.#writeLocal();
    try {
      localStorage.setItem(removedKey, JSON.stringify([...readRemoved(), c.id].slice(-200)));
    } catch {
      /* storage blocked: the card may come back with its link */
    }
  }

  #writeLocal() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(this.items));
    } catch {
      /* storage blocked: the list lasts as long as the tab */
    }
  }
}

export const cards = new Cards();
