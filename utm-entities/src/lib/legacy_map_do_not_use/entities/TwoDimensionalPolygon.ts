import { makeAutoObservable } from 'mobx';
import { TwoDimensionalPoint } from './TwoDimensionalPoint';
import turf from 'turf';

export class TwoDimensionalPolygon implements Record<string, number | string> {
	latlngs: Array<TwoDimensionalPoint>;

	constructor(latlngs: Array<TwoDimensionalPoint>) {
		this.latlngs = latlngs;
		makeAutoObservable(this);
	}

	get length() {
		return this.latlngs.length;
	}

	get polygon() {
		return turf.polygon([this.latlngs.map((point) => [point.lng, point.lat])]);
	}

	get bbox() {
		return turf.bbox(turf.polygon([this.latlngs.map((latlng) => [latlng.lng, latlng.lat])]));
	}

	// eslint-disable-next-line
	[x: string]: any;
}
