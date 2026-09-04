# BIG AV corporate rebuild — Codex build spec (branch: corporate-rebuild)

Repo: /Users/georgep/.openclaw/capabilities_staging/bigav-website-work (work ONLY on branch corporate-rebuild).
Reference implementation: `index.html` (DONE — the template for everything) + `styles.css` (shared components, do not fork styles per page; extend styles.css only if a page truly needs it).

## Non-negotiable rules
1. NEVER touch `assets/email-sig/` or `signature/` or `CNAME`. Never commit to main.
2. No em dashes or en dashes anywhere in copy. Hyphens and pipes only.
3. Never claim: Crestron dealership, certifications lists, awards, warranties, client names, project names, revenue or pipeline figures. No fabricated proof of any kind. No "Hamilton" (company location is Scarborough, Ontario).
4. "BIG AV" never "BIGAV". Salex line everywhere: "a division of Salex Inc."
5. Every page: same CHROME:HEADER and CHROME:FOOTER blocks as index.html byte-identical EXCEPT (a) nav link for the current page gets `aria-current="page"`, (b) paths are root-relative so they work at any depth. `body data-page` set per page.
6. Every page: full head (title, meta description, canonical, OG basic set, favicon links, Google Fonts links, stylesheet, GA4 snippet) copied from index.html pattern with per-page title/description/canonical. No JSON-LD on subpages except about.html (Organization, copy from index).
7. All images from `/assets/corporate/*.webp` with real alt text, `loading="lazy"`.
8. Placeholder text forbidden. If copy is missing, write `[NEEDS-COPY: topic]` and list it at the end of your report - do not invent facts.

## Pages to build

### /markets/index.html (title: Vertical Markets | BIG AV)
pagehero: h1 "Where the work lands." + lede (reuse index section 1 lede). Then the same 8-row vindex from index.html (links + images), then a closing CTA band linking /contact.html.

### 8 vertical pages: /markets/{commercial,healthcare,institutional,landscape,retail-hospitality,residential,industrial,entertainment-venues}.html
Template per page:
- pagehero: h1 = vertical name + one-sentence positioning lede.
- SECTION 1 | THE ENVIRONMENTS: prose (2-3 short paragraphs) on what BIG AV handles in this vertical. SOURCE: read `/Users/georgep/OBSIDIAN 1/Main Brian/BIG AV/Business Plan/Notes/BIG-AV-BUSINESS-PLAN-FINAL-SOURCE-v0.16.md` (the vertical map around lines 129-148 AND the per-vertical funnel prose in section 5). Rewrite in site voice (plain, corporate, confident). Do not copy sentences containing revenue, forecasts, or partner-confidential detail.
- SECTION 2 | TYPICAL SYSTEMS: a `.scope.two` grid of 4-6 cards naming system types for that vertical (from the same source; keep generic-honest, no brand promises).
- SECTION 3 | HOW WE DELIVER: the six-stage scope grid from index.html verbatim (shared component) + line "Every vertical moves through the same six stages."
- CTA: btn to /contact.html "Request a consultation".
- Hero image: that vertical's webp as a full-width banner under the pagehero (`<img>` inside a `.feature` with the vertical name NOT repeated as text).
- Residential page additionally gets one paragraph on Bradley/automation (voice control, scenes, inherited systems) linking /agentic-ai/ - the ONLY vertical page that mentions Bradley.
- Entertainment-venues page: note that show lighting is a specialist capability within the vertical, not the lead identity.

### /services.html (title: Scope of Services | BIG AV)
pagehero + the six stages as SECTION blocks: each stage gets a `.scope` card row with fuller 2-3 sentence descriptions (expand from index one-liners; source also `/Users/georgep/OBSIDIAN 1/Main Brian/BIG AV/Business Plan/Notes/BIG-AV-BUSINESS-PLAN-FINAL-SOURCE-v0.16.md` section 3 revenue-source prose, rewritten as services not revenue). Include: integrated projects, design/drawings/specification packages, programming + commissioning + specialist delivery (project rescue, white-label for out-of-market integrators), service and lifecycle support, partner delivery. NO prices, NO "$499" mention. End with capability band (SECTION 4 from index verbatim) + CTA.

### /about.html (title: About BIG AV | A Division of Salex Inc.)
- pagehero: "The integration arm of a fifty-year lighting house."
- SECTION 1 | THE COMPANY: prose from this base paragraph (adapt, keep facts): "BIG AV is an Ontario audio-visual and control-systems integrator, a division of Salex Inc., Ontario's largest lighting agency. Salex runs a specification-to-contract machine quoting roughly 300 projects a month across the GTA, Southwestern Ontario, and Ottawa. BIG AV is the integration arm attached to that machine." Then delivery-lifecycle sentence. NO revenue figures, NO pipeline, NO school-board/Metrolinx naming.
- SECTION 2 | SALEX: what Salex is (founded 1973, lighting agency, specification house). No revenue figures.
- SECTION 3 | LEADERSHIP: George Panagopoulos, founder. Career history paragraph LABELED as career history (venues and employers from his career; keep to two sentences, no client-project claims for BIG AV). `[NEEDS-COPY: founder bio final wording]` marker is acceptable if unsure.
- SECTION 4 | HOW WE OPERATE: one paragraph on the agentic-AI-run operations + link to /agentic-ai/.

### /contact.html (title: Contact | BIG AV)
pagehero "Tell us about your project." + schedule-style table (`table.schedule`, caption "SCHEDULE C | CONTACT"): rows for General info@big-av.com, Phone 1 877 571 1088, Agentic AI division bradley@big-av.com, Office Scarborough Ontario, Service area Ontario. CTA mailto button. No forms (no backend).

### /privacy.html + /terms.html (titles: Privacy | BIG AV, Terms of Use | BIG AV)
Short, plain-English, PIPEDA-flavoured. Privacy: what we collect (Google Analytics 4 usage data, voluntary email contact), no sale of data, contact info@big-av.com, effective date 2026-09-04. Terms: informational site, no warranties, Ontario law. `.prose` layout. Keep each under 500 words. No invented legal entities: the operator is "BIG AV, a division of Salex Inc."

## Cleanup (same branch, git rm)
- `assets/bradley-voice/` (entire dir), `script.js`, `bradley-orbit-site.css`, `bradley-orbit-site.js`, `bradley-site-show.js`, `bradley-app-frame.js`, `bradley-app-shell.css`, `SITE-COPY.md`, `bookings-config.json`, `assets/fonts/` (TTFs), `bradley-orbit.html`.
- Unreferenced big PNGs in assets/: `big-av-bulb-lockup.png`, `residential-banner.png`, `06_bulb-lockup-stacked.png`, `bulb-hero.png`, `bulb-icon.png`, `bulb-mark.png`, `bulb.png`, and any `big-av-logo-*` in assets/ root not referenced by the new pages (grep before deleting; keep favicon.ico, apple-touch-icon.png, icon-192.png, og-card.png, bulb.webp).
- AFTER deletions run: `grep -rn "script.js\|bradley-orbit\|bradley-voice\|\.ttf" *.html markets/*.html || true` must return nothing.

## robots.txt + sitemap.xml
- robots: allow all, `Disallow: /REBUILD-SPEC.md`, sitemap line.
- sitemap.xml: all 15 URLs (/, /about.html, /services.html, /agentic-ai/ [leave in sitemap; page built separately], /contact.html, /privacy.html, /terms.html, /markets/ + 8 vertical pages) with lastmod 2026-09-04.

## Verify before reporting done
1. `python3 -m http.server 8933` and curl every page for 200.
2. `grep -rnP '\x{2014}|\x{2013}' -- *.html markets/*.html` empty.
3. `grep -rni "hamilton\|dealer\|BIGAV\b" *.html markets/*.html` empty (BIGAV check must not flag "BIG AV").
4. Header/footer blocks identical across pages except aria-current (diff a few).
5. Report: files created, deletions done, any [NEEDS-COPY] markers, verification outputs. Commit in logical chunks on corporate-rebuild with clear messages. DO NOT push.
