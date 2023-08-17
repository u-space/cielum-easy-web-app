import { useQuery } from 'react-query';
import { useCoreServiceAPI } from '../../../utils';
import _ from 'lodash';
import { PositionEntity } from '@utm-entities/position';
import { Operation } from '@utm-entities/v2/model/operation';

export function useQueryPastPositions(gufi: Operation['gufi'], rangeFrom: Date, rangeTo: Date) {
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
		() => getPastPositions(gufi as string, rangeFrom, rangeTo),
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

export function useSimulatedPositions(gufi: string, uvin: string, lat: number, lng: number) {
	const {
		position: { postSimulatedPosition }
	} = useCoreServiceAPI();
	return useQuery(
		[`simulated-positions`],
		() => {
			const position = new PositionEntity({
				// Get random altitude between 0 and 40
				altitude_gps: Math.floor(Math.random() * 40),
				location: {
					type: 'Point',
					// Generate randomized coordinates around the given lat/lng, with a max distance of 1000m
					coordinates: [
						lat + (Math.random() - 0.5) / 500,
						lng + (Math.random() - 0.5) / 500
					]
				},
				time_sent: new Date(),
				heading: Math.floor(Math.random() * 360) - 180,
				gufi,
				uvin
			});
			return postSimulatedPosition(position);
		},
		{ enabled: false }
	);
}
