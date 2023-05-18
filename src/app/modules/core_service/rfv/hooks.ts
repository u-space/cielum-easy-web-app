// Hooks

import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useCoreServiceAPI, useQueryString } from '../../../utils';
import { RfvEntity } from '@utm-entities/rfv';
import { AxiosError, AxiosResponse } from 'axios';
import { shallow } from 'zustand/shallow';
import { useRfvStore } from './store';
import { useEffect, useMemo } from 'react';
import { OperationEntity } from '@utm-entities/operation';

export function useDeleteRfv() {
	const queryClient = useQueryClient();
	const {
		rfv: { deleteRfv }
	} = useCoreServiceAPI();
	return useMutation<AxiosResponse<void>, AxiosError, RfvEntity>(
		(rfv) => deleteRfv(rfv.id || ''),
		{
			onSuccess: () => {
				// Invalidate and refetch
				queryClient.invalidateQueries('rfvs');
			}
		}
	);
}

export function useUpdateRfv(onSuccess?: () => void, onError?: (error: Error) => void) {
	const queryClient = useQueryClient();

	const {
		rfv: { saveRfv }
	} = useCoreServiceAPI();

	// return useMutation((rfv) => deleteRfv(rfv.id, token), {
	// 	onSuccess: () => {
	// 		// Invalidate and refetch
	// 		queryClient.invalidateQueries('rfvs');
	// 	}
	// });

	return useMutation<AxiosResponse<void>, AxiosError, { entity: RfvEntity }>(
		({ entity: rfv }) => saveRfv(rfv),
		{
			onSuccess: () => {
				// Invalidate and refetch
				queryClient.invalidateQueries('rfvs').then(() => {
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

export function useQueryRfv(id: string, enabled: boolean) {
	const {
		rfv: { getRfv }
	} = useCoreServiceAPI();

	return useQuery<AxiosResponse<RfvEntity>>(['rfv', id], () => getRfv(id), {
		enabled
	});
}

export function useQueryRfvs(all = false) {
	const {
		rfv: { getRfvs }
	} = useCoreServiceAPI();

	const {
		pageSkip,
		pageTake,
		sortingProperty,
		sortingOrder,
		filterProperty,
		filterMatchingText
	} = useRfvStore(
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
			'rfvs',
			pageSkip,
			pageTake,
			sortingProperty,
			sortingOrder,
			filterProperty,
			filterMatchingText
		],
		() =>
			getRfvs(
				all ? 199 : pageTake,
				all ? 0 : pageSkip,
				sortingProperty,
				sortingOrder,
				filterProperty,
				filterMatchingText
			),
		{ keepPreviousData: true }
	);
	const {
		isLoading: isLoadingRfvs,
		isSuccess: isSuccessRfvs,
		isError: isErrorRfvs,
		data: responseRfvs,
		isPreviousData: isPreviousDataRfvs,
		error: errorRfvs
	} = query;

	const rfvs = useMemo(() => {
		if (responseRfvs?.data?.rfvs) {
			return responseRfvs.data.rfvs;
		} else {
			return [];
		}
	}, [responseRfvs]);

	const dataRfvs = isSuccessRfvs ? responseRfvs.data : null;
	const count = dataRfvs ? dataRfvs.count : 0;

	return {
		...query,
		rfvs,
		count,
		/* DEPRECATED */
		countRfvs: count,
		/* DEPRECATED */
		isLoadingRfvs,
		/* DEPRECATED */
		isPreviousDataRfvs,
		/* DEPRECATED */
		isSuccessRfvs,
		/* DEPRECATED */
		isErrorRfvs,
		/* DEPRECATED */
		errorRfvs
	};
}

export function useSelectedRfv() {
	const queryString = useQueryString();
	const idRfv = queryString.get('rfv');

	const {
		rfv: { getRfvs }
	} = useCoreServiceAPI();

	const query = useQuery(['rfv', idRfv], () => getRfvs(1, 0, '', 'ASC', 'id', idRfv || ''), {
		enabled: false
	});

	const { refetch } = query;

	useEffect(() => {
		if (idRfv) {
			refetch().then(() => {
				return;
			});
		}
	}, [refetch, idRfv]);

	const selected = useMemo(() => ({ rfv: idRfv }), [idRfv]);

	const rfv = useMemo(() => {
		if (query.data?.data?.rfvs && query.data.data.rfvs.length > 0) {
			return query.data.data.rfvs[0];
		} else {
			return null;
		}
	}, [query]);

	return { rfv, selected, query };
}

export default useQueryRfvs;
