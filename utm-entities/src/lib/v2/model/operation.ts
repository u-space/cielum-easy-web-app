import { Static, Type } from '@sinclair/typebox';
import { NestedUser, ResponseNestedUser } from './user';
import { UtmEntity } from '../utm-entity';
import { Value } from '@sinclair/typebox/value';
import {
	OperationVolume,
	RequestOperationVolume,
	ResponseOperationVolume
} from './operation_volume';
export const OPERATION_LOCALES_OPTIONS = {
	year: 'numeric' as const,
	month: 'numeric' as const,
	day: 'numeric' as const,
	hour: '2-digit' as const,
	minute: '2-digit' as const
};

export const OperationStateEnum = {
	PROPOSED: 'PROPOSED',
	ACCEPTED: 'ACCEPTED',
	NOT_ACCEPTED: 'NOT_ACCEPTED',
	PENDING: 'PENDING',
	ACTIVATED: 'ACTIVATED',
	ROGUE: 'ROGUE',
	CLOSED: 'CLOSED'
};
export const OperationState = Type.Enum(OperationStateEnum);

export type OperationState = Static<typeof OperationState>;

const RequestOperation = Type.Object(
	{
		gufi: Type.Optional(Type.String()), // Undefined when creating a new operation, defined when updating an existing operation
		name: Type.String(),
		contact: Type.String(),
		contact_phone: Type.String(),
		owner: Type.Optional(Type.String()), // Undefined when creating operation as pilot
		creator: Type.String(),
		operation_volumes: Type.Array(RequestOperationVolume),
		state: OperationState,
		submit_time: Type.Optional(Type.String()), // Undefined when creating a new operation, defined when updating an existing operation
		update_time: Type.Optional(Type.String()), // Undefined when creating a new operation, defined when updating an existing operation
		// TODO: Add uas_registrations
		uas_registrations: Type.Array(Type.String())
	},
	{ additionalProperties: false }
);

export type RequestOperation = Static<typeof RequestOperation>;

const ResponseBaseOperation = Type.Object({
	gufi: Type.String(),
	name: Type.String(),
	contact: Type.String(),
	contact_phone: Type.String(),
	operation_volumes: Type.Array(ResponseOperationVolume),
	state: OperationState
	// TODO: uas_registrations
});

export type ResponseBaseOperation = Static<typeof ResponseBaseOperation>;

const ResponseOperation = Type.Composite([
	ResponseBaseOperation,
	Type.Object({
		gufi: Type.String(),
		submit_time: Type.String(),
		update_time: Type.String(),
		creator: ResponseNestedUser,
		owner: ResponseNestedUser,
		operation_volumes: Type.Array(ResponseOperationVolume),
		flight_comments: Type.Optional(Type.String())
	})
]);

export type ResponseOperation = Static<typeof ResponseOperation>;

export class BaseOperation {
	// Used for representing public information (i.e. citizen reporting service)
	gufi: string | null;
	name: string;
	operation_volumes: OperationVolume[];
	state: OperationState;
	contact: string; // TODO: backend should prioritize privacy of users, so this shouldn't be sent.
	contact_phone: string;

	constructor(backendOperation?: ResponseBaseOperation) {
		if (backendOperation) {
			if (!Value.Check(ResponseBaseOperation, backendOperation)) {
				console.error(Array.from(Value.Errors(ResponseBaseOperation, backendOperation)));
				throw new Error(`Backend operation does not match expected schema`);
			}
			this.gufi = backendOperation.gufi;
			this.name = backendOperation.name;
			this.contact = backendOperation.contact;
			this.contact_phone = backendOperation.contact_phone;
			this.operation_volumes = backendOperation.operation_volumes.map(
				(operationVolume) => new OperationVolume(operationVolume)
			);
			this.state = backendOperation.state;
		} else {
			// Should not be used directly, as BaseOperations should not be created from the frontend
			// Only by inheriting classes
			this.gufi = null;
			this.name = '';
			this.contact = '';
			this.contact_phone = '';
			this.operation_volumes = [];
			this.state = OperationState.PROPOSED;
		}
	}

	get begin() {
		if (this.operation_volumes.length === 0) return null;
		return this.operation_volumes[0].effective_time_begin;
	}

	get end() {
		if (this.operation_volumes.length === 0) return null;
		return this.operation_volumes[this.operation_volumes.length - 1].effective_time_end;
	}
}

export class Operation
	extends BaseOperation
	implements UtmEntity<RequestOperation, { omitOwner: boolean }>
{
	creator: NestedUser | null;
	owner: NestedUser | null;
	submit_time: Date | null;
	update_time: Date | null;
	flight_comments?: string;
	uas_registrations: string[];

	constructor(backendOperation?: ResponseOperation) {
		super(backendOperation);
		if (backendOperation) {
			if (!Value.Check(ResponseOperation, backendOperation)) {
				console.error(
					ResponseOperation,
					Array.from(Value.Errors(ResponseOperation, backendOperation))
				);
				throw new Error(`Backend operation does not match expected schema`);
			}
			this.creator = new NestedUser(backendOperation.creator);
			this.owner = new NestedUser(backendOperation.owner);
			this.submit_time = new Date(backendOperation.submit_time);
			this.update_time = new Date(backendOperation.update_time);
			this.flight_comments = backendOperation.flight_comments;
			this.uas_registrations = []; // TODO add uas_registrations
		} else {
			this.creator = null;
			this.owner = null;
			this.submit_time = null;
			this.update_time = null;
			this.uas_registrations = ['65a072bb-49bb-45a5-bae6-a342cc2e66aa'];
		}
	}

	asBackendFormat(params: { omitOwner: boolean }): RequestOperation {
		const { omitOwner } = params;
		console.log('asBackendFormat', this);
		if (!this.creator) throw new Error(`Operation creator is not set`);
		if (!omitOwner && !this.owner) throw new Error(`Operation owner is not set`);
		if (omitOwner) this.owner = null;
		// TODO: validate uas_registrations
		if (this.name.length === 0 || !/^[a-zA-Z0-9]+$/.test(this.name))
			throw new Error('Operation name must be set and alphanumeric');

		// Validate operation volumes
		for (const volume of this.operation_volumes) {
			if (
				volume.operation_geography &&
				volume.operation_geography.coordinates[0].length <= 2
			) {
				throw new Error(
					'The drawn polygon does not have any points, and at least three are required'
				);
			}
			if (
				volume.effective_time_begin &&
				volume.effective_time_end &&
				volume.effective_time_begin >= volume.effective_time_end
			) {
				throw new Error(
					`Operation volume ${volume.ordinal} has its starting time after its ending time, which is invalid`
				);
			}
		}

		const requestOperation: RequestOperation = {
			name: this.name,
			contact: this.contact,
			contact_phone: this.contact_phone,
			state: 'PROPOSED', // TODO: fix this
			creator: this.creator.username,
			operation_volumes: this.operation_volumes.map((volume) => volume.asBackendFormat()),
			uas_registrations: this.uas_registrations
		};

		if (this.gufi) requestOperation.gufi = this.gufi;
		if (this.owner) requestOperation.owner = this.owner.username;

		if (!Value.Check(RequestOperation, requestOperation)) {
			throw new Error(
				Array.from(Value.Errors(RequestOperation, requestOperation))
					.map((error) => error.message)
					.join('\n')
			);
		}
		return requestOperation;
	}

	set(prop: keyof Operation, value: Operation[keyof Operation]) {
		if (prop === 'begin' || prop === 'end' || prop === 'displayName')
			throw new Error('Cannot set begin or end directly');
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		this[prop] = value;
	}

	get displayName() {
		return this.name;
	}
}
