import { ThreeDimensionalPoint } from './ThreeDimensionalPoint';
import { makeAutoObservable } from 'mobx';

export class ThreeDimensionalPolygon implements Record<string, number | string> {
	latlngs: Array<ThreeDimensionalPoint>;

	constructor(latlngs: Array<ThreeDimensionalPoint>) {
		this.latlngs = latlngs;
		makeAutoObservable(this);
	}

	get length() {
		return this.latlngs.length;
	}

	// eslint-disable-next-line
	[x: string]: any;
}
