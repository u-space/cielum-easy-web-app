import PButton from '@pcomponents/PButton';
import { useTokyo } from '@tokyo/store';
import { useTranslation } from 'react-i18next';
import CardGroup from '../../../commons/layouts/dashboard/menu/CardGroup';
import { EditMode } from '@tokyo/types';
import { useState } from 'react';

const MapViewModeSwitch = () => {
	const tokyo = useTokyo();
	const [startingMode, setStartingMode] = useState(null);
	const { t } = useTranslation();
	return null;
};

export default MapViewModeSwitch;
