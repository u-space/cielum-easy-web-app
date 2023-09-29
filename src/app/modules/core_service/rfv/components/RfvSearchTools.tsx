import { FC } from 'react';
import FilterAndOrderSearchTools from '../../../../commons/components/hubs/FilterAndOrderSearchTools';
import { useRfvStore } from '../store';

const RfvSearchTools: FC = () => {
	return (
		<FilterAndOrderSearchTools
			useStore={useRfvStore}
			entityName={'rfv'}
			searchableProps={['reason']}
			orderableProps={['reason']}
		/>
	);
};

export default RfvSearchTools;
