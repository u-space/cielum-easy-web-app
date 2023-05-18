import { useCoreServiceAPI } from '../../../utils';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useTrackerStore } from './store';
import { shallow } from 'zustand/shallow';
import { AxiosError, AxiosResponse } from 'axios';
import { RfvEntity } from '@utm-entities/rfv';
import { TrackerEntity } from '@utm-entities/tracker';

export function useQueryTrackers() {
	const {
		tracker: { getTrackers }
	} = useCoreServiceAPI();

	const { pageTake, pageSkip, filterProperty, filterMatchingText } = useTrackerStore(
		(state) => ({
			pageTake: state.pageTake,
			pageSkip: state.pageSkip,
			filterProperty: state.filterProperty,
			filterMatchingText: state.filterMatchingText
		}),
		shallow
	);

	const query = useQuery(
		['trackers', pageTake, pageSkip, filterProperty, filterMatchingText],
		() => getTrackers(pageTake, pageSkip, filterProperty, filterMatchingText),
		{ keepPreviousData: true }
	);
	const { isSuccess, data: response } = query;

	const data = isSuccess ? response.data : null;
	const trackers = data ? data.trackers : [];
	const count = data ? data.count : 0;

	return {
		...query,
		trackers,
		count
	};
}

export function useUpdateTracker() {
	const queryClient = useQueryClient();
	const {
		tracker: { saveTracker }
	} = useCoreServiceAPI();
	return useMutation<AxiosResponse<TrackerEntity>, AxiosError, { entity: TrackerEntity }>(
		({ entity: tracker }) => saveTracker(tracker),
		{
			onSuccess: () => {
				// Invalidate and refetch
				queryClient.invalidateQueries('trackers').then();
			}
		}
	);
}
