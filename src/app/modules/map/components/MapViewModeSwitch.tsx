import PButton from '@pcomponents/PButton';
import { editMode, useTokyo } from '@tokyo/TokyoStore';
import { useTranslation } from 'react-i18next';
import CardGroup from '../../../commons/layouts/dashboard/menu/CardGroup';
import { TokyoEditMode } from '@tokyo/TokyoTypes';

const MapViewModeSwitch = () => {
	const tokyo = useTokyo();
	const { t } = useTranslation();
	return (
		<>
			{tokyo?.editMode === TokyoEditMode.EDITING && (
				<CardGroup header="You are in editing mode">
					{t('Clicking on the map will add or modify volumes')}
					<PButton onClick={() => editMode.set(TokyoEditMode.PAUSED)}>
						{t('Switch into information mode')}
					</PButton>
				</CardGroup>
			)}
			{tokyo?.editMode === TokyoEditMode.PAUSED && (
				<CardGroup header="You are in information mode">
					{t(
						'Clicking on the map will let you see information about the entities on the map, such as geographical zones'
					)}
					<PButton onClick={() => editMode.set(TokyoEditMode.EDITING)}>
						{t('Switch into editing mode')}
					</PButton>
				</CardGroup>
			)}
		</>
	);
};

export default MapViewModeSwitch;
