/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import Axios, { AxiosResponseTransformer } from 'axios';

import Joi from 'joi';
import env from '../../../src/vendor/environment/env';

export enum vehicleType {
	MULTIROTOR = 'MULTIROTOR',
	FIXEDWING = 'FIXEDWING',
	VTOL = 'VTOL',
	OTHER = 'OTHER'
}

export class AircraftType {
	id?: number;
	manufacturer: string; // Marca // brand en fly safe
	model: string; // Model
	class: vehicleType; // Clase: (Ala fija Multirotor Hibrido VTOL)
	mtom: string; // MTOM maximum take of weiht
	time_autonomy: number; // Autonomía //FIXME
	pilot: string; // AutoPiloto
	band: string; // Banda
	color: string;
	lights: string; // Luces
	load_weight: number; // Carga //number? //TODO:: units?
	vhf: boolean;
	visual_front_sensor: string; // Dispositivo Visión Delantera
	dimension: string; // Dimensión
	energy: string; // Energia impacto

	[key: string]: AircraftType[keyof AircraftType];

	constructor(
		id: number,
		manufacturer: string,
		model: string,
		classType: vehicleType,
		mtom: string,
		time_autonomy: number,
		pilot: string,
		band: string,
		color: string,
		lights: string,
		load_weight: number,
		vhf: boolean,
		visual_front_sensor: string,
		dimension: string,
		energy: string
	) {
		this.id = id;
		this.manufacturer = manufacturer;
		this.model = model;
		this.class = classType;
		this.mtom = mtom;
		this.time_autonomy = time_autonomy;
		this.pilot = pilot;
		this.band = band;
		this.color = color;
		this.lights = lights;
		this.load_weight = load_weight;
		this.vhf = vhf;
		this.visual_front_sensor = visual_front_sensor;
		this.dimension = dimension;
		this.energy = energy;
	}
}

export const APIAircraftTypeSchema = Joi.object({
	id: Joi.number().optional(),
	manufacturer: Joi.string().allow(null), // Marca // brand en fly safe
	model: Joi.string().allow(null), // Model
	class: Joi.string()
		.allow(null)
		.valid(...Object.values(vehicleType))
		.allow(null), // Clase: (Ala fija Multirotor Hibrido VTOL)
	mtom: Joi.string().allow(null), // MTOM maximum take of weiht
	time_autonomy: Joi.number().allow(null), // Autonomía //FIXME
	pilot: Joi.string().allow(null), // AutoPiloto
	band: Joi.string().allow(null), // Banda
	color: Joi.string().allow(null),
	lights: Joi.string().allow(null), // Luces
	load_weight: Joi.number().allow(null), // Carga //number? //TODO:: units?
	vhf: Joi.boolean().allow(null),
	visual_front_sensor: Joi.string().allow(null), // Dispositivo Visión Delantera
	dimension: Joi.string().allow(null), // Dimensión
	energy: Joi.string().allow(null) // Energia impacto
});

// API

const transformAircraftTypes = (data: any) => {
	return data.map(
		(gz: any) =>
			new AircraftType(
				gz.id,
				gz.manufacturer,
				gz.model,
				gz.class,
				gz.mtom,
				gz.time_autonomy,
				gz.pilot,
				gz.band,
				gz.color,
				gz.lights,
				gz.load_weight,
				gz.vhf,
				gz.visual_front_sensor,
				gz.dimension,
				gz.energy
			)
	);
};

export function getAircraftTypeAPIClient(api: string, token: string | null) {
	const axiosInstance = Axios.create({
		baseURL: api,
		timeout: env.tiemeout || 50000,
		headers: { 'Content-Type': 'application/json' }
	});
	return {
		getAircraftTypes() {
			return axiosInstance.get('aircraftType', {
				headers: { auth: token },
				transformResponse: (
					Axios.defaults.transformResponse as AxiosResponseTransformer[]
				).concat(transformAircraftTypes)
			});
		}
	};
}
