// Class that represents a polygon shape. When passed a list of coordinates, it returns a SolidPolygonLayer
import { GeoJsonLayer } from '@deck.gl/layers/typed';
import { Polygon } from 'geojson';
import { RGBA, TokyoPickableElement, TokyoPolygonElement } from '../../TokyoTypes';
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
	constructor(
		polygon: Polygon,
		id: string,
		fill: RGBA = [180, 180, 180, 100],
		getLineColor: (index?: number) => RGBA = () => [0, 0, 0, 255],
		fillImage?: FillImage,
		dashArray?: number[]
	) {
		this._shape = polygon;
		this._id = id;
		this.fill = fill;
		this.getLineColor = getLineColor;
		this.fillImage = fillImage;
		this.dashArray = dashArray;
	}
	private _shape: Polygon;
	private readonly _id: string;
	fill: RGBA;
	fillImage?: FillImage;
	dashArray?: number[];
	getLineColor: (index?: number) => RGBA;

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
		const fillProps = this.fillImage
			? {
					fillPatternAtlas: this.fillImage.atlas,
					fillPatternMapping: this.fillImage.mapping,
					fillPatternMask: this.fillImage.patternMask ?? false,
					getFillPattern: () => 'pattern',
					getFillPatternScale: this.fillImage.patternScale ?? 1,
					getFillPatternOffset: this.fillImage.patternOffset ?? [0, 0]
			  }
			: {};
		const lineProps = this.dashArray
			? {
					getDashArray: this.dashArray,
					dashJustified: true,
					dashGapPickable: true
			  }
			: {};

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
				...fillProps,
				...lineProps,
				extensions
			})
		];
	}
}
