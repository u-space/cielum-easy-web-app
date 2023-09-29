import { DocumentEntity } from '@utm-entities/document';
import { useLocalStore } from 'mobx-react';

export interface UseLocalStoreNullable<T> {
	entity: T | null;
	documents?: Map<string, DocumentEntity>;
	setInfo: (prop: keyof T, value: T[keyof T]) => void;
}

export interface UseLocalStoreEntity<T> {
	entity: T;
	documents: Map<string, DocumentEntity>;
	setInfo: (prop: keyof T, value: T[keyof T]) => void;
}

export const useLs = <T>(initial: T) => {
	const ls: UseLocalStoreEntity<T> = useLocalStore(() => ({
		entity: initial,
		documents: new Map(),
		setInfo: (prop: keyof T, value: T[keyof T]) => {
			ls.entity[prop] = value;
		}
	}));
	return ls;
};
