# champollion-docs

The documentation website for [Champollion](https://github.com/dorian-zhao/champollion),
a user-mode RISC-V (RV64GC) Linux binary translator for macOS arm64.

Astro + Starlight, deployed as a Cloudflare Worker. The design is the one from
`~/code/pingclair-docs` — Inter for text, Literata for display, JetBrains Mono
for code, near-black links, hairline borders, macOS code-block chrome — with one
change: the light theme is Apple's docs white (`#ffffff` page, `#1d1d1f` ink,
`#d2d2d7`/`#e8e8ed` hairlines) instead of the reference's warm off-white.
English lives at the root and the Simplified Chinese edition under `/zh-CN/`,
with identical page paths in both trees.

## Commands

```bash
pnpm install     # pnpm is the only supported manager
pnpm dev         # development server
pnpm build       # must pass before handoff; writes dist/
pnpm preview     # serve dist/
pnpm scan:agents # agent-readiness of the published site
```

## Deployment

`wrangler.toml` describes the Worker: `dist/` is uploaded as static assets and
`worker/index.js` runs in front of them. Cloudflare's Workers Builds runs
`pnpm build` and then `wrangler deploy` for every push to `main`.

## The agent surface

Besides the pages, the site is published as an API for agents:

- **Markdown twins.** Every page answers at `<path>.md` and `<path>.txt` with
  identical bytes, advertised in the page head and served as `text/plain`.
- **Content negotiation.** `Accept: text/markdown` on any page URL answers with
  the twin, `text/markdown`, and an `x-markdown-tokens` count.
- **Indexes.** `/llms.txt` and `/llms-full.txt` for English; `/zh-CN/llms.txt`
  and `/zh-CN/llms-full.txt` for Chinese.
- **Servers.** `POST /mcp` serves `search_docs`, `read_page`, and `list_pages`
  over `/mcp-index.json`; `POST /a2a` answers `message/send` with the matching
  pages. Both are declared in `/.well-known/` catalogs and in `openapi.json`.
- **Skills.** `/.well-known/agent-skills/index.json` lists each skill with its
  sha256; recompute a digest after editing its `SKILL.md`.

`pnpm scan:agents` runs the public isitagentready.com scan and fails on any
result the repository does not expect; three OAuth-shaped failures are
documented in `scripts/agent-readiness.mjs` and stay failing on purpose. The
first run after deployment is what reports anything still missing — DNS-AID
records, for one, live in the Cloudflare dashboard rather than here.

## Known build output

`pnpm build` prints one warning on a stock checkout — `The collection "i18n"
does not exist or is empty` — because Starlight probes its optional UI-strings
collection while rendering. The reference site's stack prints the same line on
the same Astro generation; it is upstream noise, not a configuration error.

## Before this can ship

- [ ] Real domain. The placeholder `champollion.dorian.page` is written into
      `astro.config.mjs`, `wrangler.toml` (the commented `routes`), and every
      discovery document; `rg -l champollion.dorian.page` lists them all.
- [ ] Wordmark and favicon (the header currently shows the bare title).
- [ ] DNS-AID SVCB/HTTPS records in the Cloudflare zone (`_mcp`, `_a2a`,
      `_index` under `_agents`) for the scan to reach its required level.
- [ ] Optional parity with the reference site: the "Copy page" button
      (`PageTitle.astro`) and per-page `h1_emoji`.
- [ ] "Verified:" transcripts for the pages under `start/`: the house rule is
      that every command on those pages was run on a real host before the page
      shipped, and the outputs quoted are the ones that host printed.
