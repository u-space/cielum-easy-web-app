// Class that represents a polygon shape. When passed a list of coordinates, it returns a SolidMultiPolygonLayer
import { GeoJsonLayer } from '@deck.gl/layers/typed';
import { MultiPolygon } from 'geojson';
import { RGBA, TokyoPickableElement, TokyoPolygonElement } from '../../TokyoTypes';

/**
 * DEPRECATED
 */
export class TokyoMultiPolygon implements TokyoPickableElement, TokyoPolygonElement {
	constructor(
		polygon: MultiPolygon,
		id: string,
		fill: RGBA = [180, 180, 180, 100],
		getLineColor: (index?: number) => RGBA = () => [0, 0, 0, 255]
	) {
		this._shape = polygon;
		this._id = id;
		this.fill = fill;
		this.getLineColor = getLineColor;
	}
	private _shape: MultiPolygon;
	private readonly _id: string;
	fill: RGBA;
	getLineColor: (index?: number) => RGBA;

	get id(): string {
		return this._id;
	}

	get shape(): MultiPolygon {
		return this._shape;
	}

	set shape(value: MultiPolygon) {
		this._shape = value;
	}

	get render(): GeoJsonLayer[] {
		return this.shape.coordinates.map((coordinates, index) => {
			return new GeoJsonLayer({
				// TODO: Could use loaders.gl format to speed-up loading
				data: { type: 'Polygon', coordinates } as never,
				id: `${this._id}<${index}>` as string,
				filled: true,
				pickable: true,
				getFillColor: this.fill,
				getLineWidth: 1,
				getLineColor: this.getLineColor(index)
				/*extruded: true, TODO: 3D mode
			getElevation: 50*/
			});
		});
	}
}
