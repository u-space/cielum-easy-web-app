import { FC } from 'react';
import FilterAndOrderSearchTools from '../../../../commons/components/hubs/FilterAndOrderSearchTools';
import { useCoordinatorStore } from '../store';

const CoordinatorSearchTools: FC = () => {
	return (
		<FilterAndOrderSearchTools
			useStore={useCoordinatorStore}
			entityName={'coordinator'}
			searchableProps={['infrastructure', 'liaison', 'telephone', 'email']}
			orderableProps={['infrastructure', 'liaison', 'telephone', 'email']}
		/>
	);
};

export default CoordinatorSearchTools;
