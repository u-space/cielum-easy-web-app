import { Spinner } from '@blueprintjs/core';
import { observer, useLocalStore } from 'mobx-react';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PButton from '@pcomponents/PButton';
import { getCSSVariable, setCSSVariable } from '../../../utils';
import { VehicleEntity } from '@utm-entities/vehicle';
import { PositionEntity } from '@utm-entities/position';
import BackButton from '../../../commons/layouts/dashboard/menu/BackButton';
import ViewAndEditVehicle from '../../core_service/vehicle/pages/ViewAndEditVehicle';
import PositionDetails from './PositionDetails';
import CardGroup, { CardGroupDetailLine } from '../../../commons/layouts/dashboard/menu/CardGroup';
import Fill from '../../../commons/layouts/dashboard/menu/Fill';
import { useLs } from '../../../commons/utils';

export interface VehicleDetailsProps {
	isLoading: boolean;
	isSuccess: boolean;
	isError: boolean;
	vehicle: VehicleEntity;
	latestPosition?: PositionEntity;
}

const VehicleDetails: FC<VehicleDetailsProps> = ({
	isLoading,
	isSuccess,
	isError,
	vehicle,
	latestPosition
}) => {
	const { t } = useTranslation();

	const [isExpanded, setExpanded] = useState(false);
	const defaultSideWidth = getCSSVariable('side-width-default');
	const fullSideWidth = getCSSVariable('side-width-full');

	const ls = useLs<VehicleEntity>(vehicle);

	useEffect(() => {
		ls.entity = vehicle;
	}, [ls, vehicle]);

	useEffect(() => {
		if (isExpanded) {
			setCSSVariable('side-width', fullSideWidth);
		} else {
			setCSSVariable('side-width', defaultSideWidth);
		}
		return () => {
			setCSSVariable('side-width', defaultSideWidth);
		};
	}, [isExpanded]);

	return (
		<>
			<BackButton />
			{isLoading && <Spinner />}
			{isSuccess && !isExpanded && (
				<>
					{latestPosition && <PositionDetails position={latestPosition} />}
					<CardGroup header="Vehicle details">
						<CardGroupDetailLine prop={'glossary:vehicle.uvin'} value={vehicle.uvin} />
						{Object.entries(vehicle).map((pair, index) => {
							const [prop, value] = pair;

							let toPrint = '';
							if (value instanceof Date) {
								toPrint = value.toLocaleString();
							} else if (typeof value === 'string') {
								toPrint = value;
							} else if (typeof value === 'number') {
								toPrint = value.toString();
							}
							return (
								<CardGroupDetailLine
									key={prop}
									prop={`glossary:vehicle.${prop}`}
									value={toPrint}
								/>
							);
						})}
					</CardGroup>

					<PButton icon="info-sign" onClick={() => setExpanded(true)}>
						{t('See more details')}
					</PButton>
				</>
			)}
			{isSuccess && isExpanded && (
				<>
					<PButton onClick={() => setExpanded(false)}>{t('See less details')}</PButton>
					<Fill>
						<ViewAndEditVehicle ls={ls} isEditing={false} isCreating={false} />
					</Fill>
				</>
			)}
			{isError && (
				<CardGroup header="Error" isDanger>
					{t(
						'The details could not be fetched as an error has occurred while contacting the server'
					)}
				</CardGroup>
			)}
		</>
	);
};

export default observer(VehicleDetails);
