// The tool's connection to the owner's revoked, when they connected it.
//
// Connected, this tool may see what became of the links it proposed — status,
// views, expiry, and the link itself only when they handed it over, which is
// what it prints on the card. It keeps nothing on their server: a link carries
// the card's name as its label and this tool's reference for it, and that is
// all it gets back. It never reads their vault, and it never holds their
// password: the app issues a one-time code bound to a PKCE challenge only this
// page knows the verifier for.
//
// The app hands that code over by opening this page's return address — in a
// browser, which need not be the one that asked, and always in a new tab. So
// a page that knows which server to ask collects the answer itself: it names
// the server in its link, the app opens nothing, and the page asks the server
// with its verifier until the owner has answered. Nothing ties such an answer
// to this browser but the owner, who compares a code both ends derive from
// the challenge.

import { reasonParams, type Reasons } from './proposal';

const connectionKey = 'notfallkarte.connection';
const pendingKey = 'notfallkarte.pending';
const serverKey = 'notfallkarte.server';
// How often a waiting page asks, and for how long: the server keeps an
// answer for five minutes.
const askEvery = 3000;
const askFor = 5 * 60_000;
const appName = 'Notfallkarte';

export interface LinkStatus {
  id: string;
  ref: string;
  label: string;
  status: 'active' | 'paused' | 'revoked' | 'expired';
  viewCount: number;
  expiresAt: string;
  created: string;
  handedOver: boolean;
  url?: string;
}

interface Stored {
  server: string;
  token: string;
}

// What a revoked:// link this page sent is waiting for, by its state value.
interface Pending {
  verifier?: string;
  created: number;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage blocked: the connection lasts as long as the tab */
  }
}

function base64url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function randomToken(bytes = 32): string {
  return base64url(crypto.getRandomValues(new Uint8Array(bytes)));
}

export async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64url(new Uint8Array(digest));
}

// The code the page shows while it waits and revoked shows before it answers,
// for the owner to compare: "83C-047".
export async function checkCode(challenge: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(challenge));
  const hex = Array.from(new Uint8Array(digest).slice(0, 3), (b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
  return `${hex.slice(0, 3)}-${hex.slice(3)}`;
}

// A pause a closed dialog cuts short.
export function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve();
    const timer = setTimeout(done, ms);
    function done() {
      clearTimeout(timer);
      signal.removeEventListener('abort', done);
      resolve();
    }
    signal.addEventListener('abort', done);
  });
}

// A server address as someone types it: the scheme may be left out.
export function serverFrom(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return validServer(s);
  return validServer((/^(localhost|127\.0\.0\.1)(:|\/|$)/i.test(s) ? 'http://' : 'https://') + s);
}

// The server is only ever what the revoked app said it is, on the way back,
// or what the owner typed in Settings.
function validServer(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:' && !(u.protocol === 'http:' && /^(localhost|127\.0\.0\.1)$/.test(u.hostname))) {
      return null;
    }
    return u.origin;
  } catch {
    return null;
  }
}

// A link's ref is "<card id>.<group>-<group>…": what this tool needs to
// recognise a card in another browser, and nothing about its owner.
export function refFor(id: string, groups: readonly string[]): string {
  return `${id}.${groups.join('-')}`;
}

export function refId(ref: string): string {
  return ref.split('.')[0];
}

export function refGroups(ref: string): string[] {
  return (ref.split('.')[1] ?? '').split('-').filter(Boolean);
}

class Connection {
  stored = $state<Stored | null>(readJSON<Stored | null>(connectionKey, null));
  links = $state<LinkStatus[]>([]);
  // What the owner lets this tool do beyond following its links: revoke
  // them, and receive the ones they share.
  allowRevoke = $state(false);
  allowHandOver = $state(false);
  loaded = $state(false);
  error = $state<string | null>(null);
  // The link the app just created, by id, when it sent the owner back.
  returnedLink = $state<string | null>(null);
  // The owner's server as this browser last knew it, or as they typed it in
  // Settings. It outlasts a disconnect: it is an address, not a credential.
  server = $state<string | null>(validServer(readJSON<string | null>(serverKey, null)));
  // The answer this page is waiting to collect, from the last link it sent.
  #grant: { verifier: string; server: string } | null = null;

  connected = $derived(this.stored !== null);
  // The server this page asks for what became of a link it sent, when it
  // knows one. Without it the app sends the owner back to the return address.
  watched = $derived(this.stored?.server ?? this.server);
  serverHost = $derived(this.stored ? new URL(this.stored.server).host : '');

  // Where the revoked app sends the owner back to.
  get redirect(): string {
    return window.location.origin + '/';
  }

  get client(): string {
    return window.location.origin;
  }

  // False when what was typed is not a server address; empty forgets it.
  setServer(raw: string): boolean {
    const next = raw.trim() ? serverFrom(raw) : null;
    if (raw.trim() && !next) return false;
    this.server = next;
    writeJSON(serverKey, next);
    return true;
  }

  // Remembers what a link is waiting for, and returns its state value — and,
  // when this page will collect the answer itself, the code to compare.
  async prepare(connect: boolean): Promise<{ state: string; challenge?: string; code?: string }> {
    const state = randomToken(16);
    const pending = readJSON<Record<string, Pending>>(pendingKey, {});
    // Old entries go: a link not answered within a day will not be.
    const cutoff = Date.now() - 86_400_000;
    for (const [k, v] of Object.entries(pending)) if (v.created < cutoff) delete pending[k];
    const entry: Pending = { created: Date.now() };
    let challenge: string | undefined;
    let code: string | undefined;
    this.#grant = null;
    if (connect) {
      entry.verifier = randomToken(32);
      challenge = await pkceChallenge(entry.verifier);
      if (this.watched) {
        this.#grant = { verifier: entry.verifier, server: this.watched };
        code = await checkCode(challenge);
      }
    }
    pending[state] = entry;
    writeJSON(pendingKey, pending);
    return { state, challenge, code };
  }

  async connectLink(reasons: Reasons): Promise<{ link: string; code?: string }> {
    const { state, challenge, code } = await this.prepare(true);
    const q = [
      ['client', this.client],
      ['name', appName],
      ['redirect', this.redirect],
      ['state', state],
      ['challenge', challenge!],
      ...reasonParams(reasons),
    ];
    if (this.watched) q.push(['poll', this.watched]);
    return { link: 'revoked://connect?' + q.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&'), code };
  }

  // Asks the server for the owner's answer to the link this page just sent,
  // until there is one, the answer lapses, or the dialog closes. True once
  // this browser is connected — also when another tab got there first.
  async awaitGrant(signal: AbortSignal): Promise<boolean> {
    const grant = this.#grant;
    if (!grant) return false;
    const until = Date.now() + askFor;
    while (!signal.aborted && Date.now() < until) {
      if (this.stored) return true;
      try {
        const res = await fetch(grant.server + '/api/connect/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verifier: grant.verifier, redirectUri: this.redirect }),
          signal,
        });
        if (res.status === 200) {
          const body = (await res.json()) as { token: string };
          this.#connect(grant.server, body.token);
          return true;
        }
        if (res.status === 400) {
          // The answer lapsed, or was not this page's to collect.
          this.error = 'connect';
          return false;
        }
        // 202: not answered yet. Anything else: ask again.
      } catch {
        /* unreachable for the moment, or the dialog closed */
      }
      await sleep(askEvery, signal);
    }
    return false;
  }

  // Reads what the revoked app sent back in the address, if anything, and
  // clears it from the address bar. Only answers to links this page sent
  // count — the state has to match.
  async handleReturn(): Promise<'connected' | 'created' | 'declined' | null> {
    const params = new URLSearchParams(window.location.search);
    const state = params.get('state');
    const status = params.get('status');
    if (!state || !status) return null;
    window.history.replaceState(null, '', window.location.pathname + window.location.hash);

    const pending = readJSON<Record<string, Pending>>(pendingKey, {});
    const entry = pending[state];
    if (!entry) return null;
    delete pending[state];
    writeJSON(pendingKey, pending);

    const link = params.get('link');
    if (status === 'created' && link && /^[A-Za-z0-9]{1,64}$/.test(link)) this.returnedLink = link;

    const code = params.get('code');
    const server = validServer(params.get('server'));
    if (code && entry.verifier && server) {
      try {
        const res = await fetch(server + '/api/connect/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, verifier: entry.verifier, redirectUri: this.redirect }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const body = (await res.json()) as { token: string };
        this.#connect(server, body.token);
      } catch {
        this.error = 'connect';
      }
    }
    return status === 'connected' || status === 'created' || status === 'declined' ? status : null;
  }

  // The app answers in a new tab, so the tab that asked learns of it from
  // what that one stored. Reports whether the connection here changed.
  adopt(): boolean {
    const next = readJSON<Stored | null>(connectionKey, null);
    if (next?.token === this.stored?.token && next?.server === this.stored?.server) return false;
    if (next) {
      this.stored = next;
      this.loaded = false;
    } else {
      this.#forget();
    }
    return true;
  }

  async refresh(): Promise<boolean> {
    const s = this.stored;
    if (!s) return false;
    try {
      const res = await fetch(s.server + '/api/connection', { headers: { 'X-Revoked-Connection': s.token } });
      if (res.status === 401) {
        // Disconnected in revoked: forget the token, keep working locally.
        this.#forget();
        return false;
      }
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as { links: LinkStatus[]; allowRevoke?: boolean; allowHandOver?: boolean };
      this.allowRevoke = body.allowRevoke === true;
      this.allowHandOver = body.allowHandOver === true;
      this.links = body.links ?? [];
      this.loaded = true;
      this.error = null;
      return true;
    } catch {
      this.error = 'unreachable';
      return false;
    }
  }

  // Ends a link this tool proposed. Only works when the owner allowed it.
  async revoke(linkId: string): Promise<boolean> {
    const s = this.stored;
    if (!s) return false;
    try {
      const res = await fetch(`${s.server}/api/connection/links/${encodeURIComponent(linkId)}/revoke`, {
        method: 'POST',
        headers: { 'X-Revoked-Connection': s.token },
      });
      if (res.status === 401) this.#forget();
      if (!res.ok) return false;
      const updated = (await res.json()) as LinkStatus;
      this.links = this.links.map((l) => (l.id === updated.id ? updated : l));
      return true;
    } catch {
      return false;
    }
  }

  async disconnect() {
    const s = this.stored;
    if (s) {
      try {
        await fetch(s.server + '/api/connection', {
          method: 'DELETE',
          headers: { 'X-Revoked-Connection': s.token },
        });
      } catch {
        /* forgotten here either way */
      }
    }
    this.#forget();
  }

  linkFor(id: string): LinkStatus | null {
    // Newest first from the server, so a card proposed twice shows its latest.
    return this.links.find((l) => refId(l.ref) === id) ?? null;
  }

  #connect(server: string, token: string) {
    this.stored = { server, token };
    this.loaded = false;
    this.error = null;
    writeJSON(connectionKey, this.stored);
    this.server = server;
    writeJSON(serverKey, server);
  }

  #forget() {
    this.stored = null;
    this.links = [];
    this.allowRevoke = false;
    this.allowHandOver = false;
    this.loaded = false;
    writeJSON(connectionKey, null);
  }
}

export const connection = new Connection();
