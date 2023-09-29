import { useHistory, useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { VehicleEntity } from '@utm-entities/vehicle';
import { useLs } from '../../../../commons/utils';
import { useQueryVehicle, useUpdateVehicle } from '../hooks';
import ViewAndEditVehicle from '../pages/ViewAndEditVehicle';
import DashboardLayout from '../../../../commons/layouts/DashboardLayout';
import { reactify } from 'svelte-preprocess-react';
import CLoadingSvelte from '@tokyo/gui/CLoading.svelte';
import PageLayout from '../../../../commons/layouts/PageLayout';
import PButton from '@pcomponents/PButton';
import CModalSvelte from '@tokyo/gui/CModal.svelte';
import { useTranslation } from 'react-i18next';
import { CModalVariant } from '@tokyo/gui/CModal';

const CLoading = reactify(CLoadingSvelte);
const CModal = reactify(CModalSvelte);

const LoadedVehicle = (props: { vehicle: VehicleEntity }) => {
	const { t } = useTranslation();
	const history = useHistory();
	const ls = useLs<VehicleEntity>(props.vehicle);

	const updateVehicle = useUpdateVehicle();
	const [isEditing, setEditingFlag] = useState<boolean>(false);

	useEffect(() => {
		if (updateVehicle.isSuccess) {
			setEditingFlag(false);
		}
	}, [updateVehicle.isSuccess]);

	return (
		<DashboardLayout>
			<PageLayout
				onArrowBack={() => history.push('/vehicles')}
				extraLeftHeaderButtons={
					<>
						{!isEditing && (
							<PButton
								icon={'edit'}
								onClick={() => {
									setEditingFlag(true);
								}}
							/>
						)}
						{isEditing && (
							<PButton
								icon={'floppy-disk'}
								onClick={() => {
									updateVehicle.mutate({
										entity: ls.entity,
										documents: ls.documents,
										isCreating: false
									});
								}}
							/>
						)}
					</>
				}
			>
				<ViewAndEditVehicle ls={ls} isEditing={isEditing} />
				{updateVehicle.isLoading && (
					<CModal disabled variant={CModalVariant.INFORMATION} title={t('Saving')}>
						{t('Please wait while your changes are being saved')}.
					</CModal>
				)}
				{updateVehicle.isSuccess && (
					<CModal
						variant={CModalVariant.SUCCESS}
						title={t('The vehicle details have been succesfully saved!')}
						onClose={() => {
							updateVehicle.reset();
						}}
					>
						{t('Your changes to VEHICLE have been saved', {
							vehicle: ls.entity.vehicleName
						})}
						.
					</CModal>
				)}
			</PageLayout>
		</DashboardLayout>
	);
};

const Vehicle = () => {
	const { uvin } = useParams() as { uvin: string };
	const { vehicle, refetch, isSuccess } = useQueryVehicle(uvin);

	useEffect(() => {
		refetch().then();
	}, [refetch]);

	if (!isSuccess) return <CLoading />;
	return <LoadedVehicle vehicle={vehicle} />;
};

export default Vehicle;
