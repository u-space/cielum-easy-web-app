import { FC } from 'react';
import FilterAndOrderSearchTools from '../../../../commons/components/hubs/FilterAndOrderSearchTools';
import { useUvrStore } from '../store';

const UvrSearchTools: FC = () => {
	return (
		<FilterAndOrderSearchTools
			useStore={useUvrStore}
			entityName={'uvr'}
			searchableProps={['reason']}
			orderableProps={['reason']}
		/>
	);
};

export default UvrSearchTools;
