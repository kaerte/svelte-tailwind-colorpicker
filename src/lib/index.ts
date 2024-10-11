// Reexport your entry components here
export type Swatch = {
	hex: string;
};

export type ColorGroup = {
	name: string;
	swatches: Record<string, Swatch>;
};

export type ActiveSwatch = {
	color: string;
	shade: string;
	swatch: Swatch;
};
