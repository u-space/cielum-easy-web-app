import { CoordinatorEntity } from '@flight-request-entities/coordinator';
import { CustomCell, GridCell, GridCellKind, TextCell } from '@glideapps/glide-data-grid';
import PButton, { PButtonSize, PButtonType } from '@pcomponents/PButton';
import useQueryCoordinators, { useUpdateCoordinator } from '../hooks';
import PTooltip from '@pcomponents/PTooltip';
import GenericHub, { GenericHubProps, rowHeight } from '../../../../commons/screens/GenericHub';
import CoordinatorSearchTools from '../components/CoordinatorSearchTools';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { useQueryString } from '../../../../utils';
import { useAuthIsAdmin } from '../../../auth/store';
import { FC } from 'react';
import ViewAndEditCoordinator from '../pages/ViewAndEditCoordinator';
import { useCoordinatorStore } from '../store';
import { UseMutationResult } from 'react-query';
import { observer } from 'mobx-react';

const ExtraActions: FC<{ data: CoordinatorEntity }> = ({ data }) => {
	const history = useHistory();
	const geographicalZone = data.geographical_zone;
	if (geographicalZone && typeof geographicalZone === 'object') {
		return (
			<PTooltip content={data.geographical_zone ? 'Show on map' : 'No geographical zone'}>
				<PButton
					size={PButtonSize.SMALL}
					icon={'eye-open'}
					variant={PButtonType.SECONDARY}
					disabled={!data.geographical_zone}
					onClick={() => history.replace('/map?geographical-zone=' + geographicalZone.id)}
				/>
			</PTooltip>
		);
	} else {
		return null;
	}
};

const CoordinatorHub = () => {
	// Other hooks
	const { t } = useTranslation();
	const history = useHistory();
	const queryString = useQueryString();

	// State
	const isAdmin = useAuthIsAdmin();

	// Props
	const idSelected = queryString.get('id');
	const columns = [
		{ title: ' ', width: rowHeight * 2 },
		{ title: t('glossary:coordinator.infrastructure'), width: 2 },
		{ title: t('glossary:coordinator.minimun_coordination_days'), width: 2 },
		{ title: t('glossary:coordinator.telephone'), width: 3 },
		{ title: t('glossary:coordinator.email'), width: 3 },
		{ title: t('glossary:coordinator.role_manager'), width: 3 }
	];

	// Backend
	const query = useQueryCoordinators();
	const { coordinators, count } = query;

	const updateCoordinator = useUpdateCoordinator(false);

	// Handlers
	function getData([col, row]: readonly [number, number]): GridCell {
		const coordinator = coordinators[row];
		if (coordinator) {
			let data;
			let kind = GridCellKind.Text;
			if (col === 1) {
				data = coordinator.infrastructure ? coordinator.infrastructure : '';
			} else if (col === 2) {
				data = coordinator.minimun_coordination_days
					? String(coordinator.minimun_coordination_days)
					: '';
			} else if (col === 3) {
				data = coordinator.telephone ? coordinator.telephone : '';
			} else if (col === 4) {
				data = coordinator.email ? coordinator.email : '';
			} else if (col === 5) {
				data = coordinator.role_manager ? coordinator.role_manager : '';
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
	const onEntitySelected = (coordinator: CoordinatorEntity) =>
		history.replace(coordinator ? `/coordinators?id=${coordinator.id}` : '/coordinators');

	// Effects

	// Components

	return (
		<GenericHub<CoordinatorEntity>
			idProperty={'id'}
			extraActions={ExtraActions as GenericHubProps<CoordinatorEntity>['extraActions']}
			getData={getData}
			entitySearchTools={CoordinatorSearchTools}
			entityPage={ViewAndEditCoordinator}
			extraEntityPageProps={{ isAbleToChangeRole: isAdmin }}
			columns={columns}
			entityName={'coordinator'}
			useStore={useCoordinatorStore}
			entities={coordinators}
			onEntitySelected={onEntitySelected}
			idSelected={idSelected}
			updateQuery={updateCoordinator as UseMutationResult}
			query={{ ...query, count }}
			canEdit={() => isAdmin}
		/>
	);
};

export default observer(CoordinatorHub);
