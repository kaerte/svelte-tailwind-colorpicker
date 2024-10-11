<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { tailwindColors } from './colors.js';
	import type { ActiveSwatch, ColorGroup } from './index.js';

	export let swatchSize = 20;
	export let swatchMargin = 0;
	export let borderColor = '#000000';
	export let borderThickness = 2;
	export let roundedCorners = false;
	export let cornerRadius = 10;
	export let activeSwatch: ActiveSwatch | null = null;

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let offscreenCanvas: HTMLCanvasElement;
	let offscreenCtx: CanvasRenderingContext2D;
	let hoveredSwatch: ActiveSwatch | null = null;
	let isMouseDown = false;

	const dispatch = createEventDispatcher();

	export const colors: ColorGroup[] = tailwindColors;

	let canvasWidth = calculateCanvasWidth();
	let canvasHeight = calculateCanvasHeight();

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		offscreenCanvas = document.createElement('canvas');
		offscreenCtx = offscreenCanvas.getContext('2d')!;
		drawSwatches();
	});

	function calculateCanvasWidth(): number {
		const totalColumns = colors.length;
		return swatchSize * totalColumns + swatchMargin * (totalColumns + 1);
	}

	function calculateCanvasHeight(): number {
		const swatchesPerColumn = Object.keys(colors[0].swatches).length;
		return swatchSize * swatchesPerColumn + swatchMargin * (swatchesPerColumn + 1);
	}

	function drawSwatches(): void {
		offscreenCanvas.width = canvasWidth;
		offscreenCanvas.height = canvasHeight;

		offscreenCtx.clearRect(0, 0, canvasWidth, canvasHeight);

		colors.forEach((color, columnIndex) => {
			let x = swatchMargin + columnIndex * (swatchSize + swatchMargin);
			let y = swatchMargin;

			Object.entries(color.swatches).forEach(([shade, swatch]) => {
				offscreenCtx.fillStyle = swatch.hex;
				offscreenCtx.globalAlpha = 1;

				const radius = roundedCorners ? (cornerRadius / 100) * (swatchSize / 2) : 0;
				drawRoundedRect(offscreenCtx, x, y, swatchSize, swatchSize, radius);

				if (activeSwatch && activeSwatch.color === color.name && activeSwatch.shade === shade) {
					offscreenCtx.save();
					offscreenCtx.strokeStyle = borderColor;
					offscreenCtx.lineWidth = borderThickness;

					drawRoundedRect(
						offscreenCtx,
						x + borderThickness / 2,
						y + borderThickness / 2,
						swatchSize - borderThickness,
						swatchSize - borderThickness,
						Math.max(0, radius - borderThickness / 2),
						true
					);

					offscreenCtx.restore();
				}

				y += swatchSize + swatchMargin;
			});
		});

		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		ctx.drawImage(offscreenCanvas, 0, 0);
		console.log('drawSwatches');
	}

	function drawRoundedRect(
		context: CanvasRenderingContext2D,
		x: number,
		y: number,
		width: number,
		height: number,
		radius: number,
		stroke = false
	): void {
		context.beginPath();
		context.moveTo(x + radius, y);
		context.arcTo(x + width, y, x + width, y + height, radius);
		context.arcTo(x + width, y + height, x, y + height, radius);
		context.arcTo(x, y + height, x, y, radius);
		context.arcTo(x, y, x + width, y, radius);
		context.closePath();
		if (stroke) {
			context.stroke();
		} else {
			context.fill();
		}
	}

	function getClickedSwatch(x: number, y: number): ActiveSwatch | null {
		const columnIndex = Math.floor((x - swatchMargin) / (swatchSize + swatchMargin));
		const rowIndex = Math.floor((y - swatchMargin) / (swatchSize + swatchMargin));

		if (columnIndex >= 0 && columnIndex < colors.length) {
			const color = colors[columnIndex];
			const shades = Object.keys(color.swatches);
			if (rowIndex >= 0 && rowIndex < shades.length) {
				const shade = shades[rowIndex];
				return { color: color.name, shade, swatch: color.swatches[shade] };
			}
		}
		return null;
	}

	function handleMouseInteraction(event: MouseEvent): void {
		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		const clickedSwatch = getClickedSwatch(x, y);
		if (clickedSwatch && JSON.stringify(clickedSwatch) !== JSON.stringify(activeSwatch)) {
			activeSwatch = clickedSwatch;
			drawSwatches();
		}
	}

	function updateHoveredSwatch(event: MouseEvent): void {
		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		const newHoveredSwatch = getClickedSwatch(x, y);
		if (JSON.stringify(newHoveredSwatch) !== JSON.stringify(hoveredSwatch)) {
			hoveredSwatch = newHoveredSwatch;
			drawSwatches();
		}
	}

	export function updateAndRedraw(newSettings: {
		swatchSize?: number;
		swatchMargin?: number;
		borderColor?: string;
		borderThickness?: number;
		roundedCorners?: boolean;
		cornerRadius?: number;
	}): void {
		swatchSize = newSettings.swatchSize ?? swatchSize;
		swatchMargin = newSettings.swatchMargin ?? swatchMargin;
		borderColor = newSettings.borderColor ?? borderColor;
		borderThickness = newSettings.borderThickness ?? borderThickness;
		roundedCorners = newSettings.roundedCorners ?? roundedCorners;
		cornerRadius = newSettings.cornerRadius ?? cornerRadius;

		canvasWidth = calculateCanvasWidth();
		canvasHeight = calculateCanvasHeight();

		canvas.width = canvasWidth;
		canvas.height = canvasHeight;

		requestAnimationFrame(drawSwatches);

		dispatch('updateComplete');
	}
</script>

<div class="color-picker">
	<h1>Color Swatches</h1>
	<canvas
		bind:this={canvas}
		width={canvasWidth}
		height={canvasHeight}
		on:mousedown={(e) => {
			isMouseDown = true;
			handleMouseInteraction(e);
		}}
		on:mousemove={(e) => {
			if (isMouseDown) {
				handleMouseInteraction(e);
			} else {
				updateHoveredSwatch(e);
			}
		}}
		on:mouseup={() => (isMouseDown = false)}
		on:mouseout={() => {
			isMouseDown = false;
			hoveredSwatch = null;
			drawSwatches();
		}}
	></canvas>
</div>