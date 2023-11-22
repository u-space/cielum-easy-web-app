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
import styled from 'styled-components';
import PTooltip from '@pcomponents/PTooltip';
import { OPERATION_LOCALES_OPTIONS } from '@utm-entities/v2/model/operation';

interface MenuButtonsProps {
	entity: FlightRequestEntity;
	style?: CSSProperties;
}

const PaidStateCircle = styled.div`
	height: 1rem;
	width: 1rem;
	border-radius: 100%;
	margin-left: 1rem;
	border: 1px solid rgb(var(--mirai-900-rgb), 0.25);
	box-shadow: 0 1px 1px 0 rgba (0, 0, 0, 0.25);
	filter: saturate(0.75);
`;
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
	const { t } = useTranslation();
	return (
		<>
			<PButton
				icon={'eye-open'}
				size={PButtonSize.SMALL}
				variant={PButtonType.SECONDARY}
				onClick={() => history.push(`/flight-requests/${data.id}`)}
			/>
			<PTooltip content={data.paid ? t('Paid') : t('Pending payment')}>
				<PaidStateCircle
					style={{
						backgroundColor: data.paid ? 'green' : 'red'
					}}
				/>
			</PTooltip>
		</>
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
		{ title: t('glossary:flight-request.name'), width: 2 },
		{ title: t('glossary:flight-request.operator'), width: 2 },
		{ title: t('glossary:flight-request.creator'), width: 2 },
		{ title: t('glossary:flight-request.state'), width: 2 },
		{ title: t('glossary:flight-request.starting_time'), width: 2 }
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
				data = flightRequest.creator ? flightRequest.creator.username : '';
			} else if (col === 4) {
				data = flightRequest.state
					? t(`glossary:flight-request.flight_state.${flightRequest.state}`)
					: '';
			} else if (col === 5) {
				data = flightRequest.volumes[0].effective_time_begin
					? new Date(flightRequest.volumes[0].effective_time_begin).toLocaleString(
							[],
							OPERATION_LOCALES_OPTIONS
					  )
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
			entityName={'flight-request'}
			useStore={useFlightRequestStore}
			entities={flightRequests}
			onEntitySelected={onEntitySelected}
			idSelected={idSelected}
			updateQuery={updateFlightRequest as UseMutationResult}
			query={{ ...query, count }}
			canEdit={() => false}
			extraMenuButtons={MenuButtons}
		/>
	);
};

export default observer(FlightRequestHub);
