/* eslint-disable @typescript-eslint/no-explicit-any */

import Axios, { AxiosResponseTransformer } from 'axios';
import { Point, Polygon } from 'geojson';
import { makeAutoObservable } from 'mobx';
import env from '../../../src/vendor/environment/env';

export interface IResponseRidPosition {
	id: number;
	operator_username?: string;
	uas_id: string;
	operation_id?: string;
	ua_type?: number;
	timestamp: Date;
	operational_status?: number;
	position: Point;
	geodetic_altitude: number;
	horizontal_accuracy?: number;
	vertical_accuracy?: number;
	speed?: number;
	direction: number;
	vertical_speed?: number;
	operator_location?: Point;
	operating_area_radius?: number;
	operating_area_polygon?: Polygon;
	operating_area_floor?: number;
	operating_area_ceiling?: number;
	operating_area_start_time?: Date;
	operating_area_end_time?: Date;
}

export class PositionEntity {
	id: number;
	altitude_gps: number;
	location: Point;
	time_sent: Date;
	heading: number;
	added_from_dat_file: boolean | null;
	gufi: string;
	uvin: string;

	constructor(position: any) {
		this.id = 0;
		this.altitude_gps = 0.0;
		this.location = {
			type: 'Point',
			coordinates: [0.0, 0.0]
		};
		this.time_sent = new Date();
		this.heading = 0;
		this.added_from_dat_file = null;
		this.gufi = '';
		this.uvin = 'null';

		if (position) {
			for (const prop in position) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				this[prop] = position[prop];
			}

			/*const coordinates = [
				position.location.coordinates[1],
				position.location.coordinates[0]
			];*/

			this.altitude_gps = parseInt(position.altitude_gps);
			this.heading = parseInt(position.heading);
			this.time_sent = new Date(position.time_sent);
			//this.location = { ...position.location, coordinates: coordinates };
		}
		makeAutoObservable(this);
	}

	get displayName() {
		return this.gufi + ' - ' + this.uvin;
	}

	get uniqueId() {
		return this.id + ' - ' + this.gufi + ' - ' + this.uvin;
	}
}

// API calls

const transformPosition = (data: any) => {
	return data.map((position: any) => new PositionEntity(position));
};

const transformPositionRid = (data: IResponseRidPosition[]) => {
	return data.map((position: IResponseRidPosition) => {
		const p = new PositionEntity(position);
		p.id = position.id;
		p.altitude_gps = position.geodetic_altitude;
		p.location = position.position;
		p.time_sent = new Date(position.timestamp);
		p.heading = position.direction;
		p.added_from_dat_file = null;
		p.gufi = position.operation_id || '';
		p.uvin = position.uas_id;
		return p;
	});
};

export const getPositionAPIClient = (api: string, token: string | null) => {
	const axiosInstance = Axios.create({
		baseURL: api,
		timeout: env.tiemeout || 50000,
		headers: { 'Content-Type': 'application/json' }
	});

	return {
		getPastPositions(gufi: string, rangeFrom: Date, rangeTo: Date) {
			return axiosInstance.get('position/date', {
				headers: { auth: token },
				params: {
					gufi: gufi,
					time_start: rangeFrom.toISOString(),
					time_end: rangeTo.toISOString()
				},
				transformResponse: (
					Axios.defaults.transformResponse as AxiosResponseTransformer[]
				).concat(transformPosition)
			});
		},
		postSimulatedPosition(position: PositionEntity) {
			return axiosInstance.post('position', position, {
				headers: { auth: token }
			});
		}
	};
};

export const getPositionRidAPIClient = (api: string, token: string | null) => {
	const axiosInstance = Axios.create({
		baseURL: 'https://localhost:3030/',
		timeout: env.tiemeout || 50000,
		headers: { 'Content-Type': 'application/json' }
	});

	return {
		getPastPositions(gufi: string, rangeFrom: Date, rangeTo: Date) {
			return axiosInstance.get('position/operation', {
				headers: { auth: token },
				params: {
					gufi: gufi,
					time_start: rangeFrom.toISOString(),
					time_end: rangeTo.toISOString()
				},
				transformResponse: (
					Axios.defaults.transformResponse as AxiosResponseTransformer[]
				).concat(transformPositionRid)
			});
		},
		postSimulatedPosition(position: PositionEntity) {
			return axiosInstance.post('position', position, {
				headers: { auth: token }
			});
		}
	};
};
