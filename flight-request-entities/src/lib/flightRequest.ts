/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { makeAutoObservable } from 'mobx';
import Axios, { AxiosResponseTransformer } from 'axios';
import Joi from 'joi';
import { GeographicalZone } from './geographicalZone';
import { CoordinatorEntity } from './coordinator';
import { VehicleEntity } from '@utm-entities/vehicle';
import { UserEntity } from '@utm-entities/user';
import { buildFilterAndOrderParametersObject } from './_util';
import { EntityHasDisplayName } from './types';
import { CoordinationEntity } from './coordination';
import { OperationVolume, ResponseOperationVolume } from '@utm-entities/v2/model/operation_volume';
import { Operation } from '@utm-entities/v2/model/operation';

export enum FlightRequestState {
	REQUIRE_APPROVAL = 'REQUIRE_APPROVAL',
	PENDING = 'PENDING',
	COMPLETED = 'COMPLETED',
	CANCELLED = 'CANCELLED',
	REJECTED = 'REJECTED',
	PREFLIGHT = 'PREFLIGHT'
}

export enum FlightCategory {
	OPEN = 'OPEN',
	STS_01 = 'STS_01',
	STS_02 = 'STS_02',
	A2 = 'A2',
	A3 = 'A3'
}

export class FlightRequestEntity implements EntityHasDisplayName {
	id?: string;
	name: string;
	volumes: Array<OperationVolume>;
	uavs: Array<VehicleEntity>;
	state?: FlightRequestState;
	operation?: Operation[];
	coordination?: CoordinationEntity[];
	operator?: UserEntity | string | null;
	creator?: UserEntity;
	flight_comments: string;
	urban_flight: boolean;
	parachute_model?: string;
	dji_blocked: boolean;
	dji_controller_number: string;
	dji_email: string;
	paid: boolean;
	flight_category: FlightCategory;
	geographicalZones?: GeographicalZone[] = [];

	[key: string]: FlightRequestEntity[keyof FlightRequestEntity];

	constructor(existing: any = {}) {
		const {
			name = '',
			volumes = [],
			uavs = [],
			state = FlightRequestState.REQUIRE_APPROVAL,
			flight_comments = '',
			urban_flight = false,
			parachute_model = '',
			dji_blocked = false,
			dji_controller_number = '',
			dji_email = '',
			flight_category = FlightCategory.OPEN,
			operator,
			creator,
			operation,
			coordination,
			geographicalZones,
			id,
			paid
		} = existing;

		this.name = name;
		this.id = id;
		this.volumes = volumes.map(
			(volume: ResponseOperationVolume) => new OperationVolume(volume)
		);
		this.uavs = uavs;
		this.state = state;
		this.operation = operation;
		this.coordination = coordination;
		this.operator = operator;
		this.flight_comments = flight_comments;
		this.urban_flight = urban_flight;
		this.parachute_model = parachute_model;
		this.dji_blocked = dji_blocked;
		this.dji_controller_number = dji_controller_number;
		this.dji_email = dji_email;
		this.flight_category = flight_category;
		this.geographicalZones = geographicalZones;
		this.creator = creator;
		this.paid = paid;

		makeAutoObservable(this);
	}

	get displayName() {
		return this.id || '(temp)';
	}

	setGeographicalZones(geographicalZones: GeographicalZone[]) {
		this.geographicalZones = geographicalZones;
	}

	setId(id: string) {
		this.id = id;
	}

	setVolumes(volumes: Array<OperationVolume>) {
		this.volumes = volumes;
	}

	setUavs(uavs: Array<VehicleEntity>) {
		this.uavs = uavs;
	}

	setState(state: FlightRequestState) {
		this.state = state;
	}

	setOperation(operation: Operation[]) {
		this.operation = operation;
	}

	setCoordination(coordination: CoordinationEntity[]) {
		this.coordination = coordination;
	}

	setOperator(operator: UserEntity | string | null) {
		this.operator = operator;
	}

	setFlightComments(flight_comments: string) {
		this.flight_comments = flight_comments;
	}

	setUrbanFlight(urban_flight: boolean) {
		this.urban_flight = urban_flight;
	}

	setParachuteModel(parachute_model: string) {
		this.parachute_model = parachute_model;
	}

	setDjiBlocked(dji_blocked: boolean) {
		this.dji_blocked = dji_blocked;
	}

	setDjiControllerNumber(dji_controller_number: string) {
		this.dji_controller_number = dji_controller_number;
	}

	setDjiEmail(dji_email: string) {
		this.dji_email = dji_email;
	}

	setFlightCategory(flight_category: FlightCategory) {
		this.flight_category = flight_category;
	}

	set(
		property: keyof FlightRequestEntity,
		value: FlightRequestEntity[keyof FlightRequestEntity]
	) {
		if (property === 'displayName') return;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		this[property] = value;
	}

	get asBackendFormat() {
		return {
			...this,
			operator: {
				username:
					typeof this.operator === 'string' ? this.operator : this.operator?.username
			},
			volumes: this.volumes.map((_volume) => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const volume = _volume.asBackendFormat() as any;
				// TODO: Remove this conversions when operation backend is fixed and does not expect strings for numbers
				volume.min_altitude = Number(volume.min_altitude);
				volume.max_altitude = Number(volume.max_altitude);
				volume.ordinal = Number(volume.ordinal);
				return volume;
			})
		};
	}
}

export const APICoordinatorSchema = Joi.object({
	id: Joi.string(),
	liaison: Joi.string().required(),
	type: Joi.string().required(),
	telephone: Joi.string().optional().allow(''),
	email: Joi.string().optional().allow(''),
	minimun_coordination_days: Joi.number().required(),
	price: Joi.number(),
	discount_Multiple_Dates: Joi.number(),
	geographical_zone: Joi.string(),
	manual_coordinator_procedure: Joi.object().allow(null),
	automatic_coordinator_procedure: Joi.object().allow(null)
});

// API

const transformFlightRequests = (data: any) => {
	return {
		count: data.count,
		flightRequests: data.flightRequests.map((flightRequest: any) => {
			return new FlightRequestEntity(flightRequest);
		})
	};
};

export const getFlightRequestAPIClient = (api: string, token: string | null) => {
	const axiosInstance = Axios.create({
		baseURL: api,
		timeout: 120000,
		headers: { 'Content-Type': 'application/json' }
	});

	return {
		async saveFlightRequest(flightRequest: FlightRequestEntity) {
			const { data } = await axiosInstance.post(
				'/flightRequest?includePaymentLink=true',
				flightRequest.asBackendFormat,
				{
					headers: { auth: token }
				}
			);
			return data;
		},
		async saveFlightRequestPostPayment(sessionId: string) {
			return axiosInstance.post(
				'/flightRequest/finalize',
				{ sessionId },
				{
					headers: { auth: token }
				}
			);
		},
		async updateFlightRequest(flightRequest: FlightRequestEntity) {
			// Api ask us to delete the state bacause state change has separated endpoint
			const body = flightRequest.asBackendFormat;
			delete body.state;
			const { data } = await axiosInstance.put(`/flightRequest/${body.id}`, body, {
				headers: { auth: token }
			});
			return data;
		},
		async setFlightRequestState(flightRequestId: string, state: FlightRequestState) {
			const { data } = await axiosInstance.patch(
				`/flightRequest/${flightRequestId}/changeState`,
				{ state },
				{
					headers: { auth: token }
				}
			);
			return data;
		},
		getFlightRequest(id: string) {
			return axiosInstance.get(`flightRequest/${id}`, {
				headers: { auth: token },
				transformResponse: Axios.defaults.transformResponse as AxiosResponseTransformer[]
			});
		},
		getFlightRequests(
			take: number,
			skip: number,
			orderBy: string,
			order: string,
			filterBy?: string,
			filter?: string,
			showPaid?: boolean,
			showNotPaid?: boolean
		) {
			return axiosInstance.get('flightRequest', {
				params: {
					...buildFilterAndOrderParametersObject(
						take,
						skip,
						orderBy,
						order,
						filterBy,
						filter
					),
					paid: showPaid,
					unpaid: showNotPaid
				},
				headers: { auth: token },
				transformResponse: (
					Axios.defaults.transformResponse as AxiosResponseTransformer[]
				).concat(transformFlightRequests)
			});
		}
	};
};
