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
  let className: string = '';
  export { className as class };

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let baseGridCanvas: HTMLCanvasElement;
  let baseGridCtx: CanvasRenderingContext2D;
  let hoveredSwatch: ActiveSwatch | null = null; // This can be removed if not used elsewhere
  let isMouseDown = false;
  let isDragging = false;

  const dispatch = createEventDispatcher();

  export let includeColors: string[] | undefined = undefined;
  export let excludeColors: string[] | undefined = undefined;

  $: filteredColors = filterColors(tailwindColors, includeColors, excludeColors);

  function filterColors(
    allColors: ColorGroup[],
    include: string[] | undefined,
    exclude: string[] | undefined
  ): ColorGroup[] {
    if (include && include.length > 0) {
      return allColors.filter(color => include.includes(color.name));
    } else if (exclude && exclude.length > 0) {
      return allColors.filter(color => !exclude.includes(color.name));
    }
    return allColors;
  }

  $: canvasWidth = calculateCanvasWidth(filteredColors);
  $: canvasHeight = calculateCanvasHeight(filteredColors);

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

    filteredColors.forEach((color, columnIndex) => {
      let x = swatchMargin + columnIndex * (swatchSize + swatchMargin);
      let y = swatchMargin;

      const shadePositions: Map<string, { x: number; y: number }> = new Map();

      Object.entries(color.swatches).forEach(([shade, swatch]) => {
        baseGridCtx.fillStyle = swatch.hex;
        baseGridCtx.globalAlpha = 1;

        const radius = roundedCorners ? (cornerRadius / 100) * (swatchSize / 2) : 0;
        drawRoundedRect(baseGridCtx, x, y, swatchSize, swatchSize, radius);

        shadePositions.set(shade, { x, y });

        y += swatchSize + swatchMargin;
      });

      swatchPositions.set(color.name, shadePositions);
    });
  }

  function drawSwatches(): void {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(baseGridCanvas, 0, 0);
    drawOverlays();
  }

  function drawOverlays(): void {
    if (activeSwatch) {
      drawSwatchBorder(activeSwatch, borderColor, borderThickness);
    }
    // Remove the following lines:
    // if (hoveredSwatch && !isMouseDown) {
    //   drawSwatchBorder(hoveredSwatch, 'rgba(0,0,0,0.5)', 1);
    // }
  }

  function drawSwatchBorder(
    swatchInfo: ActiveSwatch,
    color: string,
    thickness: number
  ): void {
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

  function getSwatchPosition(
    swatchInfo: ActiveSwatch
  ): { x: number; y: number } | null {
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
    const columnIndex = Math.floor((x - swatchMargin) / (swatchSize + swatchMargin));
    const rowIndex = Math.floor((y - swatchMargin) / (swatchSize + swatchMargin));

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

  function swatchesAreEqual(
    swatch1: ActiveSwatch | null,
    swatch2: ActiveSwatch | null
  ): boolean {
    if (swatch1 === swatch2) return true;
    if (!swatch1 || !swatch2) return false;
    return swatch1.color === swatch2.color && swatch1.shade === swatch2.shade;
  }

  function handleMouseInteraction(event: MouseEvent): void {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clickedSwatch = getClickedSwatch(x, y);
    if (clickedSwatch && !swatchesAreEqual(clickedSwatch, activeSwatch)) {
      activeSwatch = clickedSwatch;
      drawSwatches();
      dispatch('swatchSelected', { swatch: activeSwatch });
    }
  }

  function handleMouseUp(event: MouseEvent): void {
    isMouseDown = false;
    isDragging = false;
    // Ensure we update the swatch on mouse up, even if outside the canvas
    handleMouseInteraction(event);
  }

  function updateHoveredSwatch(event: MouseEvent): void {
    // This function can be removed or left empty if not used elsewhere
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

    canvasWidth = calculateCanvasWidth(filteredColors);
    canvasHeight = calculateCanvasHeight(filteredColors);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    drawBaseGrid();
    drawSwatches();

    dispatch('updateComplete');
  }
</script>

<div class={className}>
  <canvas
    bind:this="{canvas}"
    width="{canvasWidth}"
    height="{canvasHeight}"
    on:mousedown="{(e) => {
      isMouseDown = true;
      isDragging = false;
      handleMouseInteraction(e);
    }}"
    on:mousemove="{(e) => {
      if (isMouseDown) {
        isDragging = true;
        handleMouseInteraction(e);
      }
    }}"
    on:mouseup="{handleMouseUp}"
    on:mouseout="{(e) => {
      if (isMouseDown) {
        handleMouseUp(e);
      }
    }}"
    on:blur="{() => {
      isMouseDown = false;
      isDragging = false;
      drawSwatches();
    }}"
    tabindex="0"
  ></canvas>
</div>

<svelte:window on:mouseup="{handleMouseUp}" />
