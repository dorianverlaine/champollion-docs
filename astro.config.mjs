// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { copyFile } from 'node:fs/promises';

// Starlight always emits the sitemap as `sitemap-index.xml` plus numbered
// chunks (`sitemap-0.xml`), and crawlers look for `/sitemap.xml`, so publish a
// copy of the generated index under that name instead of hand-maintaining a
// second one. It is registered after Starlight because build hooks run in
// integration order, and Starlight is what writes the index this hook copies.
const sitemapAlias = {
	name: 'sitemap-alias',
	hooks: {
		'astro:build:done': async ({ dir }) => {
			await copyFile(new URL('sitemap-index.xml', dir), new URL('sitemap.xml', dir));
		},
	},
};

// `site` is the origin used in canonical URLs and the sitemap. It has to match
// the domain the Worker is bound to. ⚠️ `champollion.dorian.page` is a
// placeholder: change it here and add the hostname to `routes` in
// `wrangler.toml` before the first real deployment.
export default defineConfig({
	site: 'https://champollion.dorian.page',
	integrations: [
		starlight({
			title: 'Champollion',
			description:
				'Documentation for Champollion, a user-mode RISC-V (RV64GC) Linux binary translator for macOS arm64.',
			customCss: ['./src/styles/theme.css'],
			// The injected `/404` route renders the `404` entry from the content
			// collection; with the entry present, the two routes collide and the
			// build warns about it. Let the content route serve `/404` instead.
			disable404Route: true,
			// The same pair the reference site uses, so syntax colors match.
			expressiveCode: {
				themes: ['github-light-default', 'dark-plus'],
			},
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/dorian-zhao/champollion',
				},
			],
			// English only for now. The reference site keeps a `root` + `zh-TW`
			// pair; adding the Chinese tree later takes the same arrangement here
			// — `locales`, a `zh-TW/` directory, and the language picker component.
			defaultLocale: 'root',
			editLink: {
				baseUrl: 'https://github.com/dorian-zhao/champollion-docs/edit/main/',
			},
			sidebar: [
				{ label: 'Start', items: [{ autogenerate: { directory: 'start' } }] },
				{ label: 'Concepts', items: [{ autogenerate: { directory: 'concepts' } }] },
				{ label: 'Reference', items: [{ autogenerate: { directory: 'reference' } }] },
				{ label: 'Project', items: [{ autogenerate: { directory: 'project' } }] },
			],
		}),
		sitemapAlias,
	],
});
