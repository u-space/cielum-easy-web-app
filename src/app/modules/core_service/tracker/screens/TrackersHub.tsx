import { CustomCell, GridCell, GridCellKind, TextCell } from '@glideapps/glide-data-grid';
import { useTranslation } from 'react-i18next';
import { UseMutationResult } from 'react-query';
import { useHistory } from 'react-router-dom';
import { TrackerEntity } from '@utm-entities/tracker';
import { useQueryTrackers, useUpdateTracker } from '../hooks';
import GenericHub, { rowHeight } from '../../../../commons/screens/GenericHub';
import { useQueryString } from '../../../../utils';
import { useTrackerStore } from '../store';
import TrackerSearchTools from '../components/TrackerSearchTools';
import ViewAndEditTracker from '../pages/ViewAndEditTracker';
import { observer } from 'mobx-react';

const TrackersHub = () => {
	// Other hooks
	const { t } = useTranslation();
	const history = useHistory();
	const queryString = useQueryString();
	// State

	// Props
	const idSelected = queryString.get('id');
	const columns = [
		{ title: ' ', width: rowHeight * 2 }, // Fixed width
		{ title: t('glossary:tracker.hardware_id'), width: 3 },
		{ title: t('glossary:tracker.vehicle_id'), width: 3 }
	];

	// Backend
	const query = useQueryTrackers();
	const { trackers, count } = query;

	const updateTracker = useUpdateTracker();

	// Handlers
	const onEntitySelected = (tracker: TrackerEntity) =>
		history.replace(tracker ? `/trackers?id=${tracker.hardware_id}` : '/trackers');
	function getData([col, row]: readonly [number, number]): GridCell {
		const tracker = trackers[row];
		if (tracker) {
			let data;
			let kind = GridCellKind.Text;
			if (col === 1) {
				data = tracker.hardware_id;
			} else if (col === 2) {
				data = tracker.vehicle?.asNiceString || '';
			} else if (col === 0) {
				data = '';
				kind = GridCellKind.Custom;
			}
			if (kind === GridCellKind.Text) {
				return {
					kind: GridCellKind.Text,
					data: data,
					displayData: data,
					allowOverlay: false
				} as TextCell;
			} else if (kind === GridCellKind.Custom) {
				return {
					kind: GridCellKind.Custom,
					data: data,
					displayData: data,
					copyData: data,
					allowOverlay: false
				} as CustomCell;
			}
		}
		return {
			kind: GridCellKind.Text,
			data: ' ',
			displayData: ' ',
			allowOverlay: false
		};
	}

	return (
		<GenericHub
			idProperty={'hardware_id'}
			getData={getData}
			entitySearchTools={TrackerSearchTools}
			entityPage={ViewAndEditTracker}
			columns={columns}
			entityName={'tracker'}
			useStore={useTrackerStore}
			entities={trackers}
			onEntitySelected={onEntitySelected}
			idSelected={idSelected}
			updateQuery={updateTracker as UseMutationResult}
			query={{ ...query, count }}
		/>
	);
};

export default observer(TrackersHub);
