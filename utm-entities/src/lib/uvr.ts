/* eslint-disable @typescript-eslint/no-explicit-any */

import Axios, { AxiosResponseTransformer } from 'axios';
import { Polygon } from 'geojson';
import i18n from 'i18next';
import Joi from 'joi';
import _ from 'lodash';
import { makeAutoObservable } from 'mobx';
import env from '../../../src/vendor/environment/env';
import { buildParametersObject } from './_util';
import { EntityHasDisplayName } from './types';

export class UvrEntity implements EntityHasDisplayName {
	id: string | null;
	message_id: string | null;
	actual_time_end: Date | null;
	cause: string;
	effective_time_begin: Date;
	effective_time_end: Date;
	geography: Polygon | null;
	max_altitude: number;
	min_altitude: number;
	permitted_uas: string[];
	reason: string;
	required_support: string[];
	type: string;
	uss_name: string | null;
	deletedAt: Date | null;
	_schema: Joi.ObjectSchema;

	[key: string]: any;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	constructor(uvr?: any) {
		this.message_id = null;
		this.id = null;
		this.actual_time_end = null;
		this.cause = 'SECURITY';
		this.effective_time_begin = new Date();
		this.effective_time_end = new Date();
		this.effective_time_end.setHours(23, 59)
		this.geography = null;
		this.max_altitude = 50;
		this.min_altitude = 0;
		this.permitted_uas = [];
		this.reason = i18n.t('Unknown');
		this.required_support = ['ENHANCED_SAFE_LANDING'];
		this.type = 'DYNAMIC_RESTRICTION';
		this.uss_name = null;
		this.deletedAt = null;

		if (uvr) {
			for (const prop in uvr) {
				if (prop !== 'asBackendFormat' && prop !== 'displayName') {
					this[prop] = uvr[prop];
				}
			}
			this.id = uvr.message_id;
			this.min_altitude = parseInt(uvr.min_altitude);
			this.max_altitude = parseInt(uvr.max_altitude);
			this.effective_time_begin = new Date(uvr.effective_time_begin);
			this.effective_time_end = new Date(uvr.effective_time_end);
		}

		this._schema = Joi.object({
			effective_time_begin: Joi.date().required(),
			effective_time_end: Joi.date().required(),
			geography: Joi.object().required(), // TODO: Better typing
			max_altitude: Joi.number().required(),
			min_altitude: Joi.number().required(),
			reason: Joi.string().required()
		});
		makeAutoObservable(this);
	}

	set(prop: keyof UvrEntity, value: UvrEntity[keyof UvrEntity]) {
		if (prop === '_schema' || prop === 'asBackendFormat' || prop === 'displayName')
			throw new Error('UvrEntity: Cannot set a readonly property');
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		this[prop] = value;
	}

	get displayName() {
		return this.reason;
	}

	get asBackendFormat() {
		const snapshot = _.cloneDeep(this);

		for (const prop in snapshot) {
			if (prop[0] === '_') {
				delete snapshot[prop]; // Dont submit internal data to backend
			}
		}

		// const newCoordinates = snapshot.geography.coordinates[0].map((lngLat) => [
		// 	lngLat[1],
		// 	lngLat[0]
		// ]);
		// snapshot.geography.coordinates = [[...newCoordinates, newCoordinates[0]]];

		return snapshot;
	}

	validate() {
		const errors = [];
		if (this.geography == null || this.geography.coordinates[0].length <= 2) {
			errors.push(
				i18n.t(
					'The drawn polygon does not have any points, and at least three are required'
				)
			);
		}
		/*if (this.effective_time_begin < new Date()) {
	  errors.push(i18n.t('An UVR MUST NOT start before the current time'));
	}*/
		if (this.effective_time_begin >= this.effective_time_end) {
			errors.push(i18n.t('An UVR MUST NOT start after its ending time'));
		}
		if (this.min_altitude >= this.max_altitude) {
			errors.push(
				i18n.t('An UVR MUST NOT have a minimum altitude higher than its maximum altitude')
			);
		}
		const validation = this._schema.validate(this, {
			abortEarly: false,
			allowUnknown: true
		});
		if (validation.error) errors.push(validation.error);
		return errors;
	}
}

const transformUVR = (data: any): GetUvrsParsedResponse => {
	return { uvrs: data.uvrs.map((uvr: any) => new UvrEntity(uvr)), count: data.count };
};

export interface GetUvrsParsedResponse {
	uvrs: UvrEntity[];
	count: number;
}

export const getUvrAPIClient = (api: string, token: string | null) => {
	const axiosInstance = Axios.create({
		baseURL: api,
		timeout: env.tiemeout || 50000,
		headers: { 'Content-Type': 'application/json' }
	});

	return {
		getUvrs(
			take: number,
			skip: number,
			orderBy: string,
			order: string,
			filterBy: string,
			filter?: string
		) {
			return axiosInstance.get('uasvolume', {
				params: buildParametersObject(take, skip, orderBy, order, filterBy, filter),
				headers: { auth: token },
				transformResponse: (
					Axios.defaults.transformResponse as AxiosResponseTransformer[]
				).concat(transformUVR)
			});
		},
		getUvr(id: string) {
			return axiosInstance.get('uasvolume', {
				params: buildParametersObject(1, 0, 'message_id', 'ASC', 'message_id', id),
				headers: { auth: token },
				transformResponse: (
					Axios.defaults.transformResponse as AxiosResponseTransformer[]
				).concat(transformUVR)
			});
		},
		deleteUvr(message_id: string) {
			return axiosInstance.delete(`/uasvolume/${message_id}`, { headers: { auth: token } });
		},
		saveUvr(uvr: UvrEntity) {
			const errors = uvr.validate();
			if (errors.length > 0) return Promise.reject(errors);
			return axiosInstance.post('uasvolume', uvr.asBackendFormat, {
				headers: { auth: token }
			});
		}
	};
};
