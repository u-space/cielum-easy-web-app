import PButton from '@pcomponents/PButton';
import { AxiosResponse } from 'axios';
import { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import styles from '../auth.module.scss';
import UnloggedLayout from '../layouts/UnloggedLayout';
import { CoreAPIContext } from '../../../utils';

const VerificationScreen = () => {
	const history = useHistory();
	const { t } = useTranslation();
	const { username } = useParams<{ username: string }>();
	const location = useLocation();
	const validationToken = location.search.split('?token=')[1];
	const [secondsLeft, setSecondsLeft] = useState(10);
	const interval = useRef<NodeJS.Timer | null>(null);
	const {
		user: { verifyUser }
	} = useContext(CoreAPIContext);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const mutation = useMutation<AxiosResponse<any>, void, { username: string; token: string }>(
		({ username, token }) => verifyUser(username, validationToken),
		{
			onSuccess: () => {
				if (!interval.current) {
					interval.current = setInterval(() => {
						setSecondsLeft((curr) => {
							if (curr <= 1) {
								if (interval.current) clearInterval(interval.current);
								history.push('/');
							}

							return curr - 1;
						});
					}, 1000);
				}
			}
		}
	);

	useEffect(() => {
		mutation.mutate({ username, token: validationToken });
		// TODO: Revise if I need to return something to cancel this query
	}, []);

	return (
		<UnloggedLayout extraClassnames={[styles.verify]}>
			<>
				{mutation.isLoading && <h1>{t('Confirming your user')}...</h1>}
				{mutation.isError && (
					<>
						<h1>{t('An error occurred confirming your user!')}</h1>
						{!validationToken && <p>{t('Invalid verification link')}</p>}
					</>
				)}
				{mutation.isSuccess && (
					<>
						<h1>{t('User confirmed!')}</h1>
						<p>
							{t('You will be redirected to the log-in screen in Xs', {
								x: secondsLeft
							})}
						</p>
						<PButton
							onClick={() => {
								history.push('/');
							}}
						>
							{t('Go back to the log-in screen')}
						</PButton>
					</>
				)}
			</>
		</UnloggedLayout>
	);
};

export default VerificationScreen;
