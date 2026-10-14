# champollion-docs

The documentation website for [Champollion](https://github.com/dorian-zhao/champollion),
a user-mode RISC-V (RV64GC) Linux binary translator for macOS arm64.

Astro + Starlight, deployed as a Cloudflare Worker. The design is the one from
`~/code/pingclair-docs` — Inter for text, Literata for display, JetBrains Mono
for code, near-black links, hairline borders, macOS code-block chrome — with one
change: the light theme is Apple's docs white (`#ffffff` page, `#1d1d1f` ink,
`#d2d2d7`/`#e8e8ed` hairlines) instead of the reference's warm off-white.

## Commands

```bash
pnpm install     # pnpm is the only supported manager
pnpm dev         # development server
pnpm build       # must pass before handoff; writes dist/
pnpm preview     # serve dist/
```

## Deployment

`wrangler.toml` describes the Worker: `dist/` is uploaded as static assets and
`worker/index.js` runs in front of them. Cloudflare's Workers Builds runs
`pnpm build` and then `wrangler deploy` for every push to `main`.

## Known build output

`pnpm build` prints one warning on a stock checkout — `The collection "i18n"
does not exist or is empty` — because Starlight probes its optional UI-strings
collection while rendering. The reference site's stack prints the same line on
the same Astro generation; it is upstream noise, not a configuration error.

## Before this can ship

- [ ] Real domain: update `site` in `astro.config.mjs` (currently the
      placeholder `champollion.dorian.page`) and list the hostname under
      `routes` in `wrangler.toml`.
- [ ] Wordmark and favicon (the header currently shows the bare title).
- [ ] zh-TW locale, mirroring pingclair-docs' `LanguageSelect` component.
- [ ] Markdown twins (`<page>.md`), `llms.txt`, and the agent endpoints — the
      reason the reference site's Worker exists; this Worker is a pass-through
      until then.
- [ ] "Verified:" transcripts for the pages under `start/`: the house rule is
      that every command on those pages was run on a real host before the page
      shipped, and the outputs quoted are the ones that host printed.
