import { FC } from 'react';
import FilterAndOrderSearchTools from '../../../../commons/components/hubs/FilterAndOrderSearchTools';
import { useTrackerStore } from '../store';

const UvrSearchTools: FC = () => {
	return (
		<FilterAndOrderSearchTools
			useStore={useTrackerStore}
			entityName={'tracker'}
			queryableProps={['hardware_id']}
		/>
	);
};

export default UvrSearchTools;
