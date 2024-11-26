import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useEffect, useMemo } from 'react';
import { useCoreServiceAPI, useQueryString } from '../../../utils';
import { AxiosError, AxiosResponse } from 'axios';
import { UvrEntity } from '@utm-entities/uvr';
import { useUvrStore } from './store';
import { shallow } from 'zustand/shallow';

// Hooks

export function useQueryUvr(id: string, enabled: boolean) {
	const {
		uvr: { getUvr }
	} = useCoreServiceAPI();

	return useQuery<AxiosResponse<UvrEntity>>(['uvr', id], () => getUvr(id), {
		enabled
	});
}

export function useDeleteUvr() {
	const queryClient = useQueryClient();

	const {
		uvr: { deleteUvr }
	} = useCoreServiceAPI();

	return useMutation<AxiosResponse<void>, AxiosError, UvrEntity>(
		(uvr) => deleteUvr(uvr.message_id || ''),
		{
			onSuccess: () => {
				// Invalidate and refetch
				queryClient.invalidateQueries('uvrs').then(() => {
					return;
				});
			}
		}
	);
}

export function useQueryUvrs(all = false, showPast: boolean = false) {
	const {
		uvr: { getUvrs }
	} = useCoreServiceAPI();

	const {
		pageTake,
		pageSkip,
		sortingProperty,
		sortingOrder,
		filterProperty,
		filterMatchingText
	} = useUvrStore(
		(state) => ({
			pageSkip: state.pageSkip,
			pageTake: state.pageTake,
			sortingProperty: state.sortingProperty,
			sortingOrder: state.sortingOrder,
			filterProperty: state.filterProperty,
			filterMatchingText: state.filterMatchingText
		}),
		shallow
	);
	const query = useQuery(
		[
			'uvrs',
			pageTake,
			pageSkip,
			sortingProperty,
			sortingOrder,
			filterProperty,
			filterMatchingText
		],
		() =>
			getUvrs(
				all ? 1999 : pageTake,
				all ? 0 : pageSkip,
				sortingProperty,
				sortingOrder,
				filterProperty,
				filterMatchingText,
				showPast
			),
		{ keepPreviousData: true }
	);
	const {
		isLoading: isLoadingUvrs,
		isSuccess: isSuccessUvrs,
		isError: isErrorUvrs,
		data: responseUvrs,
		isPreviousData: isPreviousDataUvrs,
		error: errorUvrs
	} = query;

	const dataUvrs = isSuccessUvrs ? responseUvrs.data : null;
	const uvrs = isSuccessUvrs ? responseUvrs.data.uvrs : [];
	const count = dataUvrs ? dataUvrs.count : 0;

	return {
		...query,
		uvrs,
		count,
		/* DEPRECATED */
		countUvrs: count,
		/* DEPRECATED */
		dataUvrs,
		/* DEPRECATED */
		isPreviousDataUvrs,
		/* DEPRECATED */
		isLoadingUvrs,
		/* DEPRECATED */
		isSuccessUvrs,
		/* DEPRECATED */
		isErrorUvrs,
		/* DEPRECATED */
		errorUvrs
	};
}

export function useUpdateUvr(onSuccess?: () => void, onError?: (error: Error) => void) {
	const queryClient = useQueryClient();
	const {
		uvr: { saveUvr }
	} = useCoreServiceAPI();
	return useMutation<AxiosResponse<void>, AxiosError<{ message?: string }>, UvrEntity>(
		(uvr) => saveUvr(uvr),
		{
			onSuccess: () => {
				// Invalidate and refetch
				queryClient.invalidateQueries('uvrs').then(() => {
					return;
				});
				if (onSuccess) {
					onSuccess();
				}
			},
			onError: (error) => {
				if (onError) {
					onError(error);
				}
			}
		}
	);
}

export function useSelectedUvr() {
	const queryString = useQueryString();
	const idUvr = queryString.get('uvr');

	const {
		uvr: { getUvrs }
	} = useCoreServiceAPI();

	const query = useQuery(
		['uvr', idUvr],
		() => getUvrs(1, 0, '', 'ASC', 'message_id', idUvr || ''),
		{
			enabled: false
		}
	);

	useEffect(() => {
		if (idUvr) {
			query.refetch().then(() => {
				return;
			});
		}
	}, [idUvr, query]);

	const selected = useMemo(() => ({ uvr: idUvr }), [idUvr]);

	const uvr = useMemo(() => {
		if (query.data?.data?.uvrs && query.data.data.uvrs.length > 0) {
			return query.data.data.uvrs[0];
		} else {
			return null;
		}
	}, [query]);

	return { uvr, selected, query };
}

export default useQueryUvrs;
