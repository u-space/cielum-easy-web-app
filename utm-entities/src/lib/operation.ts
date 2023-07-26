/* eslint-disable @typescript-eslint/no-explicit-any */
import Axios, { AxiosResponseTransformer } from 'axios';
import i18n from 'i18next';
import Joi, { ValidationError } from 'joi';
import _ from 'lodash';
import { makeAutoObservable, observable } from 'mobx';
import { UserEntity } from './user';
import { VehicleEntity } from './vehicle';
import { AdesRole, FilteringParameters } from './_util';
import { Geometry, Point, Polygon } from 'geojson';

export const OPERATION_LOCALES_OPTIONS = {
	year: 'numeric' as const,
	month: 'numeric' as const,
	day: 'numeric' as const,
	hour: '2-digit' as const,
	minute: '2-digit' as const
};

interface Subscriber {
	name?: string;
	timeZone?: string;
	mobile?: string;
	email?: string;
}

export class OperationVolume {
	ordinal: number;
	near_structure: boolean;
	effective_time_begin: Date | null;
	effective_time_end: Date | null;
	min_altitude: number;
	max_altitude: number;
	beyond_visual_line_of_sight: boolean;
	operation_geography: Polygon | null;

	[key: string]: OperationVolume[keyof OperationVolume];

	constructor(ordinal: number) {
		this.ordinal = ordinal;
		this.near_structure = false;
		this.effective_time_begin = new Date();
		this.effective_time_end = new Date();
		this.min_altitude = 0;
		this.max_altitude = 120;
		this.beyond_visual_line_of_sight = false;
		// Sample empty polygon
		this.operation_geography = null;
		makeAutoObservable(this);
	}

	set(prop: string, value: OperationVolume[keyof OperationVolume]) {
		this[prop] = value;
	}
	get(prop: keyof OperationVolume) {
		return this[prop];
	}
}

export enum OperationState {
	PROPOSED = 'PROPOSED',
	ACCEPTED = 'ACCEPTED',
	NOT_ACCEPTED = 'NOT_ACCEPTED',
	PENDING = 'PENDING',
	ACTIVATED = 'ACTIVATED',
	ROGUE = 'ROGUE',
	CLOSED = 'CLOSED'
}

export class OperationEntity {
	gufi: string;
	name: string;
	contact: string;
	contact_phone: string;
	aircraft_comments: string;
	flight_comments: string;
	airspace_authorization: string;
	owner: UserEntity | undefined;
	creator: string;
	volumes_description: string;
	discovery_reference: string | null;
	faa_rule: string;
	// Temporal field
	subscribers: Subscriber[] = [];

	operation_volumes: OperationVolume[];
	controller_location: Geometry;

	priority_elements: {
		priority_level: number;
		priority_status: string;
	};

	uas_registrations: VehicleEntity[];
	contingency_plans: [
		{
			contingency_cause: ['ENVIRONMENTAL', 'LOST_NAV'];
			contingency_location_description: 'OPERATOR_UPDATED';
			contingency_polygon: {
				type: 'Polygon';
				coordinates: [
					[
						[-56.15438461303711, -34.905501548851106],
						[-56.15138053894043, -34.90873940129964],
						[-56.14889144897461, -34.907437236859494],
						[-56.15112304687499, -34.9059942737644],
						[-56.15438461303711, -34.905501548851106]
					]
				];
			};
			contingency_response: 'LANDING';
			free_text: 'Texto libre DE prueba';
			loiter_altitude: 30;
			relative_preference: 30;
			relevant_operation_volumes: [1, 0];
			valid_time_begin: '2019-12-11T19:59:10Z';
			valid_time_end: '2019-12-11T20:59:10Z';
		}
	];
	negotiation_agreements: [];
	uss_name: string | null;
	submit_time: Date;
	update_time: Date;
	state: OperationState;
	gcs_location: Point | null;

	_operationSchema: Joi.ObjectSchema;

	[key: string]: any;

	constructor(operation?: Partial<OperationEntity>) {
		this.gufi = '_temp';
		this.name = '';
		this.contact = '';
		this.contact_phone = '';
		this.aircraft_comments = '';
		this.flight_comments = '';
		this.airspace_authorization = '';
		this.owner = undefined;
		this.creator = '';
		this.volumes_description = '';
		this.discovery_reference = null;
		this.faa_rule = '';

		this.operation_volumes = observable([]);
		this.controller_location = {
			type: 'Point',
			coordinates: [-56.15970075130463, -34.9119507320875]
		};
		this.priority_elements = {
			priority_level: 1,
			priority_status: 'EMERGENCY_AIR_AND_GROUND_IMPACT'
		};
		this.uas_registrations = [];
		this.contingency_plans = [
			{
				contingency_cause: ['ENVIRONMENTAL', 'LOST_NAV'],
				contingency_location_description: 'OPERATOR_UPDATED',
				contingency_polygon: {
					type: 'Polygon',
					coordinates: [
						[
							[-56.15438461303711, -34.905501548851106],
							[-56.15138053894043, -34.90873940129964],
							[-56.14889144897461, -34.907437236859494],
							[-56.15112304687499, -34.9059942737644],
							[-56.15438461303711, -34.905501548851106]
						]
					]
				},
				contingency_response: 'LANDING',
				free_text: 'Texto libre DE prueba',
				loiter_altitude: 30,
				relative_preference: 30,
				relevant_operation_volumes: [1, 0],
				valid_time_begin: '2019-12-11T19:59:10Z',
				valid_time_end: '2019-12-11T20:59:10Z'
			}
		];
		this.subscribers = operation?.subscribers || [];
		this.negotiation_agreements = [];
		this.uss_name = null;
		this.submit_time = new Date();
		this.update_time = new Date();
		this.state = OperationState.PROPOSED;
		this.gcs_location = null;

		if (operation) {
			if ((operation as any).union_volume) {
				delete (operation as any).union_volume;
			}
			for (const prop in operation) {
				this[prop] = operation[prop];
			}

			this.owner = new UserEntity(this.owner, {});
			if (operation.submit_time) this.submit_time = new Date(operation.submit_time);
			if (operation.update_time) this.update_time = new Date(operation.update_time);
			//this.creator = operation.creator?.username;
			if (operation.uas_registrations)
				this.uas_registrations = operation.uas_registrations.map((uasr) => {
					const newUasr = _.cloneDeep(uasr);
					newUasr.date = new Date(uasr.date);
					newUasr.operators = uasr.operators.map((user) => user.username);
					return new VehicleEntity(newUasr, {});
				});
			if (operation.operation_volumes)
				this.operation_volumes = observable(
					operation.operation_volumes
						.map((volume: any) => {
							return {
								...volume,
								min_altitude: parseInt(volume.min_altitude),
								max_altitude: parseInt(volume.max_altitude),
								effective_time_begin: new Date(volume.effective_time_begin),
								effective_time_end: new Date(volume.effective_time_end),
								operation_geography: volume.operation_geography
							};
						})
						.sort((a: any, b: any) => {
							return a.ordinal - b.ordinal;
						})
				);
		}

		this._operationSchema = Joi.object({
			gufi: Joi.string(),
			name: Joi.string().required(),
			owner: Joi.alternatives().try(Joi.string(), Joi.object()).optional(),
			contact: Joi.string(),
			contact_phone: Joi.string(),
			//aircraft_comments: Joi.string(),
			flight_comments: Joi.string().allow(''),
			//volumes_description: Joi.string(),
			//airspace_authorization: Joi.string(),
			controller_location: Joi.object(), // GeoJsonPoint
			//gcs_location: Joi.object(), // GeoJsonPoint
			// faa_rule
			subscribers: Joi.array().items(Joi.object()),
			operation_volumes: Joi.array(), // BaseOperationVolume
			uas_registrations: Joi.array().items(Joi.object())
		});

		makeAutoObservable(this);
	}

	set(prop: keyof OperationEntity, value: OperationEntity[keyof OperationEntity]) {
		this[prop] = value;
	}

	get start() {
		return this.operation_volumes[0].effective_time_begin;
	}

	get end() {
		return this.operation_volumes[this.operation_volumes.length - 1].effective_time_end;
	}

	get asBackendFormat() {
		const snapshot: any = _.cloneDeep(this);

		for (const prop in snapshot) {
			if (prop[0] === '_') {
				delete snapshot[prop]; // Dont submit internal data to backend
			}
		}

		snapshot.owner = snapshot.owner?.username || snapshot.owner;
		snapshot.priority_elements = {
			priority_level: 1,
			priority_status: 'EMERGENCY_AIR_AND_GROUND_IMPACT'
		};
		snapshot.contingency_plans = [
			{
				contingency_cause: ['ENVIRONMENTAL', 'LOST_NAV'],
				contingency_location_description: 'OPERATOR_UPDATED',
				contingency_polygon: {
					type: 'Polygon',
					coordinates: [
						[
							[-56.15438461303711, -34.905501548851106],
							[-56.15138053894043, -34.90873940129964],
							[-56.14889144897461, -34.907437236859494],
							[-56.15112304687499, -34.9059942737644],
							[-56.15438461303711, -34.905501548851106]
						]
					]
				},
				contingency_response: 'LANDING',
				free_text: 'Texto libre DE prueba',
				loiter_altitude: 30,
				relative_preference: 30,
				relevant_operation_volumes: [1, 0],
				valid_time_begin: '2019-12-11T19:59:10Z',
				valid_time_end: '2019-12-11T20:59:10Z'
			}
		];
		snapshot.gufi = snapshot.gufi !== '_temp' ? snapshot.gufi : void 0;
		snapshot.negotiation_agreements = [];
		snapshot.uas_registrations = snapshot.uas_registrations.map((uasr: any) => uasr.uvin);
		snapshot.operation_volumes = snapshot.operation_volumes.map((opVolume: any) => {
			return {
				...opVolume,
				effective_time_begin: opVolume.effective_time_begin.toISOString(),
				effective_time_end: opVolume.effective_time_end.toISOString()
				// First and last point same-ness is enforced by the map library
			};
		});

		if (snapshot.submit_time) delete snapshot.submit_time;
		if (snapshot.update_time) delete snapshot.update_time;
		console.log('Save operation', snapshot);
		return snapshot;
	}

	get displayName() {
		return this.name;
	}

	get uasRegistrationCount() {
		return this.uas_registrations.length;
	}
	get hasAnyVolume() {
		return (
			this.operation_volumes.length > 0 &&
			this.operation_volumes[0].operation_geography &&
			this.operation_volumes[0].operation_geography.coordinates.length > 0
		);
	}

	verify(onSuccess: () => void, onError: (error: ValidationError) => void) {
		const result = this._operationSchema.validate(this, {
			abortEarly: false,
			allowUnknown: true
		});
		if (result.error) {
			onError(result.error);
		} else {
			onSuccess();
		}
	}

	validate(skipVolumesValidation = false) {
		const errors = [];
		if (this.uas_registrations.length < 1) {
			errors.push(
				i18n.t(
					'There is no vehicle associated with the operation, and at least one is required'
				)
			);
		}
		if (
			this.name.indexOf('|') !== -1 ||
			this.name.indexOf('<') !== -1 ||
			this.name.indexOf('>') !== -1
		) {
			errors.push(i18n.t('The operation name can only contain alphanumeric characters'));
		}
		if (!skipVolumesValidation) {
			for (const index in this.operation_volumes) {
				const volume = this.operation_volumes[index];
				if (
					volume.operation_geography &&
					volume.operation_geography.coordinates[0].length <= 2
				) {
					errors.push(
						i18n.t(
							'The drawn polygon does not have any points, and at least three are required'
						)
					);
				}
				if (
					volume.effective_time_begin &&
					volume.effective_time_end &&
					volume.effective_time_begin >= volume.effective_time_end
				) {
					errors.push(
						i18n.t(
							'Operation volume X has its starting time after its ending time, which is invalid',
							{ X: index }
						)
					);
				}
			}
		}
		const validation = this._operationSchema.validate(this, {
			abortEarly: false,
			allowUnknown: true
		});
		if (validation.error) errors.push(validation.error);
		return errors;
	}

	isBasic(prop: string) {
		return (
			_.indexOf(
				[
					'gufi',
					'name',
					'state',
					'contact',
					'contact_phone',
					'aircraft_comments',
					'flight_comments'
				],
				prop
			) >= 0
		);
	}
}

export const transformOperations = (data: any) => {
	return {
		ops: data.ops.map((operation: any) => new OperationEntity(operation)),
		count: data.count
	};
};

export const transformOperation = (data: any) => {
	return new OperationEntity(data);
};

// API Calls

interface GetOperationsSpecificParameters {
	states?: string;
	fromDate?: Date;
	toDate?: Date;
}

export interface GetOperationsParsedResponse {
	ops: OperationEntity[];
	count: number;
}
export const getOperationAPIClient = (api: string, token: string) => {
	const axiosInstance = Axios.create({
		baseURL: api,
		timeout: 5000,
		headers: { 'Content-Type': 'application/json' }
	});

	return {
		saveOperation(_operation: OperationEntity, isPilot = false) {
			const errors = _operation.validate();
			if (errors.length > 0) return Promise.reject(errors);
			if (isPilot && _operation.state === 'CLOSED')
				return Promise.reject(["You can't edit a closed operation"]);
			const operation = _operation.asBackendFormat;
			if (isPilot) {
				delete operation.owner;
			}
			return axiosInstance.post('operation', operation, { headers: { auth: token } });
		},
		getOperations(
			role: string,
			_states: string[],
			take: number,
			skip: number,
			orderBy: string,
			order: string,
			filterBy: string,
			filter?: string,
			fromDate?: Date,
			toDate?: Date
		) {
			const parameters: FilteringParameters & GetOperationsSpecificParameters = {};
			if (take) parameters.take = take;
			if (skip) parameters.skip = skip;
			if (orderBy) parameters.orderBy = orderBy;
			if (orderBy && order) parameters.order = order;
			if (filter && filterBy) parameters.filterBy = filterBy;
			if (filter) parameters.filter = filter;
			if (_states) parameters.states = JSON.stringify(_states);
			if (fromDate) parameters.fromDate = fromDate;
			if (toDate) parameters.toDate = toDate;

			if (_states.length === 0) return Promise.resolve({ data: { ops: [], count: 0 } });
			if (role === AdesRole.ADMIN || role === AdesRole.MONITOR) {
				return axiosInstance.get<GetOperationsParsedResponse>('operation', {
					params: parameters,
					headers: { auth: token },
					transformResponse: (
						Axios.defaults.transformResponse as AxiosResponseTransformer[]
					).concat(transformOperations)
				});
			} else {
				return axiosInstance.get<GetOperationsParsedResponse>('operation/owner', {
					params: parameters,
					headers: { auth: token },
					transformResponse: (
						Axios.defaults.transformResponse as AxiosResponseTransformer[]
					).concat(transformOperations)
				});
			}
		},
		getOperation(gufi: string) {
			return axiosInstance.get(`operation/${gufi}`, {
				headers: { auth: token },
				transformResponse: (
					Axios.defaults.transformResponse as AxiosResponseTransformer[]
				).concat(transformOperation)
			});
		},
		deleteOperation(gufi: string) {
			return axiosInstance.delete(`/operation/${gufi}`, { headers: { auth: token } });
		}
	};
};
