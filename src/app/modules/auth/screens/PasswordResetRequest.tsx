import { UserEntity } from '@utm-entities/user';
import { useLocalStore } from 'mobx-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import { useQueryString } from '../../../utils';
import PasswordChangerRequestForm from '../../core_service/user/components/PasswordChangerRequestForm';
import { useSchemaStore } from '../../schemas/store';
import styles from '../auth.module.scss';
import UnloggedLayout from '../layouts/UnloggedLayout';

const SECONDS_TO_REDIRECT = 5;

const PasswordResetRequest = () => {
	const { t } = useTranslation();
	const history = useHistory();

	const schema = useSchemaStore((state) => state.users);

	const { username } = useParams<{ username: string }>();
	const ls = useLocalStore(() => ({
		entity: new UserEntity({ username }, schema)
	}));

	const queryString = useQueryString();
	const token = queryString.get('token');

	const [secondsLeft, setSecondsLeft] = useState(SECONDS_TO_REDIRECT);
	const interval = useRef<NodeJS.Timer | null>(null);

	return (
		<UnloggedLayout extraClassnames={[styles.verify]}>
			<PasswordChangerRequestForm
				onFinish={() => {
					interval.current = setInterval(() => {
						let shouldKill = false;
						setSecondsLeft((curr) => {
							if (curr <= 1) {
								shouldKill = true;
							}
							return curr - 1;
						});
						if (shouldKill) {
							if (interval.current) clearInterval(interval.current);
							history.push('/');
						}
					}, 1000);
				}}
			/>
		</UnloggedLayout>
	);
};

export default PasswordResetRequest;
