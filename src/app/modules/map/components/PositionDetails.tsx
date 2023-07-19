import CardGroup, { CardGroupDetailLine } from '../../../commons/layouts/dashboard/menu/CardGroup';
import { useTranslation } from 'react-i18next';
import { PositionEntity } from '@utm-entities/position';

const PositionDetails = ({ position }: { position: PositionEntity }) => {
	const { t } = useTranslation();
	return (
		<CardGroup header="Position report">
			<CardGroupDetailLine
				prop={'Location Time'}
				value={new Date(position.time_sent).toLocaleString()}
			/>
			<CardGroupDetailLine prop={'Latitude'} value={position.location.coordinates[1]} />
			<CardGroupDetailLine prop={'Longitude'} value={position.location.coordinates[0]} />
			<CardGroupDetailLine
				prop={'Location Heading'}
				value={t('x degrees', { x: position.heading })}
			/>
			<CardGroupDetailLine
				prop={'Location Altitude'}
				value={t('x meters', { x: position.altitude_gps })}
			/>
		</CardGroup>
	);
};

export default PositionDetails;
