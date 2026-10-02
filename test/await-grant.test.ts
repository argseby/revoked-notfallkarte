import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkCode, connection, pkceChallenge } from '../src/lib/connection.svelte';

const reasons = { revoke: 'r', links: 'l' };

function query(link: string): Record<string, string> {
  return Object.fromEntries(new URL(link.replace('revoked://connect', 'https://x/connect')).searchParams);
}

function answer(status: number, body: unknown = {}): Response {
  return new Response(JSON.stringify(body), { status });
}

describe('waiting for the owner’s answer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('window', { location: { origin: 'https://tool.example' } });
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    await connection.disconnect();
    connection.setServer('');
  });

  it('waits to be sent back when it knows no server', async () => {
    const { link, code } = await connection.connectLink(reasons);
    expect(query(link).poll).toBeUndefined();
    expect(code).toBeUndefined();
    expect(await connection.awaitGrant(new AbortController().signal)).toBe(false);
  });

  it('asks the server it names until the owner has answered', async () => {
    expect(connection.setServer('vault.example')).toBe(true);
    const { link, code } = await connection.connectLink(reasons);
    const q = query(link);
    expect(q.poll).toBe('https://vault.example');
    expect(code).toBe(await checkCode(q.challenge));

    const asked: { url: string; body: { verifier: string; redirectUri: string; code?: string } }[] = [];
    const replies = [answer(202, { pending: true }), answer(429), answer(200, { token: 'tool-token' })];
    vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
      asked.push({ url, body: JSON.parse(init.body as string) });
      return replies.shift() ?? answer(500);
    });

    const done = connection.awaitGrant(new AbortController().signal);
    await vi.runAllTimersAsync();
    expect(await done).toBe(true);

    expect(asked).toHaveLength(3);
    expect(asked[0].url).toBe('https://vault.example/api/connect/token');
    // Only the verifier, never a code: the page proves it is the one that asked.
    expect(asked[0].body.code).toBeUndefined();
    expect(asked[0].body.redirectUri).toBe('https://tool.example/');
    expect(await pkceChallenge(asked[0].body.verifier)).toBe(q.challenge);
    expect(connection.connected).toBe(true);
    expect(connection.serverHost).toBe('vault.example');
  });

  it('stops when the answer lapsed, or the dialog closes', async () => {
    connection.setServer('https://vault.example');
    await connection.connectLink(reasons);
    vi.stubGlobal('fetch', async () => answer(400));
    expect(await connection.awaitGrant(new AbortController().signal)).toBe(false);
    expect(connection.error).toBe('connect');
    expect(connection.connected).toBe(false);

    await connection.connectLink(reasons);
    let asks = 0;
    vi.stubGlobal('fetch', async () => (asks++, answer(202)));
    const dialog = new AbortController();
    const done = connection.awaitGrant(dialog.signal);
    await vi.advanceTimersByTimeAsync(7000);
    dialog.abort();
    await vi.runAllTimersAsync();
    expect(await done).toBe(false);
    expect(asks).toBe(3);
  });
});
