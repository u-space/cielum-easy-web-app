import { useQuery } from 'react-query';
import { useCoreServiceAPI } from '../../../utils';

export function useQueryAircraftTypes() {
	const {
		aircraftType: { getAircraftTypes }
	} = useCoreServiceAPI();
	const {
		isLoading: isLoadingAircraftTypes,
		isSuccess: isSuccessAircraftTypes,
		isError: isErrorAircraftTypes,
		data: response,
		error: errorAircraftTypes,
		isPreviousData: isPreviousDataAircraftTypes,
		refetch: refetchAircraftTypes
	} = useQuery(['aircraftTypes'], () => getAircraftTypes());

	const data = isSuccessAircraftTypes ? response.data : null;
	const aircraftTypes = data ? data : [];

	return {
		aircraftTypes,
		isLoadingAircraftTypes,
		isSuccessAircraftTypes,
		isErrorAircraftTypes,
		errorAircraftTypes,
		isPreviousDataAircraftTypes,
		refetchAircraftTypes
	};
}
