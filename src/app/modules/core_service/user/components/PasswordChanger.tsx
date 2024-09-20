import { Spinner } from '@blueprintjs/core';
import PButton from '@pcomponents/PButton';
import PInput from '@pcomponents/PInput';
import PModal, { PModalType } from '@pcomponents/PModal';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { useUpdateUserPassword, useUpdateUserPasswordByToken } from '../hooks';

interface PasswordChangerProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	ls: any;
	token: string;
	isCreating: boolean;
	forceShow?: boolean;
	onFinish?: () => void;
}

const PasswordChanger: FC<PasswordChangerProps> = ({
	ls,
	token,
	isCreating,
	forceShow = false,
	onFinish = null
}) => {
	const history = useHistory();
	const { t } = useTranslation();
	const [showFields, setShowFields] = useState(isCreating || forceShow);
	const [error, setError] = useState<string | null>(null);

	const PASSWORD_CHANGE_EXPIRED_ERROR = t('The password change link has expired');

	// const updateUserPasswordByToken = useUpdateUserPasswordByToken();
	// const updateUserPasswordByToken = useUpdateUserPassword();

	let updateUserPasswordByToken: any;
	if (token && token.length > 0) {
		updateUserPasswordByToken = useUpdateUserPasswordByToken();
	} else {
		updateUserPasswordByToken = useUpdateUserPassword();
	}

	const savePasswordUpdate = () => {
		if (!ls.entity.email) {
			setError(t('The email is required'));
		}
		if (ls.entity.password && ls.entity.password !== ls.entity._password_verification) {
			setError(t('The passwords do not match'));
			return;
		}
		if (ls.entity.password.length < 9) {
			setError(t('The password is too short'));
			return;
		}
		setShowFields(forceShow || false);

		let toUpdate: any = {
			email: ls.entity.email,
			password: ls.entity.password
		};
		if (token && token.length > 0) {
			toUpdate = {
				email: ls.entity.email,
				token,
				password: ls.entity.password
			};
		}

		updateUserPasswordByToken.mutate(toUpdate);
		// }
	};

	const resetError = () => {
		setError(null);
		updateUserPasswordByToken.reset();
	};

	useEffect(() => {
		if (updateUserPasswordByToken.isError) {
			setError(PASSWORD_CHANGE_EXPIRED_ERROR);
		}
	}, [updateUserPasswordByToken.isError, PASSWORD_CHANGE_EXPIRED_ERROR]);

	useEffect(() => {
		if (updateUserPasswordByToken.isSuccess) {
			if (onFinish) onFinish();
		}
	}, [updateUserPasswordByToken.isSuccess, onFinish]);

	const OneLine = styled.div`
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		flex-wrap: wrap;
		gap: 1rem;

		* {
			flex: 1;
			min-width: 200px;
		}
	`;

	const CenteredLine = styled.div`
		display: flex;
		justify-content: center;
		height: 100%;
		align-items: center;
	`;

	return (
		<>
			{updateUserPasswordByToken.isLoading && <Spinner />}
			{!updateUserPasswordByToken.isLoading && showFields && (
				<OneLine>
					{!error && (
						<>
							<PInput
								id={'password'}
								onChange={(value) => (ls.entity.password = value)}
								type="password"
								label={t('Password')}
								autoComplete="new-password"
								isDarkVariant
								minLength={9}
							>
								<p style={{ color: 'var(--ramen-500)' }}>
									{t('Your password must have atleast 9 characters')}
								</p>
							</PInput>
							<PInput
								id={'confirm-password'}
								onChange={(value) => (ls.entity._password_verification = value)}
								type="password"
								label={t('Verify your password')}
								autoComplete="new-password"
								isDarkVariant
							/>
						</>
					)}
					{!isCreating && !error && (
						<PButton style={{ margin: '1rem auto' }} onClick={savePasswordUpdate}>
							{t('Save')}
						</PButton>
					)}
					{error && (
						<PModal
							type={PModalType.ERROR}
							title={t('Error while saving')}
							content={error}
							primary={{ onClick: resetError }}
						/>
					)}
				</OneLine>
			)}
			{!updateUserPasswordByToken.isLoading && !showFields && (
				<CenteredLine>
					{updateUserPasswordByToken.isLoading && <Spinner />}
					{updateUserPasswordByToken.isSuccess && (
						<PModal
							type={PModalType.SUCCESS}
							title={t('Password change successful')}
							content={t(
								'The password has been successful and the new password can now be used to log-in'
							)}
							primary={{
								onClick: () => {
									resetError()
									history.push('/');
								}
							}}
						/>
					)}
					{!updateUserPasswordByToken.isLoading && !updateUserPasswordByToken.isSuccess && (
						<PButton onClick={() => setShowFields(true)}>
							{t('Change password')}
						</PButton>
					)}
				</CenteredLine>
			)}
		</>
	);
};

export default PasswordChanger;
