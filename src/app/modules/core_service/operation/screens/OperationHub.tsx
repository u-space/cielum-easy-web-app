import { GridCell, GridCellKind } from '@glideapps/glide-data-grid';
import PButton, { PButtonSize, PButtonType } from '@pcomponents/PButton';
import PTooltip from '@pcomponents/PTooltip';
import { OPERATION_STATE_COLORS_CSS } from '@tokyo/TokyoDefaults';
import { Operation, OPERATION_LOCALES_OPTIONS } from '@utm-entities/v2/model/operation';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { UseMutationResult, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import { StateCircle } from '../../../../commons/components/hubs/StateCircle';
import GenericHub, { GenericHubProps, rowHeight } from '../../../../commons/screens/GenericHub';
import { getFeatureOption, useQueryString } from '../../../../utils';
import { useAuthIsAdmin, useAuthIsPilot, useAuthStore } from '../../../auth/store';
import OperationSearchTools from '../components/OperationSearchTools';
import { useDeleteOperation, useQueryOperations, useSaveOperation } from '../hooks';
import ViewAndEditOperation from '../pages/ViewAndEditOperation';
import { useOperationStore } from '../store';

interface ExtraActionsProps {
	data: Operation;
}

const ExtraActions: FC<ExtraActionsProps> = ({ data }) => {
	const history = useHistory();
	const { t } = useTranslation();
	return (
		<>
			<PTooltip content={t('View in map')}>
				<PButton
					size={PButtonSize.SMALL}
					icon="map"
					variant={PButtonType.SECONDARY}
					onClick={() => history.push(`/map?operation=${data.gufi}`)}
				/>
			</PTooltip>
			<PTooltip content={t('View past flights')}>
				<PButton
					size={PButtonSize.SMALL}
					icon="time"
					variant={PButtonType.SECONDARY}
					onClick={() => history.push(`/historical?operation=${data.gufi}`)}
				/>
			</PTooltip>
			<PTooltip content={t('Duplicate')}>
				<PButton
					size={PButtonSize.SMALL}
					icon="duplicate"
					variant={PButtonType.SECONDARY}
					onClick={() => history.push(`/editor/operation?id=${data.gufi}&duplicate=true`)}
				/>
			</PTooltip>
			<PTooltip content={t(data.state)}>
				<StateCircle
					style={{
						backgroundColor:
							OPERATION_STATE_COLORS_CSS[
								data.state as keyof typeof OPERATION_STATE_COLORS_CSS
							]
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
		{ title: ' ', width: 200 }, // Fixed width
		{ title: t('glossary:operation.name'), width: 3 }, // Ratios
		{ title: t('glossary:operation.contact'), width: 2 },
		{ title: t('glossary:operation.contact_phone'), width: 1 },
		{ title: t('glossary:volume.effective_time_begin'), width: 1 },
		{ title: t('glossary:volume.effective_time_end'), width: 1 },
		{ title: t('glossary:operation.submit_time'), width: 1 }
	];

	// Backend
	const query = useQueryOperations();
	const { count } = query;

	const operations = query.operations as Operation[];

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
			} else if (col === 6) {
				data = (operation.submit_time as Date).toLocaleString(
					[],
					OPERATION_LOCALES_OPTIONS
				);
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
	const onEntitySelected = (operation: Operation) =>
		history.replace(operation ? `/operations?id=${operation.gufi}` : '/operations');

	return (
		<GenericHub<Operation>
			idProperty={'gufi'}
			extraActions={ExtraActions as GenericHubProps<Operation>['extraActions']}
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
			canEdit={(operation: Operation) => operation?.owner?.username === username || isAdmin}
		/>
	);
};

export default OperationHub;
