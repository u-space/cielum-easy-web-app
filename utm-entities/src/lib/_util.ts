/* eslint-disable @typescript-eslint/no-explicit-any */
import i18n from 'i18next';
import { DocumentEntity } from './document';
// TODO: Improve this typing and function in itself
export function translateErrors(errors: any, entity: any): string[] {
	if (errors instanceof Array) {
		return errors.map((_error) => {
			let error = _error;
			if (_error instanceof Error) error = _error.message;
			const wholeString = i18n.t(error);
			if (wholeString !== error) return wholeString;
			const isNotAllowedToBeEmptyIndex = error.indexOf(' is not allowed to be empty');
			const mustBeOfTypeIndex = error.indexOf(' must be of type ');
			const mustBeAIndex = error.indexOf(' must be a ');
			const lengthMustBeIndex = error.indexOf(' length must be at least ');
			const extraFieldIsRequiredIndex = error.indexOf(
				' is required, but no value was supplied'
			);
			const isRequiredIndex = error.indexOf(' is required');
			if (isNotAllowedToBeEmptyIndex > -1) {
				const prop = error.slice(1, isNotAllowedToBeEmptyIndex - 1);
				return i18n.t('x is not allowed to be empty', {
					x: i18n.t(`glossary:${entity}:${prop}`)
				});
			} else if (mustBeOfTypeIndex > -1) {
				const prop = error.slice(1, mustBeOfTypeIndex - 1);
				const type = error.slice(mustBeOfTypeIndex + ' must be of type '.length);
				return i18n.t('x must be of type y', {
					x: i18n.t(`glossary:${entity}:${prop}`),
					y: i18n.t(type)
				});
			} else if (mustBeAIndex > -1) {
				const prop = error.slice(1, mustBeAIndex - 1);
				const type = error.slice(mustBeAIndex + ' must be a '.length);
				return i18n.t('x must be of type y', {
					x: i18n.t(`glossary:${entity}:${prop}`),
					y: i18n.t(type)
				});
			} else if (lengthMustBeIndex > -1) {
				const prop = error.slice(1, lengthMustBeIndex - 1);
				const lengthIndex = lengthMustBeIndex + ' length must be at least '.length;
				const type = error.slice(lengthIndex, lengthIndex + 1);
				return i18n.t('The field x must have at least y characters', {
					x: i18n.t(`glossary:${entity}:${prop}`),
					y: i18n.t(type)
				});
			} else if (extraFieldIsRequiredIndex > -1) {
				const prop = error.slice(
					'"value" failed custom validation because '.length,
					extraFieldIsRequiredIndex
				);
				return i18n.t('The field x must not be left empty', {
					x: i18n.t(`glossary:${entity}:${prop}`)
				});
			} else if (isRequiredIndex > -1) {
				const prop = error.slice(1, isRequiredIndex - 1);
				return i18n.t('The field x must not be left empty', {
					x: i18n.t(`glossary:${entity}:${prop}`)
				});
			} else {
				return i18n.t(error);
			}
		});
	} else if (errors instanceof Error) {
		// Errors is not an array
		return processBackendError(errors);
	} else {
		return [i18n.t('unknown')];
	}
}

export function processBackendError(error: any) {
	if (error?.response?.data?.message) {
		// Error might have only item, or multiple items comma separated
		return error.response.data.message.split(',') || [error?.response?.data?.message];
	} else {
		return error?.message ? [error.message] : ['unknown'];
	}
}
export function processErrors(query: any) {
	let errors = [];
	if (query.error) {
		if (query.error?.response?.data?.message) {
			// Error might have only item, or multiple items comma separated
			errors = query.error.response.data.message.split(',') || [
				query.error?.response?.data?.message
			];
		} else {
			errors = query.error?.message ? [query.error.message] : ['unknown'];
		}
	}
	return errors;
}

export const AdesRole = {
	PILOT: 'PILOT',
	ADMIN: 'ADMIN',
	MONITOR: 'MONITOR',
	GUEST: 'guest',
	NOTLOGGED: 'NOTLOGGED'
};

export function saveExtraFields(entity: any, schema: any, current: any) {
	for (const subprop in entity.extra_fields) {
		if (subprop !== 'documents') {
			const value = entity.extra_fields[subprop];
			if (schema) {
				if (schema[subprop]?.type === 'Date') {
					current.extra_fields[subprop] = new Date(value);
				} else {
					current.extra_fields[subprop] = value;
				}
			}
		}
	}
	if (entity.extra_fields?.documents) {
		current.extra_fields.documents = entity.extra_fields.documents.map((doc: any) => {
			return new DocumentEntity(doc);
		});
	}
}
export function buildParametersObject(
	take: any,
	skip: any,
	orderBy: any,
	order: any,
	filterBy: any,
	filter: any
) {
	const parameters = { take, skip } as any;
	if (orderBy && order) {
		parameters.order = order;
		parameters.orderBy = orderBy;
	}
	if (filterBy && filter) {
		parameters.filterBy = filterBy;
		parameters.filter = filter;
	}
	return parameters;
}

export interface FilteringParameters {
	take?: number;
	skip?: number;
	orderBy?: string;
	order?: string;
	filterBy?: string;
	filter?: string;
}
