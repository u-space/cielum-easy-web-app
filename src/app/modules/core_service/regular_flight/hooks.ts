import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useCoreServiceAPI } from '../../../utils';
import { shallow } from 'zustand/shallow';
import { useRegularFlightStore } from './store';
import RegularFlightEntity from '@utm-entities/regularFlight';
import { AxiosError, AxiosResponse } from 'axios';

export function useQueryRegularFlight(id: string | null = null) {
	const {
		regularFlight: { getRegularFlight }
	} = useCoreServiceAPI();

	return useQuery(['regularFlight', id], () => getRegularFlight(id || ''), {
		keepPreviousData: true,
		enabled: !!id
	});
}

export function useSaveRegularFlight() {
	const queryClient = useQueryClient();
	const {
		regularFlight: { saveRegularFlight }
	} = useCoreServiceAPI();

	return useMutation<AxiosResponse<void>, AxiosError<{ message?: string }>, RegularFlightEntity>(
		(regularFlight) => saveRegularFlight(regularFlight),
		{
			onSuccess: () => {
				// Invalidate and refetch
				queryClient.invalidateQueries('regularFlights').then();
			}
		}
	);
}

export function useQueryRegularFlights(all = false) {
	const {
		regularFlight: { getRegularFlights }
	} = useCoreServiceAPI();

	const regularFlightStore = useRegularFlightStore(
		(state) => ({
			pageTake: state.pageTake,
			pageSkip: state.pageSkip,
			sortingProperty: state.sortingProperty,
			sortingOrder: state.sortingOrder,
			filterProperty: state.filterProperty,
			filterMatchingText: state.filterMatchingText
		}),
		shallow
	);

	const query = useQuery(
		[
			'regularFlights',
			regularFlightStore.pageTake,
			regularFlightStore.pageSkip,
			regularFlightStore.sortingProperty,
			regularFlightStore.sortingOrder,
			regularFlightStore.filterProperty,
			regularFlightStore.filterMatchingText
		],
		() =>
			getRegularFlights(
				all ? 199 : regularFlightStore.pageTake,
				all ? 0 : regularFlightStore.pageSkip,
				regularFlightStore.sortingProperty,
				regularFlightStore.sortingOrder,
				regularFlightStore.filterProperty,
				regularFlightStore.filterMatchingText
			),
		{ keepPreviousData: true }
	);

	const {
		isLoading: isLoadingRegularFlights,
		isSuccess: isSuccessRegularFlights,
		isError: isErrorRegularFlights,
		data: responseRegularFlights,
		isPreviousData: isPreviousDataRegularFlights,
		error: errorRegularFlights
	} = query;

	const dataRegularFlights = isSuccessRegularFlights ? responseRegularFlights.data : null;
	const regularFlights = isSuccessRegularFlights
		? responseRegularFlights.data.regularFlights
		: [];
	const count = dataRegularFlights ? dataRegularFlights.count : 0;

	return {
		...query,
		regularFlights,
		count,
		/* DEPRECATED: prefer count */
		countRegularFlights: count,
		/* DEPRECATED: prefer regularFlights or data */
		dataRegularFlights,
		/* DEPRECATED: prefer isPreviousData */
		isPreviousDataRegularFlights,
		/* DEPRECATED: prefer isLoading */
		isLoadingRegularFlights,
		/* DEPRECATED: prefer isSuccess */
		isSuccessRegularFlights,
		/* DEPRECATED: prefer isError */
		isErrorRegularFlights,
		/* DEPRECATED: prefer error */
		errorRegularFlights
	};
}
