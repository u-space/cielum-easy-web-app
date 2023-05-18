import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTokyo } from '@tokyo/TokyoStore';
import PButton from '@pcomponents/PButton';
import { useSelectedOperationAndVolume } from '../../core_service/operation/hooks';
import CardGroup from '../../../commons/layouts/dashboard/menu/CardGroup';
import ContextualInfo from '../../../commons/layouts/map/editor_map/ContextualInfo';

const Contextual = () => {
	const history = useHistory();
	const { t } = useTranslation();
	const tokyo = useTokyo();

	// Show details of selected operation
	const { operation, volume, selected } = useSelectedOperationAndVolume();

	if (operation && volume) {
		return (
			<CardGroup
				header={t('Volume x of y', {
					x: Number(selected.volume) + 1,
					y: operation?.operation_volumes?.length
				})}
			>
				<ContextualInfo
					entity={{
						effective_time_begin: volume.effective_time_begin.toLocaleString(),
						effective_time_end: volume.effective_time_end.toLocaleString(),
						min_altitude: volume.min_altitude,
						max_altitude: volume.max_altitude
					}}
					entityName={'volume'}
					editable={false}
				/>
				<div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
					<PButton
						icon="arrow-left"
						disabled={Number(selected.volume) <= 0}
						onClick={() =>
							history.push(
								`/map?operation=${selected.gufi}&volume=${
									Number(selected.volume) - 1
								}`
							)
						}
					/>
					<PButton
						icon="send-to-map"
						onClick={() => tokyo.flyToCenterOfGeometry(volume.operation_geography)}
					/>
					<PButton
						icon="arrow-right"
						disabled={
							Number(selected.volume) >= operation?.operation_volumes?.length - 1
						}
						onClick={() =>
							history.push(
								`/map?operation=${selected.gufi}&volume=${
									Number(selected.volume) + 1
								}`
							)
						}
					/>
				</div>
			</CardGroup>
		);
	} else {
		return null;
	}
};

export default Contextual;
