/**
 * The Champollion docs Worker.
 *
 * The site is static: Astro writes HTML and assets into `dist`, and the assets
 * server answers from them. This script is where behavior the assets server
 * cannot express will live — the reference site's Worker adds Markdown content
 * negotiation and agent endpoints here. For now it hands every request
 * straight back to the assets server.
 *
 * `wrangler.toml` sets `run_worker_first`, because assets-first routing would
 * answer every request before this handler could see it.
 */

export default {
	async fetch(request, env) {
		return env.ASSETS.fetch(request);
	},
};
