import { FC } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PTooltip from '@pcomponents/PTooltip';
import PButton from '@pcomponents/PButton';
import { PButtonSize, PButtonType } from '@pcomponents/PButton';
import { getFeatureOption, useQueryString } from '../../../../utils';
import { UseMutationResult, useQueryClient } from 'react-query';
import GenericHub, { GenericHubProps, rowHeight } from '../../../../commons/screens/GenericHub';
import { useAuthIsAdmin, useAuthIsPilot, useAuthStore } from '../../../auth/store';
import { useDeleteOperation, useQueryOperations, useSaveOperation } from '../hooks';
import { GridCell, GridCellKind } from '@glideapps/glide-data-grid';
import env from '../../../../../vendor/environment/env';
import { useOperationStore } from '../store';
import ViewAndEditOperation from '../pages/ViewAndEditOperation';
import OperationSearchTools from '../components/OperationSearchTools';
import { OPERATION_LOCALES_OPTIONS, OperationEntity } from '@utm-entities/operation';
import styled from 'styled-components';
import { OPERATION_STATE_COLORS, OPERATION_STATE_COLORS_CSS } from '@tokyo/TokyoDefaults';
import { BackgroundColor } from 'chalk';

interface ExtraActionsProps {
	data: OperationEntity;
}

const OperationStateCircle = styled.div`
	height: 1rem;
	width: 1rem;
	border-radius: 100%;
	margin-left: 1rem;
	border: 1px solid rgb(var(--mirai-900-rgb), 0.25);
	box-shadow: 0 1px 1px 0 rgba (0, 0, 0, 0.25);
	filter: saturate(0.75);
`;

const ExtraActions: FC<ExtraActionsProps> = ({ data }) => {
	const history = useHistory();
	const { t } = useTranslation();
	return (
		<>
			{/*<PTooltip content={t('View in map')}>
				<PButton
					size={PButtonSize.SMALL}
					icon="eye-open"
					variant={PButtonType.SECONDARY}
					onClick={() => history.push(`/map?operation=${data.gufi}`)}
				/>
			</PTooltip>*/}
			<PTooltip content={t('View past flights')}>
				<PButton
					size={PButtonSize.SMALL}
					icon="time"
					variant={PButtonType.SECONDARY}
					onClick={() =>
						history.push(
							`/past-flights?gufi=${data.gufi}&from=${(
								data.start as Date
							).toISOString()}&to=${(data.end as Date).toISOString()}`
						)
					}
				/>
			</PTooltip>
			<PTooltip content={t(data.state)}>
				<OperationStateCircle
					style={{
						backgroundColor: OPERATION_STATE_COLORS_CSS[data.state]
					}}
				/>
			</PTooltip>
		</>
	);
};

const OperationHub = () => {
	// Other hooks
	const { t } = useTranslation();
	const history = useHistory();
	const queryString = useQueryString();
	const queryClient = useQueryClient();

	// State

	// Props
	const isPilot = useAuthIsPilot();
	const isAdmin = useAuthIsAdmin();
	const username = useAuthStore((state) => state.username);

	const idSelected = queryString.get('id');
	const columns = [
		{ title: ' ', width: rowHeight * 3 }, // Fixed width
		{ title: t('glossary:operation.name'), width: 3 }, // Ratios
		{ title: t('glossary:operation.contact'), width: 2 },
		{ title: t('glossary:operation.contact_phone'), width: 1 },
		{ title: t('glossary:volume.effective_time_begin'), width: 1 },
		{ title: t('glossary:volume.effective_time_end'), width: 1 }
	];

	// Backend
	const query = useQueryOperations();
	const { operations, count } = query;

	const updateOperation = useSaveOperation();
	const deleteOperation = useDeleteOperation();

	// Handlers
	function getData([col, row]: readonly [number, number]): GridCell {
		const operation = operations[row];
		if (operation) {
			let data = '';
			let kind = GridCellKind.Text;
			if (col === 1) {
				data = operation.name;
			} else if (col === 2) {
				data = operation.contact;
			} else if (col === 3) {
				data = operation.contact_phone;
			} else if (col === 4) {
				data = (operation.operation_volumes[0].effective_time_begin as Date).toLocaleString(
					[],
					OPERATION_LOCALES_OPTIONS
				);
			} else if (col === 5) {
				data = (
					operation.operation_volumes[operation.operation_volumes.length - 1]
						.effective_time_end as Date
				).toLocaleString([], OPERATION_LOCALES_OPTIONS);
			} else if (col === 0) {
				kind = GridCellKind.Custom;
			}

			if (kind === GridCellKind.Text) {
				return {
					kind: GridCellKind.Text,
					data: data,
					displayData: data,
					allowOverlay: true
				};
			} else {
				return {
					kind: GridCellKind.Custom,
					data: data,
					copyData: data,
					allowOverlay: false
				};
			}
		} else {
			return {
				kind: GridCellKind.Text,
				data: ' ',
				displayData: ' ',
				allowOverlay: false
			};
		}
	}
	const onEntitySelected = (operation: OperationEntity) =>
		history.replace(operation ? `/operations?id=${operation.gufi}` : '/operations');

	return (
		<GenericHub<OperationEntity>
			idProperty={'gufi'}
			extraActions={ExtraActions as GenericHubProps<OperationEntity>['extraActions']}
			getData={getData}
			entitySearchTools={OperationSearchTools}
			entityPage={ViewAndEditOperation}
			extraEntityPageProps={{ isAbleToChangeState: isAdmin }}
			columns={columns}
			entityName={'operation'}
			useStore={useOperationStore}
			entities={operations}
			onEntitySelected={onEntitySelected}
			idSelected={idSelected}
			updateQuery={updateOperation as UseMutationResult}
			deleteQuery={deleteOperation as UseMutationResult}
			query={{ ...query, count }}
			canAddNew={
				(getFeatureOption<boolean>('Operations', 'pilotCanCreateOperations') && isPilot) ||
				isAdmin
			}
			canEdit={(operation: OperationEntity) =>
				operation?.owner?.username === username || isAdmin
			}
		/>
	);
};

export default OperationHub;
