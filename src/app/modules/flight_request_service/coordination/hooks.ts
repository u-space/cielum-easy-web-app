/* Hooks */

import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useFlightRequestServiceAPI } from '../../../utils';
import { CoordinationEntity } from '@flight-request-entities/coordination';
import { AxiosError, AxiosResponse } from 'axios';
import { useCoordinationStore } from './store';
import { shallow } from 'zustand/shallow';

export function useUpdateCoordination() {
	const queryClient = useQueryClient();

	const {
		coordination: { saveCoordination }
	} = useFlightRequestServiceAPI();

	return useMutation<
		AxiosResponse<CoordinationEntity>,
		AxiosError<{ message?: string }>,
		{ entity: CoordinationEntity }
	>(({ entity: coordination }) => saveCoordination(coordination), {
		onSuccess: () => {
			// Invalidate and refetch
			queryClient.invalidateQueries('coordination').then(() => {
				return;
			});
			window.location.href = `${window.location.href}`;
		}
	});
}

export function useQueryCoordinations() {
	const {
		coordination: { getCoordinations }
	} = useFlightRequestServiceAPI();

	const {
		pageTake,
		pageSkip,
		sortingProperty,
		sortingOrder,
		filterProperty,
		filterMatchingText,
		states,
		filterCoordinatorTypes
	} = useCoordinationStore(
		(state) => ({
			pageTake: state.pageTake,
			pageSkip: state.pageSkip,
			sortingProperty: state.sortingProperty,
			sortingOrder: state.sortingOrder,
			filterProperty: state.filterProperty,
			filterMatchingText: state.filterMatchingText,
			states: Array.from(state.filterShowStates.keys()),
			filterCoordinatorTypes: state.filterCoordinatorTypes
		}),
		shallow
	);

	const query = useQuery(
		[
			'coordinations',
			states,
			filterCoordinatorTypes,
			pageTake,
			pageSkip,
			sortingProperty,
			sortingOrder,
			filterProperty,
			filterMatchingText
		],
		() =>
			getCoordinations(
				states,
				Array.from(filterCoordinatorTypes.entries()).flatMap((f) => (f[1] ? f[0] : [])),
				pageTake,
				pageSkip,
				sortingProperty,
				sortingOrder,
				filterProperty,
				filterMatchingText
			),
		{ keepPreviousData: true }
	);

	const {
		isLoading: isLoadingCoordinations,
		isSuccess: isSuccessCoordinations,
		isError: isErrorCoordinations,
		data: response,
		error: errorCoordinations,
		isPreviousData: isPreviousDataCoordinations,
		refetch
	} = query;
	const data = isSuccessCoordinations ? response.data : null;
	const coordinations = data ? data.coordinations : [];
	const count = data ? data.count : 0;

	return {
		...query,
		coordinations,
		count,
		isLoadingCoordinations,
		isSuccessCoordinations,
		isErrorCoordinations,
		errorCoordinations,
		isPreviousDataCoordinations,
		refetch
	};
}

export default useQueryCoordinations;
