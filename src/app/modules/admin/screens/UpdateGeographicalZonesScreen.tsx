import React from 'react';
import DashboardLayout from '../../../commons/layouts/DashboardLayout';
import styles from './UpdateGeographicalZonesScreen.module.scss';
import { useMutation, useQuery } from 'react-query';
import { useFlightRequestServiceAPI } from '../../../utils';
import PButton from '@pcomponents/PButton';
import { useHistory } from 'react-router-dom';

function UpdateGeographicalZonesScreen(): JSX.Element {
	const history = useHistory();

	const {
		geographicalZone: { getFetchUpdateInformation, postCommitUpdateInformation }
	} = useFlightRequestServiceAPI();

	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	const query: any = useQuery('getFetchUpdateInformation', getFetchUpdateInformation);
	const mutation: any = useMutation(postCommitUpdateInformation);

	function updateGeographicalZones() {
		if (
			window.confirm(
				'¿Estás seguro de que quieres actualizar las zonas geográficas? Este proceso es destructivo, por lo cual es buena idea guardar esta página primero'
			)
		) {
			mutation.mutate();
		}
	}

	return (
		<DashboardLayout isLoading={mutation.isLoading}>
			<div className={styles.screen}>
				{mutation.isError && (
					<>
						<h1>Error al actualizar</h1>
						<p>{mutation.error.message}</p>
					</>
				)}
				{mutation.isSuccess && (
					<>
						<h1>Actualización exitosa</h1>
						<p>Se han actualizado las zonas geográficas</p>
						<PButton onClick={() => history.push('/admin')}>VOLVER</PButton>
					</>
				)}
				{mutation.isLoading && (
					<>
						<h1>Actualizando...</h1>
						<p>Esto puede tardar unos minutos</p>
					</>
				)}
				{!mutation.isLoading && !mutation.isError && !mutation.isSuccess && (
					<>
						<h1>Actualizar zonas geograficas</h1>
						{query.isLoading && <p>Loading...</p>}
						{query.isError && <p>Error: {query.error.message}</p>}
						{query.isSuccess && (
							<>
								<h2>Nuevas zonas</h2>
								<ul>
									{query.data?.newGeozones.map(
										(newZone: string, index: number) => (
											<li key={newZone}>
												[{index + 1}] {newZone}
											</li>
										)
									)}
								</ul>
								<h2>Zonas que tienen mismo GFID pero distinto nombre</h2>
								<ul>
									{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
									{query.data?.mismatched.map((mismatched: any) => {
										const oldData = mismatched.oldData;
										const enaireData = mismatched.enaireData;
										return (
											<li key={oldData.gfid}>
												<li>
													{oldData.name} es ahora
													{enaireData.NAME_TXT ||
														enaireData.NOMBRE_50 ||
														enaireData.REMARKS_TXT}
												</li>
												<li>{JSON.stringify(enaireData)}</li>
											</li>
										);
									})}
								</ul>
								<h2>Nuevos datos de polígono</h2>
								{query.data?.updated.map((updated: any, index: number) => (
									<li key={updated.oldData.id}>
										[{index + 1}] {updated.oldData.name} ({updated.oldData.id})
									</li>
								))}
								<h2>No tienen GFID</h2>
								<ul>
									{query.data?.missingGfid.map((description: string) => (
										<li key={description}>{description}</li>
									))}
								</ul>
								<PButton onClick={updateGeographicalZones}>ACTUALIZAR</PButton>
							</>
						)}
					</>
				)}
			</div>
		</DashboardLayout>
	);
}

export default UpdateGeographicalZonesScreen;
