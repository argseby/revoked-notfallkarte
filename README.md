# Notfallkarte provided by Revoked

A small browser tool for one job: an emergency card for your wallet. You type
whose card it is, tick what a helper should see — emergency contact, allergies
and medication, doctor, organ donation, health insurance — and continue in
revoked, which shows you what the link will contain, asks once for anything
your vault doesn't hold yet, and creates the link only when you confirm. Back
here, the link is drawn as a QR code on a card the size of a bank card, which
you download as an image or as a print sheet.

The card carries a name and a code, nothing else. What the code leads to stays
in the vault: change your medication there and the printed card shows it;
revoke the link and the card stops working.

**The tool has no account, no sign-in and no access to your vault.** It is
static files — Svelte 5 + Vite. English and German; the browser's language
picks one, and Settings switches. The card itself is always printed in both.

## How it talks to revoked

Through one `revoked://` link, which the installed revoked app opens:

```
revoked://p?label=Notfallkarte%20Max%20Mustermann&keys=full_name,contact_name,…
           &from=Notfallkarte&template=Medical%20emergency%20card
```

It names record *keys*, never values. The keys are those of the built-in
*Medical emergency card* template, so the app finds what the vault holds under
them and fills in whatever is missing with the template's label and input. The
proposal sets no expiry and no stamp: a card has to work the day it is needed,
and it ends when its owner revokes the link.

## Getting the link onto the card

The tool only ever gets a link its owner hands over.

- **Connected** (the checkbox on the first proposal, or **Connect** under
  Settings): the app sends you back here with a one-time code this page
  exchanges — with its PKCE verifier — for a token of its own. That opens a
  new tab, in whichever browser your system opens links with. Once this
  browser knows your server — it has connected before, or you typed the
  address under Settings — the page names it in its link and asks it for the
  answer itself: revoked opens nothing, shows the code this page shows for you
  to compare, and the tab you started in carries on, also from another browser
  or with revoked on your phone. With *may
  receive links* allowed, revoked hands over every link this tool proposed, and
  the card for the one it just created opens by itself. The link is read from
  your server each time and not stored here.
- **Not connected**, or receiving links not allowed, or revoked kept the link
  back (it does for links with a hidden value): copy the link in revoked and
  paste it into the card. A pasted link is used to draw the code and forgotten
  when the tab closes.

Connected, the tool also shows where each link stands — active, opened N×,
paused, revoked, expired — finds its cards again in another browser (from the
link's label and its own reference, `<card id>.<groups>`), and can revoke a
link when you remove its card, if you allowed that.

It never reads your vault. It does hold the links you hand it, and a link is
what opens the data — that is what the card is for. The page talks only to the
server the app named on the way back, so the CSP allows any `https:` origin in
`connect-src` (plus localhost for development).

## What it does

| | |
|---|---|
| **New card** | A name, the groups to include, **Continue in revoked**. Insurance and organ donation start unticked: anyone who holds the card can read what it leads to. |
| **My cards** | The cards you made, each with its link's status, **Card** to see and download it, and **New link** to propose it again. The list lives in this browser's `localStorage` and holds names and groups only. |
| **The card** | 85.6 × 54 mm, drawn on a canvas in the browser: *Notfallkarte · Emergency card*, the name, the code, what it leads to in German and English, and the link in letters. **Image (PNG)** is the card at 300 dpi; **Print sheet (PDF)** is an A4 page with the card at true size. |
| **How it works** | The explainer. |

### Groups

| Group | Keys | Preselected |
|---|---|---|
| Always | `full_name` | — |
| Emergency contact | `contact_name`, `contact_phone`, `contact_relation` | yes |
| Medical details | `blood_type`, `allergies`, `medications` | yes |
| Doctor | `doctor_name`, `doctor_phone` | yes |
| Organ donation | `organ_donor` | no |
| Health insurance | `insurance_provider`, `insurance_number` | no |

## Develop

```bash
npm install
npm run dev          # http://localhost:5173
npm run check        # svelte-check, warnings fail
npm test             # vitest: link building, groups, card layout, catalogues
npm run build        # dist/
```

To try it end to end, run the revoked app signed in to any server and press
**Continue in revoked**; the app needs the `revoked://` scheme registered (see
`app/packaging/` in the revoked repository). A server started with a
restricted `--origins` must list this tool's origin.

## Deploy

The image serves `dist/` on port 8080 with nothing to configure. The compose
file publishes no port: it puts the container on the Docker network your
reverse proxy already uses, and the proxy reaches it by name.

```bash
docker network create proxy-network   # once, or reuse your proxy's network
cp .env.example .env
docker compose up -d --build
```

Then give it its own host name in your reverse proxy (for example
`notfallkarte.example.com`):

- **Nginx Proxy Manager:** forward hostname `notfallkarte` (the
  `CONTAINER_NAME`), port `8080`, scheme `http`, with the NPM container
  attached to the same network. Request an SSL certificate for the host.
- **Plain nginx on the same network:** `proxy_pass http://notfallkarte:8080;`
  inside a `server` block for the host name.

The headers (CSP and the rest) come from this container, so the proxy needs
no extra configuration. No reverse proxy on the host? Uncomment `ports:` in
`docker-compose.yml` and it is served on `HTTP_PORT` — plain http, so put TLS
in front before sharing the link.

Any revoked server works with it, because the link is created by the owner's
own revoked app on the server it is signed in to. A revoked server started
with a restricted `--origins` must list this tool's origin.
