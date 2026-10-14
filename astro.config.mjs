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
	// The concept page moved from `routes` to `modes` when route A and route B
	// were renamed for readers; the old URLs keep working as static redirects.
	redirects: {
		'/concepts/routes/': '/concepts/modes/',
		'/zh-CN/concepts/routes/': '/zh-CN/concepts/modes/',
	},
	integrations: [
		starlight({
			title: 'Champollion',
			description:
				'Documentation for Champollion, a user-mode RISC-V (RV64GC) Linux binary translator for macOS arm64.',
			customCss: ['./src/styles/theme.css'],
			// WebMCP tools for browsers that expose `navigator.modelContext`.
			// The script itself feature-detects and does nothing elsewhere.
			head: [{ tag: 'script', attrs: { src: '/webmcp.js', type: 'module' } }],
			// The injected `/404` route renders the `404` entry from the content
			// collection; with the entry present, the two routes collide and the
			// build warns about it. Let the content route serve `/404` instead.
			disable404Route: true,
			components: {
				// Adds rel="alternate" links for the .txt and .md twins of each
				// page, and keeps only one table of contents in the DOM.
				Head: './src/components/Head.astro',
				// The language picker as a menu rather than a native select.
				LanguageSelect: './src/components/LanguageSelect.astro',
				// The theme picker as a menu rather than a native select.
				ThemeSelect: './src/components/ThemeSelect.astro',
				// Previous/next as a line of links rather than two large cards.
				Pagination: './src/components/Pagination.astro',
				// Adds the project footer below the edit row and pagination.
				Footer: './src/components/Footer.astro',
			},
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
			// The default locale lives at the site root, so it is configured under
			// the `root` key. Listing it as `en` instead would make Starlight look
			// for English pages in an `en/` directory. The language menu is built
			// from this object in insertion order, so that object is the menu order.
			defaultLocale: 'root',
			locales: {
				root: { label: 'English', lang: 'en' },
				'zh-CN': { label: '简体中文', lang: 'zh-CN' },
			},
			editLink: {
				baseUrl: 'https://github.com/dorian-zhao/champollion-docs/edit/main/',
			},
			sidebar: [
				{
					label: 'Start',
					translations: { 'zh-CN': '开始' },
					items: [{ autogenerate: { directory: 'start' } }],
				},
				{
					label: 'Concepts',
					translations: { 'zh-CN': '核心概念' },
					items: [{ autogenerate: { directory: 'concepts' } }],
				},
				{
					label: 'Reference',
					translations: { 'zh-CN': '参考手册' },
					items: [{ autogenerate: { directory: 'reference' } }],
				},
				{
					label: 'Project',
					translations: { 'zh-CN': '项目信息' },
					items: [{ autogenerate: { directory: 'project' } }],
				},
			],
		}),
		sitemapAlias,
	],
});
