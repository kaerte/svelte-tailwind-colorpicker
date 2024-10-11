<script lang="ts">
	import TailwindColorPicker from '$lib/TailwindColorPicker.svelte';
	import type { ActiveSwatch } from '$lib/index.js';

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
</script>

<h1 class="my-12 text-center text-6xl font-black">Limit ed/less color picker</h1>

<div class="prose mx-auto pb-24">
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
			on:updateComplete={() => console.log('Color picker update complete')}
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

	<div class="grid grid-cols-2 gap-4">
		<div>
			<h4 class="text-center">Rounded corners</h4>
			<div class="flex justify-center">
				<TailwindColorPicker
					orientation="vertical"
					roundedCorners={true}
					cornerRadius={100}
					swatchMargin={1}
					includeColors={['emerald', 'red', 'zinc', 'orange']}
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
				/>
			</div>
		</div>
		<div>
			<h4 class="text-center">Limit colors by name</h4>
			<div class="flex justify-center">
				<TailwindColorPicker orientation="vertical" includeColors={['emerald', 'red']} />
			</div>
		</div>

		<div>
			<h4 class="text-center">Limit colors by shade</h4>
			<div class="flex justify-center">
				<TailwindColorPicker
					orientation="vertical"
					includeColors={['emerald', 'red', 'zinc', 'orange']}
					includeShades={['400', '500', '600', '700']}
				/>
			</div>
		</div>

		<div>
			<h4 class="text-center">Vertical orientation</h4>
			<div class="flex justify-center">
				<TailwindColorPicker includeColors={['emerald', 'red', 'zinc', 'orange']} />
			</div>
		</div>

		<div>
			<h4 class="text-center">Sizes</h4>
			<div class="flex justify-center">
				<TailwindColorPicker
					swatchSize={40}
					swatchMargin={2}
					orientation="vertical"
					includeColors={['yellow', 'sky', 'pink', 'fuchsia']}
					includeShades={['400', '500', '600', '700']}
				/>
			</div>
		</div>
	</div>
</div>
