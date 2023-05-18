import { FC } from 'react';
import CardGroup from '../../../../commons/layouts/dashboard/menu/CardGroup';
import FilterAndOrderSearchTools from '../../../../commons/components/hubs/FilterAndOrderSearchTools';
import { useCoordinationStore } from '../store';
import GridCheckboxes from '../../../../commons/layouts/dashboard/menu/GridCheckboxes';
import { CoordinationState } from '@flight-request-entities/coordination';
import shallow from 'zustand/shallow';
import PCoordinatorTypeSelect from '@pcomponents/PCoordinatorTypeSelect';
import { useTranslation } from 'react-i18next';
import { getFeatureOption } from '../../../../utils';

const ExtraCoordinationSearchTools = () => {
	const { t } = useTranslation(['ui', 'glossary']);
	const { setFilterState, filterShowStates, filterCoordinatorTypes, setFilterCoordinatorType } =
		useCoordinationStore(
			(state) => ({
				setFilterState: state.setFilterState,
				filterShowStates: state.filterShowStates,
				filterCoordinatorTypes: state.filterCoordinatorTypes,
				setFilterCoordinatorType: state.setFilterCoordinatorType
			}),
			shallow
		);

	const gridItems = Object.values(CoordinationState).map((state) => ({
		checked: !!filterShowStates.get(state),
		onChange: (check: boolean) => setFilterState(state, check),
		label: t(`glossary:coordination.states.${state}`)
	}));
	return (
		<>
			<CardGroup header="Filter by state">
				<GridCheckboxes gridItems={gridItems} />
			</CardGroup>
			<CardGroup header="Filter by coordinator type">
				<PCoordinatorTypeSelect
					onItemSelect={(item) => {
						setFilterCoordinatorType(item, true);
					}}
					onRemove={(value) => setFilterCoordinatorType(value, false)}
					selected={Object.entries(filterCoordinatorTypes).flatMap(
						// Array of only those filterCoordinatorType that are true
						([key, value]) => (value ? key : [])
					)}
					coordinatorTypes={getFeatureOption('FlightRequests', 'coordinatorTypes')}
				/>
			</CardGroup>
		</>
	);
};
const CoordinationSearchTools: FC = () => {
	return (
		<FilterAndOrderSearchTools
			useStore={useCoordinationStore}
			entityName={'coordination'}
			queryableProps={['reference', 'limit_date']}
			extra={ExtraCoordinationSearchTools}
		/>
	);
};

export default CoordinationSearchTools;
