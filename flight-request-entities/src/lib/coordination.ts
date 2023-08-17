/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { makeAutoObservable } from 'mobx';
import Axios, { AxiosResponseTransformer } from 'axios';
import Joi from 'joi';
import { CoordinatorEntity } from './coordinator';
import { FlightRequestEntity } from './flightRequest';
import { buildFilterAndOrderParametersObject } from './_util';
import { GeographicalZone } from './geographicalZone';
import { EntityHasDisplayName } from './types';

export enum CoordinationState {
	TO_DO = 'TODO',
	REQUESTED = 'REQUESTED',
	APPROVED = 'APPROVED',
	IN_NEED_OF_MODIFICATION = 'IN_NEED_OF_MODIFICATION',
	REJECTED = 'REJECTED',
	SELF_MANAGED = 'SELF_MANAGED'
}

export class CoordinationEntity implements EntityHasDisplayName {
	id?: string;
	reference: string;
	state: CoordinationState;
	limit_date: Date;
	last_state_change_reason: string;
	coordinator: CoordinatorEntity;
	geographical_zone: GeographicalZone;
	flightRequest: FlightRequestEntity;

	constructor(
		reference: string,
		state: CoordinationState,
		limit_date: Date,
		last_state_change_reason: string,
		coordinator: CoordinatorEntity,
		flightRequest: FlightRequestEntity,
		geographical_zone: GeographicalZone,
		id?: string
	) {
		this.id = id;
		this.reference = reference;
		this.state = state;
		this.limit_date = limit_date;
		this.last_state_change_reason = last_state_change_reason;
		this.coordinator = coordinator;
		this.flightRequest = flightRequest;
		this.geographical_zone = geographical_zone;
		makeAutoObservable(this);
	}

	get displayName() {
		return this.reference;
	}
}

export const APICoordinationSchema = Joi.object({
	id: Joi.string(),
	reference: Joi.string(),
	state: Joi.string(),
	limit_date: Joi.date(),
	last_state_change_reason: Joi.string(),
	coordinator: Joi.object(),
	flightRequest: Joi.object()
});

// API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformCoordination = (data: any) => {
	return {
		coordinations: data.coordinations.map(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(coordination: any) =>
				new CoordinationEntity(
					coordination.reference,
					coordination.state,
					coordination.limit_date,
					coordination.last_state_change_reason,
					coordination.coordinator?.id,
					coordination.flightRequest?.id,
					coordination.geographical_zone,
					coordination.id
				)
		),
		count: data.count
	};
};

export const getCoordinationAPIClient = (api: string, token: string | null) => {
	const axiosInstance = Axios.create({
		baseURL: api,
		timeout: 5000,
		headers: { 'Content-Type': 'application/json' }
	});

	return {
		getCoordinations(
			states: CoordinationState[],
			coordinatorTypes: string[],
			take: number,
			skip: number,
			orderBy: string,
			order: string,
			filterBy: string,
			filter?: string
		) {
			const params = buildFilterAndOrderParametersObject(
				take,
				skip,
				orderBy,
				order,
				filterBy,
				filter
			);
			params.states = states;
			params.coordinatorTypes = coordinatorTypes;
			return axiosInstance.get('coordination', {
				params: params,
				headers: { auth: token },
				transformResponse: (
					Axios.defaults.transformResponse as AxiosResponseTransformer[]
				).concat(transformCoordination)
			});
		},
		saveCoordination(coordination: CoordinationEntity) {
			return axiosInstance.post('coordination', coordination, {
				headers: { auth: token }
			});
		}
	};
};
