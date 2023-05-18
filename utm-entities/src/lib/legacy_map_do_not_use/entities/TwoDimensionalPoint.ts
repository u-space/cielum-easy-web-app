import { makeAutoObservable, toJS } from 'mobx';
import Joi from 'joi';

export class TwoDimensionalPoint implements Record<string, any> {
	lat: number;
	lng: number;

	constructor(lat: number, lng: number) {
		this.lat = lat;
		this.lng = lng;
		return makeAutoObservable(this);
	}

	static createFrom(point: TwoDimensionalPoint) {
		return new TwoDimensionalPoint(point.lat, point.lng);
	}

	get asBackendFormat() {
		const copy = toJS(this);

		return { latitude: copy.lat, longitude: copy.lng };
	}

	// eslint-disable-next-line
	[x: string]: any;
}

export const APITwoDimensionalPointSchema = Joi.object({
	latitude: Joi.number().required(),
	longitude: Joi.number().required()
});
