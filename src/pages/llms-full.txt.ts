import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { llmsFull, llmsHeaders } from '../lib/llms';

export const prerender = true;

/**
 * 🤖 Every English page in one file, for an agent that would rather read one
 * document than follow a dozen links. Each section names its source URL, and
 * the localized edition is named in the header.
 */
export const GET: APIRoute = async ({ site }) => {
	const docs = await getCollection('docs');
	const origin = site ?? new URL('https://champollion.dorian.page');
	return new Response(llmsFull(origin, docs, null), { headers: llmsHeaders });
};
