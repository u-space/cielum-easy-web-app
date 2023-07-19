import { bbox, lineString } from '@turf/turf';
import _ from 'lodash';
import { makeAutoObservable, toJS } from 'mobx';
import Axios, { AxiosResponseTransformer } from 'axios';
import i18n from 'i18next';
import Joi from 'joi';
import { buildParametersObject } from './_util';
import { APIVertiportSchema, Vertiport } from './vertiport';
import { OperationEntity } from './operation';
import { EntityHasDisplayName } from './types';
import {
	APIThreeDimensionalPointSchema,
	ThreeDimensionalPoint
} from './legacy_map_do_not_use/entities/ThreeDimensionalPoint';

export class RegularFlightSegment implements Record<string, number | any> {
	start: ThreeDimensionalPoint;
	end: ThreeDimensionalPoint;
	horizontalBuffer: number;
	verticalBuffer: number;
	timeBuffer: number;
	groundSpeed: number;

	constructor(
		start: ThreeDimensionalPoint,
		end: ThreeDimensionalPoint,
		horizontalBuffer: number,
		verticalBuffer: number,
		timeBuffer: number,
		groundSpeed: number
	) {
		this.start = start;
		this.end = end;
		this.horizontalBuffer = horizontalBuffer;
		this.verticalBuffer = verticalBuffer;
		this.timeBuffer = timeBuffer;
		this.groundSpeed = groundSpeed;
		makeAutoObservable(this);
	}

	get asBackendFormat() {
		const copy: any = toJS(this);

		copy.start = this.start.asBackendFormat;
		copy.end = this.end.asBackendFormat;

		return copy;
	}

	// eslint-disable-next-line
	[x: string]: any;
}

export enum SegmentPointType {
	Start,
	End
}

type NullableVertiport = Vertiport | null;

export class RegularFlightEntity implements EntityHasDisplayName {
	id?: string;
	startingPort: NullableVertiport;
	endingPort: NullableVertiport;
	verticalSpeed: number;
	name: string;
	path: Array<RegularFlightSegment>;
	private firstPoint: ThreeDimensionalPoint | null;

	validate() {
		const errors = [];
		if (this.path.length < 1) {
			errors.push(
				i18n.t(
					'There is no segment associated with the regular flight, and at least one is required'
				)
			);
		}
		const validation = Joi.object({
			startingPort: APIVertiportSchema.required(),
			endingPort: APIVertiportSchema.required(),
			name: Joi.string().required(),
			verticalSpeed: Joi.number().required()
		}).validate(this, {
			abortEarly: true,
			allowUnknown: true
		});
		if (validation.error) errors.push(validation.error);
		return errors;
	}

	constructor(
		id: string | undefined,
		startingPort: NullableVertiport,
		endingPort: NullableVertiport,
		verticalSpeed: number,
		name: string,
		path: Array<RegularFlightSegment>
	) {
		this.id = id;
		this.startingPort = startingPort;
		this.endingPort = endingPort;
		this.verticalSpeed = verticalSpeed;
		this.name = name;
		this.path = path ?? [];
		this.firstPoint = null;
		makeAutoObservable(this);
	}

	get displayName() {
		return this.name;
	}

	find(segmentIndex: number, point: SegmentPointType) {
		return point === SegmentPointType.End
			? this.path[segmentIndex].end
			: this.path[segmentIndex].start;
	}

	get firstPointOrFirstPointInFirstSegment() {
		return this.firstPoint;
	}

	get firstPointNoSegments() {
		if (this.length === 0) {
			return this.firstPoint;
		} else {
			return null;
		}
	}

	get bbox() {
		if (this.length > 0 && this.lastPoint) {
			return bbox(
				lineString([
					...this.path.map((segment) => [segment.start.lng, segment.start.lat]),
					[this.lastPoint.lng, this.lastPoint.lat]
				])
			);
		} else {
			return [0, 0, -1, -1];
		}
	}

	get length() {
		return this.path.length;
	}

	get lastPoint() {
		return this.length > 0 ? this.path[this.path.length - 1].end : null;
	}

	get asBackendFormat() {
		const snapshot: any = _.cloneDeep(this);

		for (const prop in snapshot) {
			if (prop[0] === '_') {
				delete snapshot[prop]; // Dont submit internal data to backend
			}
		}

		snapshot.startingPort = { id: snapshot.startingPort.id };
		snapshot.endingPort = { id: snapshot.endingPort.id };

		snapshot.path = this.path.map((segment: RegularFlightSegment) => {
			return segment.asBackendFormat;
		});

		delete snapshot.firstPoint;

		return snapshot;
	}

	addPoint(
		point: ThreeDimensionalPoint,
		horizontalBuffer?: number,
		verticalBuffer?: number,
		timeBuffer?: number,
		groundSpeed?: number
	) {
		if (this.length > 0 && this.lastPoint) {
			this.path.push(
				new RegularFlightSegment(
					ThreeDimensionalPoint.createFrom(this.lastPoint),
					point,
					horizontalBuffer ?? 100,
					verticalBuffer ?? 100,
					timeBuffer ?? 60,
					groundSpeed ?? 1
				)
			);
		} else {
			if (this.firstPoint) {
				this.path.push(
					new RegularFlightSegment(
						ThreeDimensionalPoint.createFrom(this.firstPoint),
						point,
						horizontalBuffer ?? 100,
						verticalBuffer ?? 100,
						timeBuffer ?? 60,
						groundSpeed ?? 1
					)
				);
			} else {
				this.firstPoint = point;
			}
		}
	}

	editPoint(segmentIndex: number, point: SegmentPointType, newPointData: ThreeDimensionalPoint) {
		// positionIndex = 0 for start, positionIndex = 1 for end;
		if (this.path.length >= 1) {
			if (point === SegmentPointType.End) {
				this.path[segmentIndex].end = newPointData;
				if (segmentIndex < this.path.length - 1) {
					this.path[segmentIndex + 1].start = newPointData;
				}
			} else if (point === SegmentPointType.Start) {
				this.path[segmentIndex].start = newPointData;
				if (segmentIndex > 0) {
					this.path[segmentIndex - 1].end = newPointData;
				} else {
					this.firstPoint = newPointData;
				}
			}
		} else {
			this.firstPoint = newPointData;
		}
	}

	removeVolumePoint(segmentIndex: number, point: SegmentPointType) {
		if (point === SegmentPointType.End) {
			if (segmentIndex < this.path.length - 1) {
				// Need to connect two path
				this.path[segmentIndex + 1] = new RegularFlightSegment(
					this.path[segmentIndex].start,
					this.path[segmentIndex + 1].end,
					this.path[segmentIndex].horizontalBuffer,
					this.path[segmentIndex].verticalBuffer,
					this.path[segmentIndex].timeBuffer,
					this.path[segmentIndex].groundSpeed
				);
			}
			_.pullAt(this.path, segmentIndex);
		} else if (point === SegmentPointType.Start) {
			if (segmentIndex > 0) {
				this.path[segmentIndex - 1] = new RegularFlightSegment(
					this.path[segmentIndex - 1].start,
					this.path[segmentIndex].end,
					this.path[segmentIndex].horizontalBuffer,
					this.path[segmentIndex].verticalBuffer,
					this.path[segmentIndex].timeBuffer,
					this.path[segmentIndex].groundSpeed
				);
			} else {
				this.firstPoint = null;
			}
			_.pullAt(this.path, segmentIndex);
		}
	}

	static createFromAPI(existing: any) {
		if (!existing.path) return null;

		const rfValidation = Joi.object({
			id: Joi.string(),
			name: Joi.string().required(),
			startingPort: APIVertiportSchema.required(),
			endingPort: APIVertiportSchema.required(),
			verticalSpeed: Joi.number().required()
		}).validate(existing, {
			abortEarly: false,
			allowUnknown: true
		});

		if (rfValidation.error) {
			console.error('API Out-of-sync ', rfValidation.error);
			return null;
		}

		const path = existing.path.map((segment: any) => {
			const segmentValidation = Joi.object({
				start: APIThreeDimensionalPointSchema.required(),
				end: APIThreeDimensionalPointSchema.required(),
				horizontalBuffer: Joi.number().required(),
				verticalBuffer: Joi.number().required(),
				timeBuffer: Joi.number().required()
			}).validate(existing.point, {
				abortEarly: false,
				allowUnknown: true
			});

			if (segmentValidation.error) {
				console.error('API Out-of-sync ', segmentValidation.error);
				return null;
			}

			const start = ThreeDimensionalPoint.createFromAPI(segment.start);
			const end = ThreeDimensionalPoint.createFromAPI(segment.end);

			if (!start || !end) return null;

			return new RegularFlightSegment(
				start,
				end,
				segment.horizontalBuffer,
				segment.verticalBuffer,
				segment.timeBuffer,
				segment.groundSpeed
			);
		});
		return new RegularFlightEntity(
			existing.id,
			existing.startingPort,
			existing.endingPort,
			existing.verticalSpeed,
			existing.name,
			path
		);
	}

	// eslint-disable-next-line
	[x: string]: any;
}

// API

const transformRegularFlights = (data: any) => {
	return {
		regularFlights: _.compact(
			data.regularFlights.map((rf: any) => RegularFlightEntity.createFromAPI(rf))
		),
		count: data.count
	};
};

const transformRegularFlight = (data: any) => RegularFlightEntity.createFromAPI(data);

export const getRegularFlightAPIClient = (api: string, token: string) => {
	const axiosInstance = Axios.create({
		baseURL: api,
		timeout: 5000,
		headers: { 'Content-Type': 'application/json' }
	});

	return {
		getRegularFlight(id: string) {
			return axiosInstance.get(`regularFlights/${id}`, {
				headers: { auth: token },
				transformResponse: (
					Axios.defaults.transformResponse as AxiosResponseTransformer[]
				).concat(transformRegularFlight)
			});
		},
		getRegularFlights(
			take: number,
			skip: number,
			orderBy: string,
			order: string,
			filterBy?: string,
			filter?: string
		) {
			return axiosInstance.get('regularFlights', {
				params: buildParametersObject(take, skip, orderBy, order, filterBy, filter),
				headers: { auth: token },
				transformResponse: (
					Axios.defaults.transformResponse as AxiosResponseTransformer[]
				).concat(transformRegularFlights)
			});
		},
		saveRegularFlight(_rf: RegularFlightEntity) {
			const errors = _rf.validate();
			if (errors.length > 0) return Promise.reject(errors);
			const rf = _rf.asBackendFormat;
			delete rf.id;
			return axiosInstance.post('regularFlights', rf, { headers: { auth: token } });
		},
		createOperationFromRegularFlight(
			rf: RegularFlightEntity,
			partial: Partial<OperationEntity>,
			startingTime: Date
		) {
			const newPartial = {
				...partial,
				owner: partial.owner?.username,
				uas_registrations: partial.uas_registrations?.map((uas: any) => uas.uvin)
			};
			const errors = new OperationEntity(partial).validate(true);
			if (errors.length > 0) return Promise.reject(errors);
			const data = {
				...newPartial,
				effective_time_begin: startingTime,
				regular_flight_id: rf.id
			};
			return axiosInstance.post('regularFlights/operation', data, {
				headers: { auth: token }
			});
		}
	};
};

export default RegularFlightEntity;
