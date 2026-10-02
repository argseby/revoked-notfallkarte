// The one thing this tool hands to revoked: a share proposal, as a
// revoked://p?label=…&keys=… link the installed app opens. It names record
// keys and the card, never a value. revoked shows the owner what the link
// would contain, asks once for anything missing (described by the template
// named here), and creates the link only when they confirm. The link comes
// back here only when they hand it over — it is what the card's code holds.

// The built-in template whose keys these are, so revoked can ask for any it
// does not hold yet with the right label and input.
export const templateName = 'Medical emergency card';

// A card in a wallet has to work the day it is needed, so the proposal sets
// no expiry and no stamp: the link lasts until its owner revokes it.

// The label names the share in revoked and heads the page a scan opens.
export const labelPrefixes = { de: 'Notfallkarte ', en: 'Emergency card ' } as const;
export type LabelLocale = keyof typeof labelPrefixes;

// The app refuses a longer label.
const maxLabel = 120;
export const maxName = maxLabel - Math.max(...Object.values(labelPrefixes).map((p) => p.length));
// The app refuses more.
export const maxKeys = 50;

const keyPattern = /^[a-z0-9_-]{1,64}$/;
const appName = 'Notfallkarte';

export function cleanName(input: string): string {
  return input.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxName);
}

export function cardLabel(name: string, locale: LabelLocale): string {
  return labelPrefixes[locale] + cleanName(name);
}

// The name a label was built from, in whichever language it was built.
export function nameFromLabel(label: string): string {
  for (const prefix of Object.values(labelPrefixes)) {
    if (label.startsWith(prefix)) return cleanName(label.slice(prefix.length));
  }
  return cleanName(label);
}

export interface Proposal {
  name: string;
  locale: LabelLocale;
  keys: readonly string[];
}

// Who is proposing and how to get back: this page's origin, its return
// address, a state value it can recognise, its own reference for the card,
// and — when not connected yet — a PKCE challenge to connect on the way.
export interface ToolContext {
  client: string;
  redirect: string;
  state: string;
  ref: string;
  challenge?: string;
  // Why this tool asks for what the owner may allow or not; revoked shows
  // them in the tool's name when it connects.
  reasons?: Reasons;
  // The server this page asks for what became of the proposal, when it knows
  // one: revoked then opens nothing to say so.
  poll?: string;
}

export interface Reasons {
  revoke: string;
  links: string;
}

// revoked refuses a link whose reason is longer.
const maxReason = 120;

export function reasonParams(r: Reasons): [string, string][] {
  return [
    ['revoke_reason', r.revoke.slice(0, maxReason)],
    ['links_reason', r.links.slice(0, maxReason)],
  ];
}

// Built by hand rather than with URLSearchParams, which writes a space as '+':
// percent-encoding reads the same in every parser.
export function proposalLink(p: Proposal, tool?: ToolContext): string {
  const name = cleanName(p.name);
  const keys = [...new Set(p.keys)];
  if (!name) throw new Error('proposal without a name');
  if (!keys.length || keys.length > maxKeys) throw new Error(`proposal with ${keys.length} keys`);
  for (const k of keys) if (!keyPattern.test(k)) throw new Error(`invalid key ${k}`);
  const query: [string, string][] = [
    ['label', cardLabel(name, p.locale)],
    ['keys', keys.join(',')],
    ['from', appName],
    ['template', templateName],
  ];
  if (tool) {
    query.push(['client', tool.client], ['redirect', tool.redirect], ['state', tool.state], ['ref', tool.ref]);
    if (tool.challenge) {
      query.push(['challenge', tool.challenge]);
      if (tool.reasons) query.push(...reasonParams(tool.reasons));
    }
    if (tool.poll) query.push(['poll', tool.poll]);
  }
  return 'revoked://p?' + query.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
}

// A link someone pasted by hand: https, or plain http on the local machine.
// Returned normalised, or null when a code holding it would lead nowhere.
export function validCardUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    const local = u.protocol === 'http:' && /^(localhost|127\.0\.0\.1)$/.test(u.hostname);
    if (u.protocol !== 'https:' && !local) return null;
    if (u.username || u.password) return null;
    return u.href;
  } catch {
    return null;
  }
}
