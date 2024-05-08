import { Spinner, SpinnerSize } from '@blueprintjs/core';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import PButton from '@pcomponents/PButton';
import DashboardLayout from '../layouts/DashboardLayout';
import { useQueryOperationsCounts } from '../../modules/core_service/operation/hooks';
import { useOperationStore } from '../../modules/core_service/operation/store';
import { shallow } from 'zustand/shallow';
import styles from './Home.module.scss';
import { getCSSVariable } from '../../utils';
import { useEffect } from 'react';
import { useAuthIsPilot } from '../../modules/auth/store';

const StatNumber = ({ colorDiffThan0, stat }: { colorDiffThan0: string; stat: number }) => {
	return (
		<>
			{stat >= 0 && (
				<p
					style={{
						color: stat > 0 ? colorDiffThan0 : undefined
					}}
				>
					{stat}
				</p>
			)}
			{stat < 0 && <Spinner size={SpinnerSize.SMALL} />}
		</>
	);
};

const Home = () => {
	const history = useHistory();
	const { t } = useTranslation();
	const isPilot = useAuthIsPilot();

	const {
		setFilterProposed,
		setFilterPending,
		setFilterAccepted,
		setFilterActivated,
		setFilterRogue,
		setFilterNotAccepted,
		setFilterClosed
	} = useOperationStore(
		(state) => ({
			setFilterProposed: state.setFilterProposed,
			setFilterPending: state.setFilterPending,
			setFilterAccepted: state.setFilterAccepted,
			setFilterActivated: state.setFilterActivated,
			setFilterRogue: state.setFilterRogue,
			setFilterNotAccepted: state.setFilterNotAccepted,
			setFilterClosed: state.setFilterClosed
		}),
		shallow
	);

	const setUniqueFilterAndVisitOperationsHub = (type: string) => {
		setFilterProposed(false);
		setFilterPending(type === 'PENDING');
		setFilterAccepted(type === 'ACCEPTED');
		setFilterActivated(type === 'ACTIVATED');
		setFilterRogue(type === 'ROGUE');
		setFilterNotAccepted(type === 'NOT_ACCEPTED');
		setFilterClosed(type === 'CLOSED');
		history.push('/operations');
	};

	const { countPending, countActivated, countRogue } = useQueryOperationsCounts();

	// get css var --yamate-500
	const colors = {
		success: getCSSVariable('yamate-500'),
		warning: getCSSVariable('kannai-500'),
		danger: getCSSVariable('ramen-500')
	};

	useEffect(() => {
		if (isPilot) {
			history.push('/map');
		}
	}, [isPilot, history]);

	return (
		<DashboardLayout isLoading={false}>
			<div className={styles.home}>
				{/*!isPilot && (
						<div>
							<StatNumber stat={countUsersPending} colorDiffThan0={colors.primary} />
							<div>{t('Users pending authorization')}</div>
							<PButton
								icon={'eye-open'}
								onClick={() => history.push('/users?unconfirmed=true')}
							/>
						</div>
					)*/}
				{/*<div>
						<StatNumber stat={countVehiclesPending} colorDiffThan0={colors.primary} />
						<div>{t('Vehicles pending authorization')}</div>
						<PButton
							icon={'eye-open'}
							onClick={() => history.push('/vehicles?pending=true')}
						/>
					</div>*/}
				<div>
					<StatNumber stat={countPending} colorDiffThan0={colors.warning} />
					<div>{t('Operation(s) in PENDING state')}</div>
					<PButton
						icon={'eye-open'}
						onClick={() => setUniqueFilterAndVisitOperationsHub('PENDING')}
					/>
				</div>
				<div>
					<StatNumber stat={countActivated} colorDiffThan0={colors.success} />
					<div>{t('Operation(s) in ACTIVATED state')}</div>
					<PButton
						icon={'eye-open'}
						onClick={() => setUniqueFilterAndVisitOperationsHub('ACTIVATED')}
					/>
				</div>
				<div>
					<StatNumber stat={countRogue} colorDiffThan0={colors.danger} />
					<div>{t('Operation(s) in ROGUE state')}</div>
					<PButton
						icon={'eye-open'}
						onClick={() => setUniqueFilterAndVisitOperationsHub('ROGUE')}
					/>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default Home;
