import { UtmRequestEntity, type UtmResponseEntity } from '../utm-entity';
import { ExtraFields } from '../../extraFields';
import { VehicleAuthorizationStatus, VehicleEntity } from '../../vehicle';
import { Static, Type } from '@sinclair/typebox';
import { NestedUser, ResponseNestedUser } from './user';
import { Value } from '@sinclair/typebox/value';

export const ResponseBaseVehicle = Type.Object({
	uvin: Type.String(),
	manufacturer: Type.String(),
	model: Type.String(),
	registrationNumber: Type.Optional(Type.String()), // TODO: Remove this when this field is removed from backend (duplicates faaNumber)
	vehicleName: Type.String()
});

export type ResponseBaseVehicle = Static<typeof ResponseBaseVehicle>;

export const ResponseVehicle = Type.Composite([
	ResponseBaseVehicle,
	Type.Object({
		date: Type.String(),
		authorized: Type.String(),
		registeredBy: Type.String(),
		faaNumber: Type.String(),
		vehicleName: Type.String(),
		class: Type.String(),
		owner: ResponseNestedUser,
		operators: Type.Array(ResponseNestedUser),
		extra_fields: Type.Any(),
		deletedAt: Type.Optional(Type.String()),
		payload: Type.Array(Type.String())
	})
]);

export type ResponseVehicle = Static<typeof ResponseVehicle>;

export const RequestVehicle = Type.Object({
	uvin: Type.Optional(Type.String()),
	manufacturer: Type.String(),
	model: Type.String(),
	vehicleName: Type.String(),
	faaNumber: Type.String(),
	class: Type.String(),
	owner: Type.String(),
	payload: Type.Array(Type.String()),
	operators: Type.Array(Type.String()),
	extra_fields: Type.Any()
});

export type RequestVehicle = Static<typeof RequestVehicle>;

export class UtmBaseVehicle implements UtmResponseEntity {
	uvin: string;
	manufacturer: string;
	model: string;
	registrationNumber: string | null;
	vehicleName: string;

	static fromVehicleEntity(vehicle: VehicleEntity): UtmBaseVehicle {
		return new UtmBaseVehicle({
			uvin: vehicle.uvin,
			manufacturer: vehicle.manufacturer,
			model: vehicle.model,
			registrationNumber: vehicle.faaNumber,
			vehicleName: vehicle.vehicleName
		});
	}

	constructor(backendVehicle: ResponseBaseVehicle) {
		const validationErrors = Array.from(Value.Errors(ResponseBaseVehicle, backendVehicle));
		if (validationErrors.length > 0) {
			console.error(validationErrors);
			throw new Error(`Backend vehicle does not match expected schema`);
		}
		this.uvin = backendVehicle.uvin;
		this.manufacturer = backendVehicle.manufacturer;
		this.model = backendVehicle.model;
		this.registrationNumber = backendVehicle.registrationNumber ?? null;
		this.vehicleName = backendVehicle.vehicleName;
	}

	get displayName() {
		return this.registrationNumber
			? `${this.vehicleName} (${this.registrationNumber})`
			: `${this.vehicleName} [${this.manufacturer} ${this.model}]`;
	}

	asPrintableEntries(): { property: string; value: string }[] {
		return [];
	}
}

export class UtmVehicle extends UtmBaseVehicle implements UtmResponseEntity {
	date: Date;
	authorized: VehicleAuthorizationStatus;
	registeredBy: string;
	class: string;
	payload: string[];
	operators: NestedUser[];
	extra_fields: ExtraFields;
	deletedAt: Date | null;
	owner: NestedUser;

	constructor(backendVehicle: ResponseVehicle) {
		super(backendVehicle);
		const validationErrors = Array.from(Value.Errors(ResponseVehicle, backendVehicle));
		if (validationErrors.length > 0) {
			console.error(validationErrors);
			throw new Error(`Backend vehicle does not match expected schema`);
		}
		this.date = new Date(backendVehicle.date);
		this.authorized = backendVehicle.authorized as VehicleAuthorizationStatus;
		this.registeredBy = backendVehicle.registeredBy;
		this.registrationNumber = backendVehicle.registrationNumber ?? backendVehicle.faaNumber;
		this.class = backendVehicle.class;
		this.payload = backendVehicle.payload;
		this.operators = backendVehicle.operators.map((operator) => new NestedUser(operator));
		this.extra_fields = backendVehicle.extra_fields;
		this.deletedAt = backendVehicle.deletedAt ? new Date(backendVehicle.deletedAt) : null;
		this.owner = new NestedUser(backendVehicle.owner);
	}

	asPrintableEntries(): { property: string; value: string }[] {
		return [];
	}
}

export class Vehicle implements UtmRequestEntity<RequestVehicle> {
	uvin: string | null;
	manufacturer: string;
	model: string;
	faaNumber: string;
	vehicleName: string;
	class: string;
	payload: string[];
	operators: NestedUser[];
	extra_fields: ExtraFields;
	owner: NestedUser | null;

	constructor() {
		this.uvin = null;
		this.manufacturer = '';
		this.model = '';
		this.faaNumber = '';
		this.vehicleName = '';
		this.class = '';
		this.payload = [];
		this.operators = [];
		this.extra_fields = {};
		this.owner = null;
	}

	get asBackendFormat(): RequestVehicle {
		if (this.owner === null) throw new Error('Vehicle does not have an owner');
		return {
			uvin: this.uvin ?? undefined,
			manufacturer: this.manufacturer,
			model: this.model,
			faaNumber: this.faaNumber,
			vehicleName: this.vehicleName,
			class: this.class,
			payload: this.payload,
			operators: this.operators.map((operator) => operator.username),
			extra_fields: this.extra_fields,
			owner: this.owner.username
		};
	}
}
