/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { makeAutoObservable } from 'mobx';
import Axios from 'axios';
import Joi from 'joi';
import { GeographicalZone } from './geographicalZone';
import _ from 'lodash';
import { buildFilterAndOrderParametersObject } from './_util';
import { EntityHasDisplayName } from './types';
import { Feature, FeatureCollection, GeoJsonProperties, Polygon } from 'geojson';

type ManualProcedure = {
	id?: string;
	text_description: string;
	procedure_url: string;
	template_url: string;
	[key: string]: string | undefined;
};

type AutomaticProcedure = {
	id?: string;
	email: string;
	template_html: string;
	[key: string]: string | undefined;
};

export class CoordinatorEntity implements EntityHasDisplayName {
	id?: string;
	infrastructure: string;
	liaison: string;
	type: string;
	telephone?: string;
	email?: string;
	minimun_coordination_days: number;
	price?: number;
	discount_Multiple_Dates?: number;
	geographical_zone?: Partial<GeographicalZone>[];
	role_manager?: string;
	manual_coordinator_procedure?: ManualProcedure | null;
	automatic_coordinator_procedure?: AutomaticProcedure | null;

	[key: string]: CoordinatorEntity[keyof CoordinatorEntity];

	constructor(coordinator: Partial<CoordinatorEntity>) {
		const {
			type,
			liaison,
			infrastructure,
			id,
			telephone = '',
			email = '',
			minimun_coordination_days = 0,
			price = 0,
			discount_Multiple_Dates = 0,
			geographical_zone = [],
			/*manual_coordinator_procedure = {
				text_description: '',
				procedure_url: '',
				template_url: ''
			},*/
			manual_coordinator_procedure = null,
			automatic_coordinator_procedure = null,
			role_manager
		} = coordinator;
		this.id = id || undefined;
		this.infrastructure = infrastructure || '';
		this.liaison = liaison || '';
		this.type = type || '';
		this.telephone = telephone;
		this.email = email;
		this.minimun_coordination_days = Number(minimun_coordination_days);
		this.price = Number(price);
		this.discount_Multiple_Dates = discount_Multiple_Dates
			? Number(discount_Multiple_Dates)
			: 0;
		this.geographical_zone = geographical_zone;
		this.automatic_coordinator_procedure = automatic_coordinator_procedure;
		this.manual_coordinator_procedure = manual_coordinator_procedure;
		this.role_manager = role_manager;
		makeAutoObservable(this);
	}

	set(prop: keyof CoordinatorEntity, value: CoordinatorEntity[keyof CoordinatorEntity]) {
		if (prop === 'displayName') throw new Error('Cannot set displayName');
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		this[prop] = value;
	}

	get displayName() {
		return this.infrastructure;
	}

	static createFromGeozone(data: any, _includesGeozone = true): CoordinatorEntity {
		return new CoordinatorEntity(data);
	}

	static newAutomaticProcedure(): AutomaticProcedure {
		return {
			email: '',
			template_html: ''
		};
	}

	static newManualProcedure(): ManualProcedure {
		return {
			text_description: '',
			procedure_url: '',
			template_url: ''
		};
	}

	getFeatureCollectionFromGeographicalZones() {
		return {
			type: 'FeatureCollection',
			features: this.geographical_zone?.map((gz) => {
				const properties = {
					...gz
				}
				delete properties.geography
				delete properties.coordinator
				return {
					type: 'Feature',
					properties: { ...properties },
					geometry: gz.geography
				}
			})
		}
	}

	static getGeographicalZonesFromFeatureCollection(fc: FeatureCollection): GeographicalZone[] {
		return fc?.features?.filter((f: Feature) => f.properties !== null && f.geometry !== null).map((feature: Feature) => {
			const properties: GeoJsonProperties = feature.properties
			const geometry = feature.geometry as Polygon
			if (!properties || !geometry) return null
			return new GeographicalZone(properties.id, properties.name, geometry, null, properties.last_update, properties.min_altitude, properties.max_altitude);
		}).filter((gz) => gz !== null) as GeographicalZone[]
	}
}


const polygonSchema = Joi.object({
	type: Joi.string().valid('Polygon').required(),
	coordinates: Joi.array().items(
		Joi.array().items(
			Joi.array().items(Joi.number()).length(2) // Cada punto es un array de dos números [longitud, latitud]
		)
	).min(1).required()
});

const geographicalZoneSchema = Joi.object({
	id: Joi.string().optional(),
	name: Joi.string().min(2).required(),
	geography: polygonSchema.required(),
	last_update: Joi.date().optional(),
	min_altitude: Joi.number().required(),
	max_altitude: Joi.number().required()
});


export const APICoordinatorSchema = Joi.object({
	id: Joi.string(),
	telephone: Joi.string(),
	email: Joi.string(),
	minimun_coordination_days: Joi.number(),
	discount_Multiple_Dates: Joi.number().optional(),
	geographical_zone: Joi.array().items(geographicalZoneSchema),
});

// API

const transformCoordinators = (data: any) => {
	return {
		coordinators: data.coordinators.map((gz: any) => new CoordinatorEntity(gz)),
		count: data.count
	};
};

export const getCoordinatorAPIClient = (api: string, token: string | null) => {
	const axiosInstance = Axios.create({
		baseURL: api,
		timeout: 50000,
		headers: { 'Content-Type': 'application/json' }
	});

	return {
		getCoordinators(
			take: number,
			skip: number,
			orderBy: string,
			order: string,
			filterBy: string,
			filter?: string
		) {
			return axiosInstance.get('coordinator', {
				params: buildFilterAndOrderParametersObject(
					take,
					skip,
					orderBy,
					order,
					filterBy,
					filter
				),
				headers: { auth: token },
				transformResponse: [].concat(
					Axios.defaults.transformResponse as any,
					transformCoordinators as any
				)
			});
		},
		saveCoordinator(_coordinator: CoordinatorEntity, isCreating: boolean) {
			const aux = _.cloneDeep(_coordinator);
			if (!aux.geographical_zone) return Promise.reject('Missing geographical zone');
			// if (typeof aux.geographical_zone !== 'string') {
			// 	aux.geographical_zone = aux.geographical_zone.id;
			// }
			const validation = APICoordinatorSchema.validate(aux, {
				abortEarly: false,
				allowUnknown: true
			});

			const errors: string[] = [];
			if (validation.error) {
				validation.error.details.forEach((error) => {
					errors.push(error.message);
				});
				return Promise.reject(errors);
			}

			if (isCreating) {
				// if (typeof aux.geographical_zone === 'string') {
				// 	aux.geographical_zone = { id: aux.geographical_zone };
				// }
				return axiosInstance.post('coordinator', aux, {
					headers: { auth: token }
				});
			} else {
				return axiosInstance.put(
					`coordinator/${aux.id}`,
					{ ...aux, geographical_zone: { id: aux.geographical_zone } },
					{
						headers: { auth: token }
					}
				);
			}
		}
	};
};
