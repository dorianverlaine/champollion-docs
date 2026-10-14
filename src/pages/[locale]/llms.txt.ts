import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import type { Locale } from '../../lib/agent-paths';
import { llmsHeaders, llmsIndex, localePaths } from '../../lib/llms';

export const prerender = true;

/**
 * 🤖 The same index for the prefixed locale. An agent that reads the localized
 * pages should not have to guess these URLs, so the English `llms.txt` names
 * this one and it is published here.
 */
export const getStaticPaths = localePaths;

export const GET: APIRoute = async ({ site, params }) => {
	const docs = await getCollection('docs');
	const origin = site ?? new URL('https://champollion.dorian.page');
	const locale = params.locale as Locale;
	return new Response(llmsIndex(origin, docs, locale), { headers: llmsHeaders });
};
