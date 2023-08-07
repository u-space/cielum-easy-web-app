/* eslint-disable @typescript-eslint/no-explicit-any */

import Joi from 'joi';
import { makeAutoObservable } from 'mobx';
import _ from 'lodash';
import i18n from 'i18next';
import Axios, { AxiosResponseTransformer } from 'axios';

import { Polygon } from 'geojson';

import { buildParametersObject } from './_util';
import { EntityHasDisplayName } from './types';

export class RfvEntity implements EntityHasDisplayName {
	id?: string;
	comments: string;
	min_altitude: number;
	max_altitude: number;
	geography: Polygon | null;
	readonly _schema: Joi.ObjectSchema;
	deletedAt?: Date;

	constructor(rfv?: any) {
		this.id = '_temp';
		this.comments = '';
		this.min_altitude = 0;
		this.max_altitude = 120;
		this.geography = null;

		if (rfv) {
			for (const prop in rfv) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				this[prop] = rfv[prop];
			}
			this.min_altitude = parseInt(rfv.min_altitude || '0');
			this.max_altitude = parseInt(rfv.max_altitude || '120');
		}

		this._schema = Joi.object({
			geography: Joi.object().required(), // TODO: Better typing
			max_altitude: Joi.number().required(),
			min_altitude: Joi.number().required(),
			comments: Joi.string().required()
		});

		makeAutoObservable(this);
	}

	[key: string]: any;

	set(prop: keyof RfvEntity, value: RfvEntity[keyof RfvEntity]) {
		if (prop === '_schema' || prop === 'asBackendFormat' || prop === 'displayName')
			throw new Error('RfvEntity: Cannot set a readonly property');
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		this[prop] = value;
	}
	get(prop: keyof RfvEntity) {
		return this[prop];
	}
	get displayName() {
		return this.comments;
	}
	get asBackendFormat() {
		const snapshot = _.cloneDeep(this);

		if (snapshot.id === '_temp') {
			delete snapshot.id;
			delete snapshot.deletedAt;
		}

		for (const prop in snapshot) {
			if (prop[0] === '_') {
				delete snapshot[prop]; // Dont submit internal data to backend
			}
		}

		return snapshot;
	}
	validate() {
		const errors = [];
		if (!this.geography) {
			errors.push(
				i18n.t(
					'The drawn polygon does not have any points, and at least three are required'
				)
			);
		} else {
			if (this.geography.coordinates[0].length <= 2) {
				errors.push(
					i18n.t(
						'The drawn polygon does not have any points, and at least three are required'
					)
				);
			}
			if (this.min_altitude >= this.max_altitude) {
				errors.push(
					i18n.t(
						'An UVR MUST NOT have a minimum altitude higher than its maximum altitude'
					)
				);
			}
			const validation = this._schema.validate(this, {
				abortEarly: false,
				allowUnknown: true
			});
			if (validation.error) errors.push(validation.error);
		}
		return errors;
	}
}

const transformRFV = (data: any) => {
	return { rfvs: data.rfvs.map((rfv: any) => new RfvEntity(rfv)), count: data.count };
};

export const getRfvAPIClient = (api: string, token: string | null) => {
	const axiosInstance = Axios.create({
		baseURL: api,
		timeout: 5000,
		headers: { 'Content-Type': 'application/json' }
	});

	return {
		deleteRfv(id: string) {
			return axiosInstance.delete(`/restrictedflightvolume/${id}`, {
				headers: { auth: token }
			});
		},
		getRfvs(
			take: number,
			skip: number,
			orderBy: string,
			order: string,
			filterBy: string,
			filter?: string
		) {
			return axiosInstance.get('restrictedflightvolume', {
				params: buildParametersObject(take, skip, orderBy, order, filterBy, filter),
				headers: { auth: token },
				transformResponse: (
					Axios.defaults.transformResponse as AxiosResponseTransformer[]
				).concat(transformRFV)
			});
		},
		getRfv(id: string) {
			return axiosInstance.get('restrictedflightvolume', {
				params: buildParametersObject(1, 0, 'id', 'ASC', 'id', id),
				headers: { auth: token },
				transformResponse: (
					Axios.defaults.transformResponse as AxiosResponseTransformer[]
				).concat(transformRFV)
			});
		},
		saveRfv(rfv: RfvEntity) {
			const errors = rfv.validate();
			if (errors.length > 0) return Promise.reject(errors);
			return axiosInstance.post('restrictedflightvolume', rfv.asBackendFormat, {
				headers: { auth: token }
			});
		}
	};
};
