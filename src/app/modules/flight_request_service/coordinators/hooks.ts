import { CoordinatorEntity } from '@flight-request-entities/coordinator';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useFlightRequestServiceAPI } from '../../../utils';
import { AxiosError, AxiosResponse } from 'axios';
import { shallow } from 'zustand/shallow';
import { useCoordinatorStore } from './store';

export function useUpdateCoordinator() {
	const queryClient = useQueryClient();

	const {
		coordinator: { saveCoordinator }
	} = useFlightRequestServiceAPI();

	return useMutation<
		AxiosResponse<CoordinatorEntity>,
		AxiosError<{ message?: string }>,
		{ entity: CoordinatorEntity }
	>(({ entity: coordinator }) => saveCoordinator(coordinator), {
		onSuccess: () => {
			// Invalidate and refetch
			queryClient.invalidateQueries('coordinators').then(() => {
				return;
			});
		}
	});
}

export function useQueryCoordinators(all = false) {
	const {
		coordinator: { getCoordinators }
	} = useFlightRequestServiceAPI();

	const {
		pageTake,
		pageSkip,
		sortingProperty,
		sortingOrder,
		filterProperty,
		filterMatchingText
	} = useCoordinatorStore(
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
			'coordinators',
			pageTake,
			pageSkip,
			sortingProperty,
			sortingOrder,
			filterProperty,
			filterMatchingText
		],
		() =>
			getCoordinators(
				all ? 99999 : pageTake,
				all ? 0 : pageSkip,
				sortingProperty,
				sortingOrder,
				filterProperty,
				filterMatchingText
			),
		{ keepPreviousData: true }
	);
	const {
		isLoading: isLoadingCoordinators,
		isSuccess: isSuccessCoordinators,
		isError: isErrorCoordinators,
		data: response,
		error: errorCoordinators,
		isPreviousData: isPreviousDataCoordinators
	} = query;

	const data = isSuccessCoordinators ? response.data : null;
	const coordinators = data ? data.coordinators : [];
	const count = data ? data.count : 0;

	return {
		...query,
		coordinators,
		count,
		/* DEPRECATED */
		isLoadingCoordinators,
		/* DEPRECATED */
		isSuccessCoordinators,
		/* DEPRECATED */
		isErrorCoordinators,
		/* DEPRECATED */
		errorCoordinators,
		/* DEPRECATED */
		isPreviousDataCoordinators
	};
}

export default useQueryCoordinators;
