import { useHistory } from 'react-router-dom';
import PTooltip from '@pcomponents/PTooltip';
import { PButtonSize, PButtonType } from '@pcomponents/PButton';
import PButton from '@pcomponents/PButton';
import RegularFlightEntity from '@utm-entities/regularFlight';
import { CustomCell, GridCell, GridCellKind, TextCell } from '@glideapps/glide-data-grid';
import { useQueryRegularFlights, useSaveRegularFlight } from '../hooks';
import GenericHub, { GenericHubProps, rowHeight } from '../../../../commons/screens/GenericHub';
import RegularFlightSearchTools from '../components/RegularFlightSearchTools';
import ViewAndEditRegularFlight from '../pages/ViewAndEditRegularFlight';
import { UseMutationResult } from 'react-query';
import { useRegularFlightStore } from '../store';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryString } from '../../../../utils';

interface ExtraActionsProps {
	data: RegularFlightEntity;
}

const ExtraActions: FC<ExtraActionsProps> = ({ data }) => {
	const { t } = useTranslation();
	const history = useHistory();
	return (
		<>
			<PTooltip content={t('View in map')}>
				<PButton
					size={PButtonSize.SMALL}
					icon="eye-open"
					variant={PButtonType.SECONDARY}
					onClick={() => history.push(`/flights?regularflight=${data.id}`)}
				/>
			</PTooltip>
			<PTooltip content={t('Create operation from this regular flight')}>
				<PButton
					size={PButtonSize.SMALL}
					icon="plus"
					variant={PButtonType.SECONDARY}
					onClick={() =>
						history.push(`/flights?regularflight=${data.id}&creating-op=true`)
					}
				/>
			</PTooltip>
		</>
	);
};

const RegularFlightHub = () => {
	// Other hooks
	const { t } = useTranslation(['glossary', 'ui']);
	const history = useHistory();
	const queryString = useQueryString();

	// State

	// Props
	const idSelected = queryString.get('id');
	const columns = [
		{ title: ' ', width: rowHeight * 3 }, // Fixed width
		{ title: t('glossary:regularflight.name'), width: 3 }, // Ratios
		{ title: t('glossary:regularflight.startingPort'), width: 1 },
		{ title: t('glossary:regularflight.endingPort'), width: 1 }
	];

	// Backend
	const query = useQueryRegularFlights();
	const { regularFlights, count } = query;

	const updateRegularFlight = useSaveRegularFlight();

	// Handlers
	const onEntitySelected = (regularFlight: RegularFlightEntity) =>
		history.replace(
			regularFlight ? `/regularflights?id=${regularFlight.id}` : '/regularflights'
		);
	function getData([col, row]: readonly [number, number]): GridCell {
		const regularFlight = regularFlights[row];
		if (regularFlight) {
			let data;
			let kind = GridCellKind.Text;
			if (col === 1) {
				data = regularFlight.name;
			} else if (col === 2) {
				data = regularFlight.startingPort.name;
			} else if (col === 3) {
				data = regularFlight.endingPort.name;
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
		<GenericHub<RegularFlightEntity>
			idProperty={'id'}
			extraActions={ExtraActions as GenericHubProps<RegularFlightEntity>['extraActions']}
			getData={getData}
			entitySearchTools={RegularFlightSearchTools}
			entityPage={ViewAndEditRegularFlight}
			columns={columns}
			entityName={'regularflight'}
			useStore={useRegularFlightStore}
			entities={regularFlights}
			onEntitySelected={onEntitySelected}
			idSelected={idSelected}
			updateQuery={updateRegularFlight as UseMutationResult}
			deleteQuery={undefined}
			query={{ ...query, count }}
			canEdit={() => false}
		/>
	);
};

export default RegularFlightHub;
