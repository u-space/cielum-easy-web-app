import { useTranslation } from 'react-i18next';
import { useTokyo, viewMode } from '@tokyo/TokyoStore';
import { useState } from 'react';
import PermanentItem, { PermanentItemButton } from '../dashboard/menu/PermanentItem';
import PButton, { PButtonSize } from '@pcomponents/PButton';
import Geocoder, { GeoapifyPlace } from './Geocoder';
import PTooltip from '@pcomponents/PTooltip';
import { TokyoViewMode } from '@tokyo/TokyoTypes';

const geolocationOptions = {
	enableHighAccuracy: true,
	timeout: 5000,
	maximumAge: 0
};

//@refresh reset
const MenuTools = () => {
	const { t } = useTranslation();
	const tokyo = useTokyo();

	const [autocompleteItems, setAutocompleteItems] = useState<GeoapifyPlace[]>([]);

	const onGeolocationSuccess = (pos: { coords: { longitude: number; latitude: number } }) => {
		const crd = pos.coords;
		tokyo.flyTo(crd.longitude, crd.latitude);
	};

	const onGeolocationError = () => {
		alert('The geolocation service failed.');
	};

	return (
		<PermanentItem
			extra={autocompleteItems.map((item) => (
				<PButton
					size={PButtonSize.SMALL}
					icon="map-marker"
					key={item.place_id}
					onClick={() => {
						console.log({ item });
						tokyo.flyTo(item.lon, item.lat);
					}}
				>
					{item.formatted}
				</PButton>
			))}
		>
			<Geocoder onResults={setAutocompleteItems} />
			<PTooltip content={t('Geolocate')}>
				<PermanentItemButton
					icon={'locate'}
					onClick={() => {
						navigator.geolocation.getCurrentPosition(
							onGeolocationSuccess,
							onGeolocationError,
							geolocationOptions
						);
					}}
				/>
			</PTooltip>
			<PTooltip
				content={
					tokyo.viewMode === TokyoViewMode.Satellite
						? t('View street map')
						: t('View satellite map')
				}
			>
				<PermanentItemButton
					icon={tokyo.viewMode === TokyoViewMode.Satellite ? 'globe-network' : 'globe'}
					onClick={() => {
						viewMode.set(
							tokyo.viewMode === TokyoViewMode.Satellite
								? TokyoViewMode.Streets
								: TokyoViewMode.Satellite
						);
					}}
				/>
			</PTooltip>
		</PermanentItem>
	);
};

export default MenuTools;
