import { makeAutoObservable } from 'mobx';
import { Polygon } from 'geojson';
import Axios, { AxiosResponseTransformer } from 'axios';
import Joi from 'joi';
import _ from 'lodash';
import { CoordinatorEntity } from './coordinator';
import { buildParametersObject } from '@utm-entities/_util';

export class GeographicalZone implements Record<string, number | any> {
	id?: string;
	name: string;
	geography: Polygon;
	coordinator: CoordinatorEntity | null;
	layer_id: string;
	object_id: string;
	last_update: Date;

	constructor(
		id: string | undefined,
		name: string,
		geography: Polygon,
		coordinator: CoordinatorEntity | null,
		layer_id: string,
		object_id: string,
		last_update: Date
	) {
		this.id = id;
		this.name = name;
		this.geography = geography;
		this.coordinator = coordinator;
		this.layer_id = layer_id;
		this.object_id = object_id;
		this.last_update = last_update;
		makeAutoObservable(this);
	}

	static createFromAPI(existing: any, withoutGeography = false) {
		//FIXME: we are having problem here with multipolygons
		if (!withoutGeography) {
			if (!existing?.geography) {
				return null;
			}
			if (existing?.geography?.type !== 'Polygon') return null;
		}
		const gzValidation = APIGeographicalZoneSchema.validate(existing, {
			abortEarly: false,
			allowUnknown: true
		});

		if (gzValidation.error) {
			console.error('API Out-of-sync ', gzValidation.error);
			return null;
		}

		// if (latlngs[0].lat.length) {
		//   console.log(existing.id)
		// }
		return new GeographicalZone(
			existing.id,
			existing.name,
			existing.geography,
			existing.coordinator ? CoordinatorEntity.createFromGeozone(existing.coordinator) : null,
			existing.layer_id,
			existing.object_id,
			existing.last_update
		);
	}
}

export const APIGeographicalZoneSchema = Joi.object({
	id: Joi.string(),
	name: Joi.string().required().optional().allow(''),
	geography: Joi.object(),
	coordinator: Joi.object().optional().allow(null),
	layer_id: Joi.string(),
	object_id: Joi.string(),
	last_update: Joi.date().optional().allow(null)
});

// API

const transformGeographicalZone = (data: any) => {
	return {
		geographicalZones: _.reject(
			data.geographicalZones.map((gz: any) => GeographicalZone.createFromAPI(gz)),
			(item) => item === null
		),
		count: data.count
	};
};

export interface GetGeographicalZonesParsedResponseType {
	geographicalZones: GeographicalZone[];
	count: number;
}

export const getGeographicalZoneAPIClient = (api: string, token: string | null) => {
	const axiosInstance = Axios.create({
		baseURL: api,
		timeout: 15000,
		headers: { 'Content-Type': 'application/json' }
	});

	return {
		getGeographicalZone(id: string) {
			return axiosInstance.get(`geographicalzones/${id}`, {
				headers: { auth: token },
				transformResponse: Axios.defaults.transformResponse as AxiosResponseTransformer[]
			});
		},
		getGeographicalZonesIntersecting(polygon: Polygon) {
			if (!polygon) {
				throw new Error('Polygon is required');
			}
			const params = { 'polygon[]': JSON.stringify(polygon.coordinates[0]) };
			return axiosInstance.get(`geographicalzones/intersecting`, {
				headers: { auth: token },
				params,
				transformResponse: (
					Axios.defaults.transformResponse as AxiosResponseTransformer[]
				).concat(transformGeographicalZone)
			});
		},
		getGeographicalZones(
			take: number,
			skip: number,
			orderBy: string,
			order: string,
			filterBy: string,
			filter?: string,
			polygon?: Polygon
		) {
			const params = buildParametersObject(take, skip, orderBy, order, filterBy, filter);
			if (polygon) {
				params['polygon[]'] = JSON.stringify(polygon.coordinates[0]);
			}
			return axiosInstance.get<GetGeographicalZonesParsedResponseType>('geographicalzones', {
				params,
				headers: { auth: token },
				transformResponse: (
					Axios.defaults.transformResponse as AxiosResponseTransformer[]
				).concat(transformGeographicalZone)
			});
		}
	};
};
