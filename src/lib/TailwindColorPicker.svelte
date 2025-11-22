<script lang="ts">
	import { onMount } from 'svelte';
	import type { ActiveSwatch, ColorGroup } from './types.js';
	import { tailwindColors } from './colors.js';

	type Props = {
		swatchSize?: number;
		swatchMargin?: number;
		borderColor?: string;
		borderThickness?: number;
		roundedCorners?: boolean;
		cornerRadius?: number;
		activeSwatch?: ActiveSwatch | null;
		palette?: ColorGroup[];
		orientation?: 'horizontal' | 'vertical';
		includeColors?: string[];
		excludeColors?: string[];
		includeShades?: string[];
		excludeShades?: string[];
		class?: string;
		onSwatchSelected?: (swatch: ActiveSwatch) => void;
		onUpdateComplete?: () => void;
	};
	let {
		swatchSize: swatchSizeProp = 20,
		swatchMargin: swatchMarginProp = 0,
		borderColor: borderColorProp = '#000000',
		borderThickness: borderThicknessProp = 2,
		roundedCorners: roundedCornersProp = false,
		cornerRadius: cornerRadiusProp = 10,
		activeSwatch = $bindable({
			color: 'gray',
			shade: '500',
			swatch: { hex: '#6b7280' }
		} as ActiveSwatch | null),
		palette = tailwindColors,
		orientation: orientationProp = 'horizontal',
		includeColors,
		excludeColors,
		includeShades: includeShadesProp,
		excludeShades: excludeShadesProp,
		onSwatchSelected,
		onUpdateComplete
	}: Props = $props();

	// Component state (mutable)
	let swatchSize = $state(swatchSizeProp);
	let swatchMargin = $state(swatchMarginProp);
	let borderColor = $state(borderColorProp);
	let borderThickness = $state(borderThicknessProp);
	let roundedCorners = $state(roundedCornersProp);
	let cornerRadius = $state(cornerRadiusProp);
	let orientation: 'horizontal' | 'vertical' = $state(orientationProp);
	let includeShades: string[] | undefined = $state(includeShadesProp);
	let excludeShades: string[] | undefined = $state(excludeShadesProp);
	// activeSwatch is bindable prop; use directly

	// Read-only props (not mutated)
	// palette, includeColors, excludeColors are already defined above

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let baseGridCanvas: HTMLCanvasElement;
	let baseGridCtx: CanvasRenderingContext2D;
	let isPointerDown = false;
	let isDragging = false;

	const filteredColors = $derived(
		filterColors(palette, includeColors, excludeColors, includeShades, excludeShades)
	);

	$effect(() => {
		if (activeSwatch) {
			drawSwatches();
		}
	});

	function filterColors(
		allColors: ColorGroup[],
		includeColors: string[] | undefined,
		excludeColors: string[] | undefined,
		includeShades: string[] | undefined,
		excludeShades: string[] | undefined
	): ColorGroup[] {
		let filtered = allColors;

		if (includeColors && includeColors.length > 0) {
			filtered = filtered.filter((color) => includeColors.includes(color.name));
		} else if (excludeColors && excludeColors.length > 0) {
			filtered = filtered.filter((color) => !excludeColors.includes(color.name));
		}

		return filtered.map((color) => ({
			...color,
			swatches: filterShades(color.swatches, includeShades, excludeShades)
		}));
	}

	function filterShades(
		swatches: Record<string, { hex: string }>,
		include: string[] | undefined,
		exclude: string[] | undefined
	): Record<string, { hex: string }> {
		if (include && include.length > 0) {
			return Object.fromEntries(
				Object.entries(swatches).filter(([shade]) => include.includes(shade))
			);
		} else if (exclude && exclude.length > 0) {
			return Object.fromEntries(
				Object.entries(swatches).filter(([shade]) => !exclude.includes(shade))
			);
		}
		return swatches;
	}

	const canvasWidth = $derived(
		orientation === 'horizontal'
			? calculateCanvasWidth(filteredColors)
			: calculateCanvasHeight(filteredColors)
	);
	const canvasHeight = $derived(
		orientation === 'vertical'
			? calculateCanvasWidth(filteredColors)
			: calculateCanvasHeight(filteredColors)
	);

	function calculateCanvasWidth(colors: ColorGroup[]): number {
		if (!colors || colors.length === 0) return 0;
		const totalColumns = colors.length;
		return swatchSize * totalColumns + swatchMargin * (totalColumns + 1);
	}

	function calculateCanvasHeight(colors: ColorGroup[]): number {
		if (!colors || colors.length === 0) return 0;
		const swatchesPerColumn = Object.keys(colors[0].swatches).length;
		return swatchSize * swatchesPerColumn + swatchMargin * (swatchesPerColumn + 1);
	}

	let swatchPositions: Map<string, Map<string, { x: number; y: number }>> = new Map();

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		baseGridCanvas = document.createElement('canvas');
		baseGridCtx = baseGridCanvas.getContext('2d')!;
		drawBaseGrid();
		drawSwatches();
	});

	function drawBaseGrid(): void {
		if (!filteredColors || filteredColors.length === 0) return;

		baseGridCanvas.width = canvasWidth;
		baseGridCanvas.height = canvasHeight;

		baseGridCtx.clearRect(0, 0, canvasWidth, canvasHeight);
		swatchPositions.clear();

		filteredColors.forEach((color: ColorGroup, columnIndex: number) => {
			let x: number, y: number;
			if (orientation === 'horizontal') {
				x = swatchMargin + columnIndex * (swatchSize + swatchMargin);
				y = swatchMargin;
			} else {
				x = swatchMargin;
				y = swatchMargin + columnIndex * (swatchSize + swatchMargin);
			}

			const shadePositions: Map<string, { x: number; y: number }> = new Map();

			Object.entries(color.swatches).forEach(([shade, swatch]: [string, { hex: string }]) => {
				baseGridCtx.fillStyle = swatch.hex;
				baseGridCtx.globalAlpha = 1;

				const radius: number = roundedCorners ? (cornerRadius / 100) * (swatchSize / 2) : 0;
				drawRoundedRect(baseGridCtx, x, y, swatchSize, swatchSize, radius);

				shadePositions.set(shade, { x, y });

				if (orientation === 'horizontal') {
					y += swatchSize + swatchMargin;
				} else {
					x += swatchSize + swatchMargin;
				}
			});

			swatchPositions.set(color.name, shadePositions);
		});
	}

	function drawSwatches(): void {
		if (!ctx) return;
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		ctx.drawImage(baseGridCanvas, 0, 0);
		drawOverlays();
	}

	function drawOverlays(): void {
		if (activeSwatch) {
			drawSwatchBorder(activeSwatch, borderColor, borderThickness);
		}
	}

	function drawSwatchBorder(swatchInfo: ActiveSwatch, color: string, thickness: number): void {
		const position = getSwatchPosition(swatchInfo);
		if (position) {
			ctx.save();
			ctx.strokeStyle = color;
			ctx.lineWidth = thickness;
			const { x, y } = position;
			const radius = roundedCorners ? (cornerRadius / 100) * (swatchSize / 2) : 0;
			drawRoundedRect(
				ctx,
				x + thickness / 2,
				y + thickness / 2,
				swatchSize - thickness,
				swatchSize - thickness,
				Math.max(0, radius - thickness / 2),
				true
			);
			ctx.restore();
		}
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

	function getSwatchPosition(swatchInfo: ActiveSwatch): { x: number; y: number } | null {
		const shadePositions = swatchPositions.get(swatchInfo.color);
		if (shadePositions) {
			const position = shadePositions.get(swatchInfo.shade);
			if (position) {
				return position;
			}
		}
		return null;
	}

	function getClickedSwatch(x: number, y: number): ActiveSwatch | null {
		let columnIndex, rowIndex;
		if (orientation === 'horizontal') {
			columnIndex = Math.floor((x - swatchMargin) / (swatchSize + swatchMargin));
			rowIndex = Math.floor((y - swatchMargin) / (swatchSize + swatchMargin));
		} else {
			columnIndex = Math.floor((y - swatchMargin) / (swatchSize + swatchMargin));
			rowIndex = Math.floor((x - swatchMargin) / (swatchSize + swatchMargin));
		}

		if (columnIndex >= 0 && columnIndex < filteredColors.length) {
			const color = filteredColors[columnIndex];
			const shades = Object.keys(color.swatches);
			if (rowIndex >= 0 && rowIndex < shades.length) {
				const shade = shades[rowIndex];
				return { color: color.name, shade, swatch: color.swatches[shade] };
			}
		}
		return null;
	}

	function swatchesAreEqual(swatch1: ActiveSwatch | null, swatch2: ActiveSwatch | null): boolean {
		if (swatch1 === swatch2) return true;
		if (!swatch1 || !swatch2) return false;
		return swatch1.color === swatch2.color && swatch1.shade === swatch2.shade;
	}

	function handlePointerInteraction(event: PointerEvent): void {
		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		const clickedSwatch = getClickedSwatch(x, y);
		if (clickedSwatch && !swatchesAreEqual(clickedSwatch, activeSwatch)) {
			activeSwatch = clickedSwatch;
			drawSwatches();
			onSwatchSelected?.(activeSwatch);
		}
	}

	function handlePointerUp(event: PointerEvent): void {
		isPointerDown = false;
		isDragging = false;
		handlePointerInteraction(event);
	}

	export function updateAndRedraw(newSettings: {
		swatchSize?: number;
		swatchMargin?: number;
		borderColor?: string;
		borderThickness?: number;
		roundedCorners?: boolean;
		cornerRadius?: number;
		orientation?: 'horizontal' | 'vertical';
		includeShades?: string[];
		excludeShades?: string[];
		activeSwatch?: ActiveSwatch | null;
	}): void {
		swatchSize = newSettings.swatchSize ?? swatchSize;
		swatchMargin = newSettings.swatchMargin ?? swatchMargin;
		borderColor = newSettings.borderColor ?? borderColor;
		borderThickness = newSettings.borderThickness ?? borderThickness;
		roundedCorners = newSettings.roundedCorners ?? roundedCorners;
		cornerRadius = newSettings.cornerRadius ?? cornerRadius;
		orientation = newSettings.orientation ?? orientation;
		includeShades = newSettings.includeShades ?? includeShades;
		excludeShades = newSettings.excludeShades ?? excludeShades;
		activeSwatch = newSettings.activeSwatch ?? activeSwatch;

		canvas.width = canvasWidth;
		canvas.height = canvasHeight;

		drawBaseGrid();
		drawSwatches();

		onUpdateComplete?.();
	}
</script>

<div>
	<canvas
		bind:this={canvas}
		width={canvasWidth}
		height={canvasHeight}
		onpointerdown={(e) => {
			e.preventDefault();
			isPointerDown = true;
			isDragging = false;
			canvas.setPointerCapture(e.pointerId);
			handlePointerInteraction(e);
		}}
		onpointermove={(e) => {
			if (isPointerDown) {
				e.preventDefault();
				isDragging = true;
				handlePointerInteraction(e);
			}
		}}
		onpointerup={handlePointerUp}
		onpointerleave={(e) => {
			if (isPointerDown) {
				handlePointerUp(e);
			}
		}}
		onpointercancel={(e) => {
			if (isPointerDown) {
				handlePointerUp(e);
			}
		}}
		onblur={() => {
			isPointerDown = false;
			isDragging = false;
			drawSwatches();
		}}
		oncontextmenu={(e) => e.preventDefault()}
		style="touch-action: none; -webkit-tap-highlight-color: transparent;"
		tabindex="0"
	></canvas>
</div>

<svelte:window onpointerup={handlePointerUp} />
