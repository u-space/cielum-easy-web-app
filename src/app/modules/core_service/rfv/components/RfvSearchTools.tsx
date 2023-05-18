import { FC } from 'react';
import FilterAndOrderSearchTools from '../../../../commons/components/hubs/FilterAndOrderSearchTools';
import { useRfvStore } from '../store';

const RfvSearchTools: FC = () => {
	return (
		<FilterAndOrderSearchTools
			useStore={useRfvStore}
			entityName={'rfv'}
			queryableProps={['reason']}
		/>
	);
};

export default RfvSearchTools;
