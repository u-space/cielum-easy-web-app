import UnloggedLayout from '../layouts/UnloggedLayout';
import { useTranslation } from 'react-i18next';
import StatusLayout from '../layouts/StatusLayout';
import styles from '../auth.module.scss';

const DeadScreen = ({ text }: { text: string }) => {
	const { t } = useTranslation();
	return (
		<UnloggedLayout extraClassnames={[styles.login]}>
			<StatusLayout isError>
				<h3>{t('Maintenance mode')}</h3>
				{text}
			</StatusLayout>
		</UnloggedLayout>
	);
};

export default DeadScreen;
