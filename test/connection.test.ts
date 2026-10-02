import { describe, expect, it } from 'vitest';
import { checkCode, pkceChallenge, randomToken, serverFrom } from '../src/lib/connection.svelte';

describe('PKCE', () => {
  it('derives the S256 challenge as RFC 7636 does', async () => {
    // The worked example from RFC 7636, appendix B.
    expect(await pkceChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')).toBe(
      'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
    );
  });

  it('makes verifiers the server accepts', () => {
    const v = randomToken(32);
    expect(v).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(randomToken(32)).not.toBe(v);
  });
});

describe('a page that collects its answer itself', () => {
  it('shows the code revoked shows for the same challenge', async () => {
    // The same vector as the app's own test.
    expect(await checkCode('E9LVI17tLpGpM3ZvzAq5HMYjQ3Z4Q1F2U6JtVZ0QxkA')).toBe('83C-047');
  });

  it('reads a server address as someone types it', () => {
    expect(serverFrom(' revoked.example.com ')).toBe('https://revoked.example.com');
    expect(serverFrom('https://Revoked.example.com/some/path')).toBe('https://revoked.example.com');
    expect(serverFrom('localhost:8090')).toBe('http://localhost:8090');
    expect(serverFrom('http://127.0.0.1:3000/')).toBe('http://127.0.0.1:3000');
    expect(serverFrom('http://revoked.example.com')).toBeNull();
    expect(serverFrom('not an address')).toBeNull();
    expect(serverFrom('')).toBeNull();
  });
});
