import { UvrEntity } from '@utm-entities/uvr';
import { FC } from 'react';
import GenericHub, { GenericHubProps, rowHeight } from '../../../../commons/screens/GenericHub';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import PTooltip from '@pcomponents/PTooltip';
import PButton from '@pcomponents/PButton';
import { PButtonSize, PButtonType } from '@pcomponents/PButton';
import { useQueryString } from '../../../../utils';
import { UseMutationResult, useQueryClient } from 'react-query';
import useQueryUvrs, { useDeleteUvr, useUpdateUvr } from '../hooks';
import { CustomCell, GridCell, GridCellKind, NumberCell, TextCell } from '@glideapps/glide-data-grid';
import UvrSearchTools from '../components/UvrSearchTools';
import ViewAndEditUvr from '../pages/ViewAndEditUvr';
import { useUvrStore } from '../store';
import { useAuthIsAdmin } from '../../../auth/store';
import { observer } from 'mobx-react';

const ExtraActions: FC<{ data: UvrEntity }> = ({ data }) => {
	const { t } = useTranslation();
	const history = useHistory();
	return (
		<PTooltip content={t('View in map')}>
			<PButton
				size={PButtonSize.SMALL}
				icon="eye-open"
				variant={PButtonType.SECONDARY}
				onClick={() => history.push(`/map?uvr=${data.message_id}`)}
			/>
		</PTooltip>
	);
};

const UvrHub = () => {
	// Other hooks
	const { t } = useTranslation();
	const history = useHistory();
	const queryString = useQueryString();

	// State
	const isAdmin = useAuthIsAdmin();

	// Props
	const idSelected = queryString.get('id');
	const columns = [
		{ title: ' ', width: rowHeight * 2 }, // Fixed width
		{ title: t('glossary:uvr.reason'), width: 3 }, // Ratios
		{ title: t('glossary:uvr.min_altitude'), width: 1 },
		{ title: t('glossary:uvr.max_altitude'), width: 1 },
		{ title: t('glossary:uvr.effective_time_begin'), width: 1 },
		{ title: t('glossary:uvr.effective_time_end'), width: 1 }
	];

	// Backend
	const query = useQueryUvrs();
	const { uvrs, count } = query;

	const updateUvr = useUpdateUvr();
	const deleteUvr = useDeleteUvr();

	// Handlers
	const onEntitySelected = (uvr: UvrEntity) =>
		history.replace(uvr ? `/uvrs?id=${uvr.message_id}` : '/uvrs');
	function getData([col, row]: readonly [number, number]): GridCell {
		const uvr = uvrs[row];
		if (uvr) {
			let data;
			let kind = GridCellKind.Text;
			if (col === 1) {
				data = uvr.reason;
			} else if (col === 2) {
				kind = GridCellKind.Number;
				data = uvr.min_altitude + '';
			} else if (col === 3) {
				kind = GridCellKind.Number;
				data = uvr.max_altitude + '';
			} else if (col === 4) {
				kind = GridCellKind.Text;
				data = uvr.effective_time_begin.toLocaleString();
			} else if (col === 5) {
				kind = GridCellKind.Text;
				data = uvr.effective_time_end.toLocaleString();
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
			}
			else if (kind === GridCellKind.Number) {
				return {
					kind: GridCellKind.Number,
					data: data,
					displayData: data,
					allowOverlay: false
				} as NumberCell;
			}
			else if (kind === GridCellKind.Custom) {
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
		<GenericHub<UvrEntity>
			idProperty={'message_id'}
			extraActions={ExtraActions as GenericHubProps<UvrEntity>['extraActions']}
			getData={getData}
			entitySearchTools={UvrSearchTools}
			entityPage={ViewAndEditUvr}
			columns={columns}
			entityName={'uvr'}
			useStore={useUvrStore}
			entities={uvrs}
			onEntitySelected={onEntitySelected}
			idSelected={idSelected}
			updateQuery={updateUvr as UseMutationResult}
			deleteQuery={deleteUvr as UseMutationResult}
			query={{ ...query, count }}
			canEdit={() => isAdmin}
		/>
	);
};

export default observer(UvrHub);
