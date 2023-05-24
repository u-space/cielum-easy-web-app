import { useTranslation } from 'react-i18next';
import { CSSProperties, FC } from 'react';
import { useHistory } from 'react-router-dom';
import { useQueryString } from '../../../../utils';
import GenericHub, { rowHeight } from '../../../../commons/screens/GenericHub';
import {
	useQueryFlightRequests,
	useUpdateFlightRequest,
	useUpdateFlightRequestState
} from '../hooks';
import { CustomCell, GridCell, GridCellKind, TextCell } from '@glideapps/glide-data-grid';
import ViewAndEditFlightRequest from '../pages/ViewAndEditFlightRequest';
import { useFlightRequestStore } from '../store';
import { UseMutationResult } from 'react-query';
import { useAuthIsAdmin } from '../../../auth/store';
import { FlightRequestEntity, FlightRequestState } from '@flight-request-entities/flightRequest';
import PButton, { PButtonSize, PButtonType } from '@pcomponents/PButton';
import { observer } from 'mobx-react';
import FlightRequestSearchTools from '../components/FlightRequestSearchTools';

interface MenuButtonsProps {
	entity: FlightRequestEntity;
	style?: CSSProperties;
}
const MenuButtons: FC<MenuButtonsProps> = ({ entity, style }) => {
	const updateFlightRequestState = useUpdateFlightRequestState();
	return (
		<>
			<PButton
				variant={PButtonType.PRIMARY}
				icon={'tick'}
				disabled={entity.state !== FlightRequestState.COMPLETED}
				style={style}
				onClick={() => {
					updateFlightRequestState.mutate({
						id: entity.id || '',
						state: FlightRequestState.PREFLIGHT
					});
				}}
			/>
			<PButton
				variant={PButtonType.DANGER}
				icon={'disable'}
				disabled={entity.state === FlightRequestState.CANCELLED}
				onClick={() => {
					updateFlightRequestState.mutate({
						id: entity.id || '',
						state: FlightRequestState.CANCELLED
					});
				}}
			/>
		</>
	);
};
const ExtraActions: FC<{ data: FlightRequestEntity }> = ({ data }) => {
	const history = useHistory();
	return (
		<PButton
			icon={'eye-open'}
			size={PButtonSize.SMALL}
			variant={PButtonType.SECONDARY}
			onClick={() => history.push(`/flight-requests/${data.id}`)}
		/>
	);
};
const FlightRequestHub: FC = () => {
	// Other hooks
	const { t } = useTranslation(['ui', 'glossary']);
	const history = useHistory();
	const queryString = useQueryString();

	// State
	const isAdmin = useAuthIsAdmin();

	// Props
	const idSelected = queryString.get('id');
	const columns = [
		{ title: ' ', width: rowHeight * 2 },
		{ title: t('glossary:flightRequest.name'), width: 2 },
		{ title: t('glossary:flightRequest.operator'), width: 2 },
		{ title: t('glossary:flightRequest.flightCategory'), width: 2 },
		{ title: t('glossary:flightRequest.state'), width: 2 }
	];

	// Backend
	const query = useQueryFlightRequests();
	const { flightRequests, count } = query;

	const updateFlightRequest = useUpdateFlightRequest();

	// Handlers
	function getData([col, row]: readonly [number, number]): GridCell {
		const flightRequest = flightRequests[row];
		if (flightRequest) {
			let data;
			let kind = GridCellKind.Text;
			if (col === 1) {
				data = flightRequest.name ? flightRequest.name : '';
			} else if (col === 2) {
				data = flightRequest.operator ? flightRequest.operator.username : '';
			} else if (col === 3) {
				data = flightRequest.flight_category ? flightRequest.flight_category : '';
			} else if (col === 4) {
				data = flightRequest.state
					? t(`glossary:flightRequest.flight_state.${flightRequest.state}`)
					: '';
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
			} else if (kind === GridCellKind.Number) {
				return {
					displayData: String(data),
					kind: GridCellKind.Number,
					data: data,
					allowOverlay: false
				};
			}
		}
		return {
			kind: GridCellKind.Text,
			data: ' ',
			displayData: ' ',
			allowOverlay: false
		};
	}

	const onEntitySelected = (flightRequest: FlightRequestEntity) =>
		history.replace(
			flightRequest ? `/flight-requests?id=${flightRequest.id}` : '/flight-requests'
		);

	return (
		<GenericHub<FlightRequestEntity>
			idProperty={'id'}
			extraActions={ExtraActions}
			getData={getData}
			entitySearchTools={FlightRequestSearchTools}
			entityPage={ViewAndEditFlightRequest}
			columns={columns}
			entityName={'flightRequest'}
			useStore={useFlightRequestStore}
			entities={flightRequests}
			onEntitySelected={onEntitySelected}
			idSelected={idSelected}
			updateQuery={updateFlightRequest as UseMutationResult}
			query={{ ...query, count }}
			canEdit={() => isAdmin}
			extraMenuButtons={MenuButtons}
		/>
	);
};

export default observer(FlightRequestHub);
