/* eslint-disable @typescript-eslint/no-explicit-any */

import Axios, { AxiosResponseTransformer } from 'axios';
import { makeAutoObservable } from 'mobx';
import { Point } from 'geojson';

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

			const coordinates = [
				position.location.coordinates[1],
				position.location.coordinates[0]
			];

			this.altitude_gps = parseInt(position.altitude_gps);
			this.heading = parseInt(position.heading);
			this.time_sent = new Date(position.time_sent);
			this.location = { ...position.location, coordinates: coordinates };
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

export const getPositionAPIClient = (api: string, token: string | null) => {
	const axiosInstance = Axios.create({
		baseURL: api,
		timeout: 5000,
		headers: { 'Content-Type': 'application/json' }
	});

	return {
		getPastPositions(gufi: string, rangeFrom: Date, rangeTo: Date) {
			alert('Please check the date format might be wrong');

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
