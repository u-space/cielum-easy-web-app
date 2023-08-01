import { Static, Type } from '@sinclair/typebox';
import { NestedUser, ResponseNestedUser } from './user';
import { UtmEntity } from '../utm-entity';
import { Value } from '@sinclair/typebox/value';
import {
	OperationVolume,
	RequestOperationVolume,
	ResponseOperationVolume
} from './operation_volume';

const OperationState = Type.Enum({
	PROPOSED: 'PROPOSED',
	ACCEPTED: 'ACCEPTED',
	NOT_ACCEPTED: 'NOT_ACCEPTED',
	PENDING: 'PENDING',
	ACTIVATED: 'ACTIVATED',
	ROGUE: 'ROGUE',
	CLOSED: 'CLOSED'
});

type OperationState = Static<typeof OperationState>;

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
		update_time: Type.Optional(Type.String()) // Undefined when creating a new operation, defined when updating an existing operation
		// TODO: Add uas_registrations
	},
	{ additionalProperties: false }
);

export type RequestOperation = Static<typeof RequestOperation>;

const ResponseBaseOperation = Type.Object({
	gufi: Type.String(),
	name: Type.String(),
	operation_volumes: Type.Array(ResponseOperationVolume),
	state: OperationState
	// TODO: uas_registrations
});

export type ResponseBaseOperation = Static<typeof ResponseBaseOperation>;

const ResponseOperation = Type.Composite([
	RequestOperation,
	Type.Object({
		gufi: Type.String(),
		submit_time: Type.String(),
		update_time: Type.String(),
		creator: ResponseNestedUser,
		owner: ResponseNestedUser,
		operation_volumes: Type.Array(ResponseOperationVolume)
	})
]);

export type ResponseOperation = Static<typeof ResponseOperation>;

export class BaseOperation {
	// Used for representing public information (i.e. citizen reporting service)
	gufi: string | null;
	name: string;
	operation_volumes: OperationVolume[];
	state: OperationState;

	constructor(backendOperation?: ResponseBaseOperation) {
		if (backendOperation) {
			if (!Value.Check(ResponseBaseOperation, backendOperation)) {
				console.error(Value.Errors(ResponseBaseOperation, backendOperation));
				throw new Error(`Backend operation does not match expected schema`);
			}
			this.gufi = backendOperation.gufi;
			this.name = backendOperation.name;
			this.operation_volumes = backendOperation.operation_volumes.map(
				(operationVolume) => new OperationVolume(operationVolume)
			);
			this.state = backendOperation.state;
		} else {
			// Should not be used directly, as BaseOperations should not be created from the frontend
			// Only by inheriting classes
			this.gufi = null;
			this.name = '';
			this.operation_volumes = [];
			this.state = OperationState.PROPOSED;
		}
	}
}

export class Operation
	extends BaseOperation
	implements UtmEntity<RequestOperation, { omitOwner: boolean }>
{
	contact: string;
	contact_phone: string;
	creator: NestedUser | null;
	owner: NestedUser | null;
	submit_time: Date | null;
	update_time: Date | null;

	constructor(backendOperation?: ResponseOperation) {
		super(backendOperation);
		if (backendOperation) {
			if (!Value.Check(ResponseOperation, backendOperation)) {
				console.error(Value.Errors(ResponseOperation, backendOperation));
				throw new Error(`Backend operation does not match expected schema`);
			}
			this.gufi = backendOperation.gufi;
			this.contact = backendOperation.contact;
			this.contact_phone = backendOperation.contact_phone;
			this.creator = new NestedUser(backendOperation.creator);
			this.name = backendOperation.name;
			this.operation_volumes = backendOperation.operation_volumes.map(
				(volume) => new OperationVolume(volume as ResponseOperationVolume)
			);
			this.owner = new NestedUser(backendOperation.owner);
			this.state = backendOperation.state;
			this.submit_time = new Date(backendOperation.submit_time);
			this.update_time = new Date(backendOperation.update_time);
		} else {
			this.contact = '';
			this.contact_phone = '';
			this.creator = null;
			this.owner = null;
			this.submit_time = null;
			this.update_time = null;
		}
	}

	asBackendFormat(params: { omitOwner: boolean }): RequestOperation {
		const { omitOwner } = params;
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
			state: this.state,
			creator: this.creator.username,
			operation_volumes: this.operation_volumes.map((volume) => volume.asBackendFormat())
		};

		if (this.gufi) requestOperation.gufi = this.gufi;
		if (this.owner) requestOperation.owner = this.owner.username;
		return requestOperation;
	}

	displayName(): string {
		return this.name;
	}
}
