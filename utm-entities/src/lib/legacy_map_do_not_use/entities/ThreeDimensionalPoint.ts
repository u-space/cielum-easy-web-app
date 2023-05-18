import { makeAutoObservable, toJS } from 'mobx';
import _ from 'lodash';
import Joi from 'joi';

// eslint-disable-next-line
export class ThreeDimensionalPoint implements Record<string, any> {
	lat: number;
	lng: number;
	altitude_msl: number;

	constructor(lat: number, lng: number, altitude_msl: number) {
		this.lat = lat;
		this.lng = lng;
		this.altitude_msl = altitude_msl;
		return makeAutoObservable(this);
	}

	static createFrom(point: ThreeDimensionalPoint) {
		return new ThreeDimensionalPoint(point.lat, point.lng, point.altitude_msl);
	}

	static createFromAPI(point: any) {
		const validatePoint = APIThreeDimensionalPointSchema.validate(point, {
			abortEarly: false,
			allowUnknown: true
		});
		if (validatePoint.error) {
			console.error('API Out-of-sync ', validatePoint.error);
			return null;
		}
		return new ThreeDimensionalPoint(point.latitude, point.longitude, point.altitude);
	}

	get asBackendFormat() {
		const copy = toJS(this);

		return { latitude: copy.lat, longitude: copy.lng, altitude: copy.altitude_msl };
	}

	// eslint-disable-next-line
	[x: string]: any;
}

export const APIThreeDimensionalPointSchema = Joi.object({
	latitude: Joi.number().required(),
	longitude: Joi.number().required(),
	altitude: Joi.number().required()
});
