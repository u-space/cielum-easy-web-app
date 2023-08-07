/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { makeAutoObservable } from 'mobx';
import Axios from 'axios';
import Joi from 'joi';
import { GeographicalZone } from './geographicalZone';
import _ from 'lodash';
import { buildFilterAndOrderParametersObject } from './_util';
import { EntityHasDisplayName } from './types';

type ManualProcedure = {
	id?: string;
	text_description: string;
	procedure_url: string;
	template_url: string;
	[key: string]: string | undefined;
};

type AutomaticProcedure = {
	id?: string;
	email: string;
	template_html: string;
	[key: string]: string | undefined;
};

export class CoordinatorEntity implements EntityHasDisplayName {
	id?: string;
	infrastructure: string;
	liaison: string;
	type: string;
	telephone?: string;
	email?: string;
	minimun_coordination_days: number;
	price?: number;
	discount_Multiple_Dates?: number;
	geographical_zone?: Partial<GeographicalZone> | string | null;
	manual_coordinator_procedure?: ManualProcedure | null;
	automatic_coordinator_procedure?: AutomaticProcedure | null;

	[key: string]: CoordinatorEntity[keyof CoordinatorEntity];

	constructor(coordinator: Partial<CoordinatorEntity>) {
		const {
			type,
			liaison,
			infrastructure,
			id,
			telephone = '',
			email = '',
			minimun_coordination_days = 0,
			price = 0,
			discount_Multiple_Dates = 0,
			geographical_zone = null,
			manual_coordinator_procedure = {
				text_description: '',
				procedure_url: '',
				template_url: ''
			},
			automatic_coordinator_procedure = null
		} = coordinator;
		this.id = id || undefined;
		this.infrastructure = infrastructure || '';
		this.liaison = liaison || '';
		this.type = type || '';
		this.telephone = telephone;
		this.email = email;
		this.minimun_coordination_days = Number(minimun_coordination_days);
		this.price = Number(price);
		this.discount_Multiple_Dates = Number(discount_Multiple_Dates);
		this.geographical_zone = geographical_zone;
		this.automatic_coordinator_procedure = automatic_coordinator_procedure;
		this.manual_coordinator_procedure = manual_coordinator_procedure;
		makeAutoObservable(this);
	}

	set(prop: keyof CoordinatorEntity, value: CoordinatorEntity[keyof CoordinatorEntity]) {
		if (prop === 'displayName') throw new Error('Cannot set displayName');
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		this[prop] = value;
	}

	get displayName() {
		return this.infrastructure;
	}

	static createFromGeozone(data: any, _includesGeozone = true): CoordinatorEntity {
		return new CoordinatorEntity(data);
	}

	static newAutomaticProcedure(): AutomaticProcedure {
		return {
			email: '',
			template_html: ''
		};
	}

	static newManualProcedure(): ManualProcedure {
		return {
			text_description: '',
			procedure_url: '',
			template_url: ''
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

const transformCoordinators = (data: any) => {
	return {
		coordinators: data.coordinators.map((gz: any) => new CoordinatorEntity(gz)),
		count: data.count
	};
};

export const getCoordinatorAPIClient = (api: string, token: string | null) => {
	const axiosInstance = Axios.create({
		baseURL: api,
		timeout: 5000,
		headers: { 'Content-Type': 'application/json' }
	});

	return {
		getCoordinators(
			take: number,
			skip: number,
			orderBy: string,
			order: string,
			filterBy: string,
			filter?: string
		) {
			return axiosInstance.get('coordinator', {
				params: buildFilterAndOrderParametersObject(
					take,
					skip,
					orderBy,
					order,
					filterBy,
					filter
				),
				headers: { auth: token },
				transformResponse: [].concat(
					Axios.defaults.transformResponse as any,
					transformCoordinators as any
				)
			});
		},
		saveCoordinator(_coordinator: CoordinatorEntity) {
			const aux = _.cloneDeep(_coordinator);
			if (!aux.geographical_zone) return Promise.reject('Missing geographical zone');
			if (typeof aux.geographical_zone !== 'string') {
				aux.geographical_zone = aux.geographical_zone.id;
			}
			const validation = APICoordinatorSchema.validate(aux, {
				abortEarly: false,
				allowUnknown: true
			});
			const errors: string[] = [];
			if (validation.error) {
				validation.error.details.forEach((error) => {
					errors.push(error.message);
				});
				return Promise.reject(errors);
			}

			return axiosInstance.post('coordinator', aux, {
				headers: { auth: token }
			});
		}
	};
};
