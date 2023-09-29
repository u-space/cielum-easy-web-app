import { FC } from 'react';
import FilterAndOrderSearchTools from '../../../../commons/components/hubs/FilterAndOrderSearchTools';
import { useTrackerStore } from '../store';

const UvrSearchTools: FC = () => {
	return (
		<FilterAndOrderSearchTools
			useStore={useTrackerStore}
			entityName={'tracker'}
			searchableProps={['hardware_id']}
			orderableProps={['hardware_id']}
		/>
	);
};

export default UvrSearchTools;
