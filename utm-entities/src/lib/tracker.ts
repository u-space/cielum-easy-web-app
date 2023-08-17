import Axios, { AxiosResponseTransformer } from 'axios';
import Joi from 'joi';
import { makeAutoObservable } from 'mobx';
import { EntityHasDisplayName } from './types';
import { VehicleEntity } from './vehicle';
import { buildParametersObject } from './_util';
import _ from 'lodash';

export class TrackerEntity implements EntityHasDisplayName {
	hardware_id: string;
	uvin: string;
	directory: string | null;
	vehicle: VehicleEntity | null;
	_schema: Joi.ObjectSchema;

	[key: string]: TrackerEntity[keyof TrackerEntity];

	constructor(tracker: Partial<TrackerEntity>) {
		this.hardware_id = '';
		this.uvin = '';
		this.directory = null;
		this.vehicle = null;
		if (tracker) {
			for (const pair of Object.entries(tracker)) {
				const prop = pair[0] as keyof TrackerEntity;
				const value = pair[1];
				if (prop === 'vehicle') {
					this.vehicle = new VehicleEntity(tracker[prop], {});
				} else {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					this[prop] = value;
				}
			}
		}
		this._schema = Joi.object({
			hardware_id: Joi.string().min(5), // TODO: Make this match exactly the length of serial numbers
			vehicle: Joi.object()
		});
		makeAutoObservable(this);
	}

	get displayName() {
		return this.hardware_id;
	}

	get asBackendFormat() {
		const snapshot: Partial<TrackerEntity> = _.cloneDeep(this);
		if (snapshot.vehicle) {
			snapshot.uvin = snapshot.vehicle?.uvin;
			delete snapshot.vehicle;
		}
		return snapshot;
	}

	validate() {
		const errors = [];
		const validation = this._schema.validate(this, {
			abortEarly: false,
			allowUnknown: true
		});

		if (validation.error?.details)
			errors.push(...validation.error.details.map((err) => err.message));
		return errors;
	}
}

function transformTrackers(data: any) {
	return {
		trackers: data.trackers.map((tracker: any) => new TrackerEntity(tracker)),
		count: data.count
	};
}

export const getTrackerAPIClient = (api: string, token: string | null) => {
	const axiosInstance = Axios.create({
		baseURL: api,
		timeout: 5000,
		headers: { 'Content-Type': 'application/json' }
	});
	return {
		saveTracker(tracker: TrackerEntity) {
			const errors = tracker.validate();
			if (errors.length > 0) return Promise.reject(errors);
			return axiosInstance.post('trackers', tracker.asBackendFormat, {
				headers: { auth: token }
			});
		},
		getTrackers(take: number, skip: number, filterBy?: string, filter?: string) {
			return axiosInstance.get('trackers', {
				params: buildParametersObject(take, skip, undefined, undefined, filterBy, filter),
				headers: { auth: token },
				transformResponse: (
					Axios.defaults.transformResponse as AxiosResponseTransformer[]
				).concat(transformTrackers)
			});
		}
	};
};
