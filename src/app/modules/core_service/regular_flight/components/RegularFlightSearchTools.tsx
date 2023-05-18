import { FC } from 'react';
import FilterAndOrderSearchTools from '../../../../commons/components/hubs/FilterAndOrderSearchTools';
import { useRegularFlightStore } from '../store';

const RegularFlightSearchTools: FC = () => {
	return (
		<FilterAndOrderSearchTools
			useStore={useRegularFlightStore}
			entityName={'regularflight'}
			queryableProps={['name']}
		/>
	);
};

export default RegularFlightSearchTools;
