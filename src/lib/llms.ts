import type { CollectionEntry } from 'astro:content';
import { LOCALES, isRootLocale, pagePath, slugOf, toMarkdown, twinPath, type Locale } from './agent-paths';

/**
 * 🤖 The llms.txt surfaces.
 *
 * Two shapes, each in two languages: `llms.txt` is the index a model reads to
 * decide which pages to fetch, and `llms-full.txt` is the whole documentation
 * in one file. Entries use `- [Title](url) — description`; the em dash keeps a
 * description from running into the URL after a closing parenthesis, which is
 * what happens with the more common `: description` suffix when a naive
 * extractor scans the line for something URL-shaped.
 */

export type DocEntry = CollectionEntry<'docs'>;

const localeNames: Record<Locale, string> = {
	'zh-CN': 'Simplified Chinese',
};

const intro =
	'> Champollion is a user-mode RISC-V (RV64GC) Linux binary translator for macOS arm64 (and arm64 Linux). rvrun loads a riscv64 Linux ELF, translates it instruction by instruction, and forwards its Linux syscalls to the host.';

/** Pages of one locale, published and sorted, without the slug noise. */
export function pagesFor(docs: DocEntry[], locale: Locale | null) {
	return docs
		.map((entry) => ({ entry, slug: slugOf(entry.filePath) }))
		.filter(({ entry, slug }) => {
			if (entry.data.draft) return false;
			// The 404 page is furniture, not documentation: it stays out of the
			// indexes agents read so a lookup never lands on it.
			if (slug === '404' || slug.endsWith('/404')) return false;
			return locale === null ? isRootLocale(slug) : slug.startsWith(`${locale}/`);
		})
		.sort((a, b) => a.slug.localeCompare(b.slug));
}

export function llmsIndex(origin: URL, docs: DocEntry[], locale: Locale | null): string {
	const scope = locale === null ? 'English' : localeNames[locale];
	const lines: string[] = [
		`# Champollion — ${scope} documentation`,
		'',
		intro,
		'',
		'> Every page below is published as Markdown at the URL shown, and the same bytes are also available as plain text by replacing `.md` with `.txt`. The whole documentation in one file is at ' +
			new URL(locale === null ? '/llms-full.txt' : `/${locale}/llms-full.txt`, origin).toString() +
			'.',
		'',
		'> English and Simplified Chinese are published side by side: the English index is /llms.txt, and the Simplified Chinese index is /zh-CN/llms.txt.',
		'',
	];

	for (const { entry, slug } of pagesFor(docs, locale)) {
		const markdown = new URL(twinPath(slug, 'md'), origin).toString();
		lines.push(`- [${entry.data.title}](${markdown}) — ${entry.data.description ?? ''}`.trimEnd());
	}

	lines.push('');
	return lines.join('\n');
}

export function llmsFull(origin: URL, docs: DocEntry[], locale: Locale | null): string {
	const scope = locale === null ? 'English' : localeNames[locale];
	const chunks: string[] = [
		`# Champollion documentation — ${scope}`,
		'',
		'Every page of the Champollion documentation (https://github.com/dorian-zhao/champollion) in one file, ' +
			(locale === null ? 'in English' : `in ${scope}`) +
			'. Each section names its source URL.',
		'',
		'English and Simplified Chinese are published side by side: /llms-full.txt for English and /zh-CN/llms-full.txt for Simplified Chinese.',
		'',
	];

	for (const { entry, slug } of pagesFor(docs, locale)) {
		chunks.push(
			'---',
			'',
			`# ${entry.data.title}`,
			'',
			`Source: ${new URL(pagePath(slug), origin).toString()}`,
			'',
			toMarkdown(entry.body ?? ''),
			'',
		);
	}

	return chunks.join('\n');
}

/** Shared headers for both shapes: plain text, cached, no Markdown MIME. */
export const llmsHeaders = {
	'Content-Type': 'text/plain; charset=utf-8',
	'Cache-Control': 'public, max-age=600',
} as const;

/** The prefixed locale, for `getStaticPaths`. */
export const localePaths = () => LOCALES.map((locale) => ({ params: { locale } }));
