// Class that represents a polygon shape. When passed a list of coordinates, it returns a SolidPolygonLayer
import { GeoJsonLayer } from '@deck.gl/layers/typed';
import type { Polygon } from 'geojson';
import type { RGBA, TokyoPickableElement, TokyoPolygonElement } from '../../TokyoTypes';
import { FillStyleExtension, PathStyleExtension } from '@deck.gl/extensions/typed';

export interface FillImage {
	atlas: string;
	mapping: {
		pattern: {
			x: number;
			y: number;
			width: number;
			height: number;
		};
	};
	patternMask?: boolean;
	patternScale?: number;
	patternOffset?: [number, number];
}

export class TokyoPolygon implements TokyoPickableElement, TokyoPolygonElement {
	constructor(params: {
		polygon: Polygon;
		id: string;
		fill: RGBA;
		fillImage?: FillImage;
		dashArray?: number[];
		getLineWidth?: (index?: number) => number;
		getLineColor: (index?: number) => RGBA;
	}) {
		// Defaults
		this.fill = [180, 180, 180, 100];
		this.getLineColor = () => [0, 0, 0, 255];
		this.getLineWidth = () => 1;

		// Assign params
		this._shape = params.polygon;
		this._id = params.id;
		this.fill = params.fill;
		this.getLineColor = params.getLineColor;
		if (params.getLineWidth) this.getLineWidth = params.getLineWidth;
		if (params.fillImage) this.fillImage = params.fillImage;
		if (params.dashArray) this.dashArray = params.dashArray;
	}
	private _shape: Polygon;
	private readonly _id: string;
	fill: RGBA;
	fillImage?: FillImage;
	dashArray?: number[];
	getLineColor: (index?: number) => RGBA;
	getLineWidth: (index?: number) => number;

	get id(): string {
		return this._id;
	}

	get shape(): Polygon {
		return this._shape;
	}

	set shape(value: Polygon) {
		this._shape = value;
	}

	get render(): GeoJsonLayer[] {
		let fillProps = {};
		let lineProps = {};
		if (this.fillImage) {
			fillProps = {
				fillPatternAtlas: this.fillImage.atlas,
				fillPatternMapping: this.fillImage.mapping,
				fillPatternMask: this.fillImage.patternMask ?? false,
				getFillPattern: () => 'pattern',
				getFillPatternScale: this.fillImage.patternScale ?? 1,
				getFillPatternOffset: this.fillImage.patternOffset ?? [0, 0]
			};
		}
		if (this.dashArray) {
			lineProps = {
				getDashArray: this.dashArray,
				dashJustified: true,
				dashGapPickable: true
			};
		}

		const extensions = [];
		if (this.fillImage) {
			extensions.push(new FillStyleExtension({ pattern: true }));
		}
		if (this.dashArray) {
			extensions.push(new PathStyleExtension({ dash: true }));
		}

		return [
			new GeoJsonLayer({
				// TODO: Could use loaders.gl format to speed-up loading
				data: this._shape as never,
				id: this._id,
				pickable: true,
				filled: true,
				getFillColor: this.fill,
				getLineColor: () => this.getLineColor(),
				getLineWidth: () => this.getLineWidth(),
				lineWidthUnits: 'pixels',
				...fillProps,
				...lineProps,
				extensions
			})
		];
	}
}
