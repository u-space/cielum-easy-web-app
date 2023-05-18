import { OperationEntity } from '@utm-entities/operation';
import { useQuery } from 'react-query';
import { useMemo } from 'react';
import { useCoreServiceAPI } from '../../../utils';
import _ from 'lodash';
import { AxiosResponse } from 'axios';
import { PositionEntity } from '@utm-entities/position';

export function useQueryPastPositions(
	gufi: OperationEntity['gufi'],
	rangeFrom: Date,
	rangeTo: Date
) {
	const {
		position: { getPastPositions }
	} = useCoreServiceAPI();
	const {
		isLoading: isLoadingPositions,
		isSuccess: isSuccessPositions,
		isError: isErrorPositions,
		data: responsePositions,
		error: errorPositions
	} = useQuery(
		['past-positions', gufi, rangeFrom, rangeTo],
		() => getPastPositions(gufi, rangeFrom, rangeTo),
		{ keepPreviousData: true }
	);

	const _positions = isSuccessPositions ? responsePositions.data : [];
	const positions = _.sortBy(_positions, ['time_sent']);

	return { positions, isLoadingPositions, isSuccessPositions, isErrorPositions, errorPositions };
}

// Function that creates a promise that resolves automatically
function autoResolve(): Promise<Map<string, PositionEntity[]>> {
	return new Promise((resolve) => {
		resolve(new Map<string, PositionEntity[]>());
	});
}

export function usePositions() {
	const query = useQuery([`positions`], () => autoResolve(), {
		keepPreviousData: true,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchInterval: false,
		refetchIntervalInBackground: false,
		refetchOnMount: true
	});

	const positions = useMemo(() => {
		if (query.data) {
			return Array.from(query.data.values());
		} else {
			return [];
		}
	}, [query]);

	return { positionsAsArray: positions, positionsAsMap: query.data };
}
