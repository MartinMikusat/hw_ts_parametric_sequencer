// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'hw-ts-parametric-sequencer',
			description: 'A framework-agnostic TypeScript library for creating parametric animation sequences',
			social: [
				{ 
					icon: 'github', 
					label: 'GitHub', 
					href: 'https://github.com/MartinMikusat/hw_ts_parametric_sequencer' 
				},
			],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', slug: 'getting-started' },
						{ label: 'Installation', slug: 'getting-started/installation' },
					],
				},
				{
					label: 'Guides',
					items: [
						{ label: '2D Animations', slug: 'guides/2d-guide' },
						{ label: '3D Animations', slug: 'guides/3d-guide' },
						{ label: 'Examples', slug: 'guides/examples' },
					],
				},
				{
					label: 'API Reference',
					autogenerate: { directory: 'api' },
				},
			],
		}),
	],
});
