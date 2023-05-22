import DashboardLayout from '../layouts/DashboardLayout';
import QuickLaunchButtonsLayout, { QuickLaunchButton } from '../layouts/QuickLaunchButtonsLayout';
import { useTranslation } from 'react-i18next';

const buttons: QuickLaunchButton[] = [
	{ label: 'PERFIL', icon: 'user', path: '/profile', isAdmin: false },
	{ label: 'VEHICLES', icon: 'airplane', path: '/vehicles', isAdmin: false },
	{ label: 'FLIGHT REQUESTS', icon: 'document-open', path: '/flight-requests', isAdmin: false },
	{ label: 'REALTIME MAP', icon: 'map', path: '/map', isAdmin: false },
	{ label: 'DOCUMENTATION', path: '/profile', icon: 'paperclip', isAdmin: false },
	{ label: 'OPERATIONS', path: '/operations', icon: 'area-of-interest', isAdmin: false }
];

const Home = () => {
	const { t } = useTranslation();
	return (
		<DashboardLayout isLoading={false}>
			<QuickLaunchButtonsLayout
				title={t('Welcome (home)')}
				subheader={
					<>
						<h1>{t('Subtitle (home)')}</h1>
						<p style={{ textAlign: 'center' }}>{t('Explanation (home)')}</p>
					</>
				}
				buttons={buttons}
			/>
		</DashboardLayout>
	);
};

export default Home;
