import { Static, Type } from '@sinclair/typebox';

export const ResponseNestedUser = Type.Object({
	username: Type.String(),
	firstName: Type.String(),
	lastName: Type.String(),
	email: Type.String(),
	extra_fields_json: Type.Any() // TODO: Backend should return documents separately to extra fields
});

export type ResponseNestedUser = Static<typeof ResponseNestedUser>;

export class NestedUser {
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	extra_fields: {
		[key: string]: string;
	};

	[key: string]: NestedUser[keyof NestedUser];

	constructor(backendNestedUser: ResponseNestedUser) {
		this.username = backendNestedUser.username;
		this.firstName = backendNestedUser.firstName;
		this.lastName = backendNestedUser.lastName;
		this.email = backendNestedUser.email;
		this.extra_fields = backendNestedUser.extra_fields_json;
	}

	displayName(): string {
		return `${this.firstName} ${this.lastName} (${this.username})`;
	}
}
