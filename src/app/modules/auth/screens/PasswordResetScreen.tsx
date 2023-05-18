import PModal, { PModalType } from '@pcomponents/PModal';
import { UserEntity } from '@utm-entities/user';
import { useLocalStore } from 'mobx-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import PasswordChanger from '../../core_service/user/components/PasswordChanger';
import styles from '../auth.module.scss';
import { useSchemaStore } from '../../schemas/store';
import UnloggedLayout from '../layouts/UnloggedLayout';
import { useQueryString } from '../../../utils';

const SECONDS_TO_REDIRECT = 5;

const PasswordResetScreen = () => {
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

	if (!token) {
		return (
			<UnloggedLayout>
				<PModal
					type={PModalType.ERROR}
					title={t('Error while loading')}
					content={t('No token provided')}
					primary={{ onClick: () => history.push('/') }}
				/>
			</UnloggedLayout>
		);
	} else {
		return (
			<UnloggedLayout extraClassnames={[styles.verify]}>
				<>
					{secondsLeft === SECONDS_TO_REDIRECT && (
						<PasswordChanger
							ls={ls}
							forceShow
							token={token}
							isCreating={false}
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
					)}
					{secondsLeft < SECONDS_TO_REDIRECT && (
						<>
							<h1>{t('Password change successful')}</h1>
							<p>
								{t('You will be redirected to the log-in screen in Xs', {
									x: secondsLeft
								})}
							</p>
						</>
					)}
				</>
			</UnloggedLayout>
		);
	}
};

export default PasswordResetScreen;
