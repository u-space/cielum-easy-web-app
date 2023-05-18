import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import PButton from '@pcomponents/PButton';

const MenuBack = ({ route }: { route?: string }) => {
	const history = useHistory();
	const { t } = useTranslation();

	return (
		<PButton icon="arrow-left" onClick={() => history.push(route || '/map')}>
			{t('Exit')}
		</PButton>
	);
};

export default MenuBack;
