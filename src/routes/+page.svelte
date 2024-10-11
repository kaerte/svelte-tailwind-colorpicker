<script lang="ts">
	import TailwindColorPicker from '$lib/TailwindColorPicker.svelte';
	import type { ActiveSwatch } from '$lib/index.js';

	let swatchSize = 25;
	let swatchMargin = 2;
	let borderColor = '#FF0000';
	let borderThickness = 3;
	let roundedCorners = true;
	let cornerRadius = 20;
	let activeSwatch: ActiveSwatch | null = null;
	let colorPicker: TailwindColorPicker;

	function handleApplySettings() {
		colorPicker.updateAndRedraw({
			swatchSize,
			swatchMargin,
			borderColor,
			borderThickness,
			roundedCorners,
			cornerRadius
		});
	}
</script>

<TailwindColorPicker
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

<div class="controls">
	<label>
		Swatch Size:
		<input type="number" bind:value={swatchSize} min="10" max="100" />
	</label>
	<label>
		Margin:
		<input type="number" bind:value={swatchMargin} min="0" max="20" />
	</label>
	<label>
		Active Border Color:
		<input type="color" bind:value={borderColor} />
	</label>
	<label>
		Active Border Thickness:
		<input type="number" bind:value={borderThickness} min="1" max="10" />
	</label>
	<label>
		Rounded Corners:
		<input type="checkbox" bind:checked={roundedCorners} />
	</label>
	<label>
		Corner Radius:
		<input type="range" bind:value={cornerRadius} min="0" max="100" />
		<span>{cornerRadius}%</span>
	</label>
	<button on:click={handleApplySettings}>Apply Changes</button>
</div>

<div>
	<h2>Current Settings:</h2>
	<p>Swatch Size: {swatchSize}</p>
	<p>Swatch Margin: {swatchMargin}</p>
	<p>Border Color: {borderColor}</p>
	<p>Border Thickness: {borderThickness}</p>
	<p>Rounded Corners: {roundedCorners ? 'Yes' : 'No'}</p>
	<p>Corner Radius: {cornerRadius}</p>
</div>

{#if activeSwatch}
	<div>
		<h2>Active Swatch:</h2>
		<p>Color: {activeSwatch.color}</p>
		<p>Shade: {activeSwatch.shade}</p>
		<p>Hex: {activeSwatch.swatch.hex}</p>
	</div>
{/if}

<style>
	.controls {
		margin-top: 20px;
	}

	.controls label {
		margin-right: 10px;
	}
</style>

