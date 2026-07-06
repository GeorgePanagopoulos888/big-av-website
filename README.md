# BIG AV Public Website MVP

Local static build for bus task `ab-2bec5f8e`.

## What is included

- Balanced residential and commercial homepage
- Services story for design, integration, programming, commissioning, enterprise UI/UX, and managed service
- Four-layer integration rail: experience, systems, interface, intelligence
- B.A.V.I. / Bradley landing section with sandboxed `demo_site` language
- Local-only Bradley preset demo for AI Home, Boardroom, and Managed service stories
- Demo video placeholder
- Book / Learn / Talk path rail linked to the local sections
- **Contact only** — call **(877) 571-1088** or email george@big-av.com (no online booking form)
- National public website positioning, matching scope rev 3
- Local BIG AV bulb assets copied into `assets/`

## Run locally

Open `index.html` directly in a browser, or run:

```sh
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

No sends, deletes, deploys, spends, credentials, calendar writes, or account changes are performed by this MVP.

## Safety notes

- Contact is plain `tel:` and `mailto:` links in HTML — no booking form, no Graph API, no calendar writes from the site.
- `script.js` only powers the sandboxed B.A.V.I. demo presets.
- B.A.V.I. / Bradley is presented in `demo_site` mode with no private data and no live controls.
- Geography: **national** positioning is locked in scope rev 3; this MVP does not present BIG AV as local-only.
