<script lang="ts">
	import TailwindColorPicker from '$lib/TailwindColorPicker.svelte';

	import type { ActiveSwatch, ColorGroup } from '$lib/types.js';

	let swatchSize = 35;
	let swatchMargin = 0;
	let borderColor = '#000000';
	let borderThickness = 4;
	let roundedCorners = false;
	let cornerRadius = 0;
	let activeSwatch: ActiveSwatch | null = {
		color: 'emerald',
		shade: '500',
		swatch: { hex: '#10b981' }
	};
	let colorPicker: TailwindColorPicker;
	let customPalette: ColorGroup[] = [
		{
			name: 'Custom',
			swatches: {
				'1': { hex: '#FF0000' }, // Red
				'2': { hex: '#FF7F00' }, // Orange
				'3': { hex: '#FFFF00' }, // Yellow
				'4': { hex: '#7FFF00' }, // Chartreuse Green
				'5': { hex: '#00FF00' }, // Green
				'6': { hex: '#00FF7F' }, // Spring Green
				'7': { hex: '#00FFFF' }, // Cyan
				'8': { hex: '#007FFF' }, // Azure
				'9': { hex: '#0000FF' }, // Blue
				'10': { hex: '#7F00FF' } // Violet
			}
		}
	];
</script>

<svelte:head>
	<title>Limit ed/less color picker - Svelte Tailwind Color Picker</title>
	<meta
		name="description"
		content="A simple color picker of tailwind (or tailwind-like palette) colors for Svelte. Limit choice of colors for great looking personalization."
	/>
	<meta name="keywords" content="Svelte, Tailwind, Color Picker, Web Development, UI Component" />
	<meta property="og:title" content="Limit ed/less color picker - Svelte Tailwind Color Picker" />
	<meta
		property="og:description"
		content="A simple color picker of tailwind colors for Svelte. Limit choice of colors for great looking personalization."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://svelte-tailwind-colorpicker.pages.dev/" />
	<meta name="twitter:title" content="Limit ed/less color picker - Svelte Tailwind Color Picker" />
	<meta
		name="twitter:description"
		content="A simple color picker of tailwind colors for Svelte. Limit choice of colors for great looking personalization."
	/>
</svelte:head>

<div class="mb-4 flex justify-center">
	<a
		href="https://github.com/kaerte/svelte-tailwind-colorpicker"
		target="_blank"
		rel="noopener noreferrer"
		class="flex items-center gap-2 text-blue-600 underline hover:text-blue-800"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="lucide lucide-github"
			><path
				d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
			/><path d="M9 18c-4.51 2-5-2-7-2" /></svg
		>
		View Docs on GitHub
	</a>
</div>
<h1 class="my-12 text-center text-6xl font-black">Limit ed/less color picker</h1>

<div class="prose mx-auto pb-12">
	<p class=" text-center text-xl text-gray-500">
		A simple color picker of tailwind (or tailwind like palette) colors for Svelte.
	</p>

	<p class="text-center text-gray-500">Limit choice of colors for great looking personalization.</p>

	<div class="mb-2 flex justify-center gap-4">
		<TailwindColorPicker
			class="border shadow-2xl"
			bind:this={colorPicker}
			{swatchSize}
			{swatchMargin}
			{borderColor}
			{borderThickness}
			{roundedCorners}
			{cornerRadius}
			bind:activeSwatch
			onUpdateComplete={() => console.log('Color picker update complete')}
			onSwatchSelected={(s) => (activeSwatch = s)}
		/>
	</div>

	{#if activeSwatch}
		<div class="mt-4 flex justify-center gap-4">
			<div class="flex items-center rounded-lg">
				<div
					class="mr-2 h-8 w-8 rounded-full"
					style="background-color: {activeSwatch.swatch.hex}"
				></div>
				<div class="w-40 text-left">
					<div class="text-lg font-bold">{activeSwatch.color}-{activeSwatch.shade}</div>
					<div class="text-sm text-gray-500">{activeSwatch.swatch.hex}</div>
				</div>
			</div>
		</div>
	{/if}

	<h2 class="mb-4 mt-24 text-center text-3xl font-black">Why?</h2>

	<p class="text-center text-gray-500">
		OG Color pickers allow users to choose any color they want. This is great for flexibility but
		not always what you want when building personalization tools.
	</p>

	<p class="text-center text-gray-500">
		This component was built to allow users to pick from a defined set of colors. This can make the
		UI more consistent and predictable. Using Tailwind default colors makes this easy and great
		looking out of the box.
	</p>

	<h2 class="mb-4 mt-24 text-center text-3xl font-black">Features</h2>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
		<div class="rounded-lg border p-4 text-center">
			<div class="mb-1 font-semibold">HTML Canvas</div>
			<div class="text-sm text-gray-500">For optimal performance</div>
		</div>
		<div class="rounded-lg border p-4 text-center">
			<div class="mb-1 font-semibold">Flexible Color Options</div>
			<div class="text-sm text-gray-500">Use Tailwind default colors or your own</div>
		</div>
		<div class="rounded-lg border p-4 text-center">
			<div class="mb-1 font-semibold">Lightweight</div>
			<div class="text-sm text-gray-500">Small size with no dependencies</div>
		</div>
	</div>

	<h2 class="my-12 mt-24 text-center text-3xl font-black">Examples</h2>

	<div class="grid sm:grid-cols-2 gap-4">
		<div>
			<h4 class="text-center">Rounded corners</h4>
			<div class="flex justify-center">
				<TailwindColorPicker
					orientation="vertical"
					roundedCorners={true}
					cornerRadius={100}
					swatchMargin={1}
					includeColors={['emerald', 'red', 'zinc', 'orange']}
					bind:activeSwatch
					onSwatchSelected={(s) => (activeSwatch = s)}
				/>
			</div>
		</div>

		<div>
			<h4 class="text-center">Small margin</h4>
			<div class="flex justify-center">
				<TailwindColorPicker
					orientation="vertical"
					swatchMargin={2}
					includeColors={['emerald', 'red', 'zinc', 'orange']}
					bind:activeSwatch
					onSwatchSelected={(s) => (activeSwatch = s)}
				/>
			</div>
		</div>
		<div>
			<h4 class="text-center">Limit colors by name</h4>
			<div class="flex justify-center">
				<TailwindColorPicker
					orientation="vertical"
					includeColors={['emerald', 'red']}
					bind:activeSwatch
					onSwatchSelected={(s) => (activeSwatch = s)}
				/>
			</div>
		</div>

		<div>
			<h4 class="text-center">Limit colors by shade</h4>
			<div class="flex justify-center">
				<TailwindColorPicker
					orientation="vertical"
					includeColors={['emerald', 'red', 'zinc', 'orange']}
					includeShades={['400', '500', '600', '700']}
					bind:activeSwatch
					onSwatchSelected={(s) => (activeSwatch = s)}
				/>
			</div>
		</div>

		<div>
			<h4 class="text-center">Vertical orientation</h4>
			<div class="flex justify-center">
				<TailwindColorPicker
					includeColors={['emerald', 'red', 'zinc', 'orange']}
					bind:activeSwatch
					onSwatchSelected={(s) => (activeSwatch = s)}
				/>
			</div>
		</div>

		<div>
			<h4 class="text-center">Sizes</h4>
			<div class="flex justify-center">
				<TailwindColorPicker
					swatchSize={8}
					includeColors={['emerald', 'red', 'zinc', 'orange']}
					bind:activeSwatch
					onSwatchSelected={(s) => (activeSwatch = s)}
				/>
			</div>
		</div>

		<div>
			<h4 class="text-center">Custom palette</h4>
			<div class="flex justify-center">
				<TailwindColorPicker
					swatchSize={20}
					roundedCorners={true}
					cornerRadius={20}
					swatchMargin={2}
					orientation="vertical"
					palette={customPalette}
					bind:activeSwatch
					onSwatchSelected={(s) => (activeSwatch = s)}
				/>
			</div>
		</div>
	</div>
</div>

<div class="mb-4 flex justify-center pb-8 pt-2">
	<a
		href="https://github.com/kaerte/svelte-tailwind-colorpicker"
		target="_blank"
		rel="noopener noreferrer"
		class="flex items-center gap-2 text-blue-600 underline hover:text-blue-800"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="lucide lucide-github"
			><path
				d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
			/><path d="M9 18c-4.51 2-5-2-7-2" /></svg
		>
		View Docs on GitHub
	</a>
</div>
