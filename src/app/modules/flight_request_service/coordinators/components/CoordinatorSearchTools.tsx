import { FC } from 'react';
import FilterAndOrderSearchTools from '../../../../commons/components/hubs/FilterAndOrderSearchTools';
import { useCoordinatorStore } from '../store';

const CoordinatorSearchTools: FC = () => {
	return (
		<FilterAndOrderSearchTools
			useStore={useCoordinatorStore}
			entityName={'coordinator'}
			queryableProps={['infrastructure', 'liaison', 'telephone', 'email']}
		/>
	);
};

export default CoordinatorSearchTools;
