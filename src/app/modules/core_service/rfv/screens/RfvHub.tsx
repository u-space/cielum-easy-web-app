import { CustomCell, GridCell, GridCellKind, TextCell } from '@glideapps/glide-data-grid';
import { RfvEntity } from '@utm-entities/rfv';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import PTooltip from '@pcomponents/PTooltip';
import PButton from '@pcomponents/PButton';
import { PButtonSize, PButtonType } from '@pcomponents/PButton';
import { useQueryString } from '../../../../utils';
import GenericHub, { GenericHubProps, rowHeight } from '../../../../commons/screens/GenericHub';
import useQueryRfvs, { useDeleteRfv, useUpdateRfv } from '../hooks';
import RfvSearchTools from '../components/RfvSearchTools';
import ViewAndEditRfv from '../pages/ViewAndEditRfv';
import { useRfvStore } from '../store';
import { UseMutationResult } from 'react-query';
import { observer } from 'mobx-react';
import { useAuthIsAdmin } from '../../../auth/store';

const ExtraActions: FC<{ data: RfvEntity }> = ({ data }) => {
	const { t } = useTranslation();
	const history = useHistory();
	return (
		<PTooltip content={t('View in map')}>
			<PButton
				size={PButtonSize.SMALL}
				icon="eye-open"
				variant={PButtonType.SECONDARY}
				onClick={() => history.push(`/map?rfv=${data.id}`)}
			/>
		</PTooltip>
	);
};

const RfvHub = () => {
	// Other hooks
	const { t } = useTranslation();
	const history = useHistory();
	const queryString = useQueryString();

	// State

	// Props
	const isAdmin = useAuthIsAdmin();
	const idSelected = queryString.get('id');
	const columns = [
		{ title: ' ', width: rowHeight * 2 }, // Fixed width
		{ title: t('glossary:rfv.comments'), width: 3 }, // Ratios
		{ title: t('glossary:rfv.min_altitude'), width: 1 },
		{ title: t('glossary:rfv.max_altitude'), width: 2 }
	];

	// Backend
	const query = useQueryRfvs();
	const { rfvs, count } = query;

	const updateRfv = useUpdateRfv();
	const deleteRfv = useDeleteRfv();

	// Handlers
	const onEntitySelected = (rfv: RfvEntity) =>
		history.replace(rfv ? `/rfvs?id=${rfv.id}` : '/rfvs');
	function getData([col, row]: readonly [number, number]): GridCell {
		const rfv = rfvs[row];
		if (rfv) {
			let data;
			let kind = GridCellKind.Text;
			if (col === 1) {
				data = rfv.comments;
			} else if (col === 2) {
				kind = GridCellKind.Number;
				data = rfv.min_altitude;
			} else if (col === 3) {
				kind = GridCellKind.Number;
				data = rfv.max_altitude;
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

	return (
		<GenericHub<RfvEntity>
			idProperty={'id'}
			extraActions={ExtraActions as GenericHubProps<RfvEntity>['extraActions']}
			getData={getData}
			entitySearchTools={RfvSearchTools}
			entityPage={ViewAndEditRfv}
			columns={columns}
			entityName={'rfv'}
			useStore={useRfvStore}
			entities={rfvs}
			onEntitySelected={onEntitySelected}
			idSelected={idSelected}
			updateQuery={updateRfv as UseMutationResult}
			deleteQuery={deleteRfv as UseMutationResult}
			query={{ ...query, count }}
			canEdit={() => isAdmin}
		/>
	);
};

export default observer(RfvHub);
