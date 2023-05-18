import { makeAutoObservable } from 'mobx';
import Axios, { AxiosResponseTransformer } from 'axios';
import Joi from 'joi';
import { ThreeDimensionalPoint } from './legacy_map_do_not_use/entities/ThreeDimensionalPoint';

export class Vertiport implements Record<string, any> {
	id: string;
	name: string;
	point: ThreeDimensionalPoint;
	buffer: number;
	closedHours: Array<string>; // TODO: reusable type
	timeBetweenFlights: number;

	constructor(
		id: string,
		name: string,
		point: ThreeDimensionalPoint,
		buffer: number,
		closedHours: Array<string>,
		timeBetweenFlights: number
	) {
		this.id = id;
		this.name = name;
		this.point = point;
		this.buffer = buffer;
		this.closedHours = closedHours;
		this.timeBetweenFlights = timeBetweenFlights;
		makeAutoObservable(this);
	}

	static createFromAPI(existing: any) {
		if (!existing.point) return null;

		const pointValidation = Joi.object({
			latitude: Joi.number(),
			longitude: Joi.number()
			//altitude: Joi.string() MSL altitude of ground, NYI
		}).validate(existing.point, {
			abortEarly: false,
			allowUnknown: true
		});
		if (pointValidation.error) {
			console.error('API Out-of-sync ', pointValidation.error);
			return null;
		}
		const point = new ThreeDimensionalPoint(
			existing.point.latitude,
			existing.point.longitude,
			0
		);

		const vertiportValidation = APIVertiportSchema.validate(existing.point, {
			abortEarly: false,
			allowUnknown: true
		});

		if (vertiportValidation.error) {
			console.error('API Out-of-sync ', vertiportValidation.error);
			return null;
		}

		return new Vertiport(
			existing.id,
			existing.name,
			point,
			50,
			[],
			existing.timeBetweenFlights
		);
	}

	[x: string]: any;
}

export const APIVertiportSchema = Joi.object({
	id: Joi.string(),
	name: Joi.string(),
	buffer: Joi.number(),
	timeBetweenFlights: Joi.number()
});

export const transformVertiports = (data: any) => {
	return data.map((vertiport: any) => Vertiport.createFromAPI(vertiport));
};

// API

export function getVertiportAPIClient(api: string, token: string) {
	const axiosInstance = Axios.create({
		baseURL: api,
		timeout: 5000,
		headers: { 'Content-Type': 'application/json' }
	});
	return {
		getVertiports(token: string) {
			return axiosInstance.get('vertiports?take=99999', {
				headers: { auth: token },
				transformResponse: (
					Axios.defaults.transformResponse as AxiosResponseTransformer[]
				).concat(transformVertiports)
			});
		}
	};
}
