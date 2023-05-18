import { FC } from 'react';
import { useFlightRequestStore } from '../store';
import FilterAndOrderSearchTools from '../../../../commons/components/hubs/FilterAndOrderSearchTools';

const FlightRequestSearchTools: FC = () => {
	return (
		<FilterAndOrderSearchTools
			useStore={useFlightRequestStore}
			entityName={'flightRequest'}
			queryableProps={['id']}
		/>
	);
};

export default FlightRequestSearchTools;
