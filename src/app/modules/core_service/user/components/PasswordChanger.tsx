import { Spinner } from '@blueprintjs/core';
import PButton from '@pcomponents/PButton';
import PInput from '@pcomponents/PInput';
import PModal, { PModalType } from '@pcomponents/PModal';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
	const { t } = useTranslation();
	const [showFields, setShowFields] = useState(isCreating || forceShow);
	const [error, setError] = useState<string | null>(null);

	const PASSWORD_CHANGE_EXPIRED_ERROR = t('The password change link has expired');

	const updateUserPassword = useUpdateUserPassword();
	const updateUserPasswordByToken = useUpdateUserPasswordByToken();

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
		if (!token) {
			updateUserPassword.mutate({
				username: ls.entity.username,
				password: ls.entity.password
			});
		} else {
			updateUserPasswordByToken.mutate({
				email: ls.entity.email,
				token,
				password: ls.entity.password
			});
		}
	};

	const resetError = () => {
		setError(null);
		updateUserPassword.reset();
	};

	useEffect(() => {
		if (updateUserPassword.isError) {
			setError(PASSWORD_CHANGE_EXPIRED_ERROR);
		}
	}, [updateUserPassword.isError, PASSWORD_CHANGE_EXPIRED_ERROR]);

	useEffect(() => {
		if (updateUserPassword.isSuccess) {
			if (onFinish) onFinish();
		}
	}, [updateUserPassword.isSuccess, onFinish]);

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
			{updateUserPassword.isLoading && <Spinner />}
			{!updateUserPassword.isLoading && showFields && (
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
			{!updateUserPassword.isLoading && !showFields && (
				<CenteredLine>
					{updateUserPassword.isLoading && <Spinner />}
					{updateUserPassword.isSuccess && (
						<PModal
							type={PModalType.SUCCESS}
							title={t('Password change successful')}
							content={t(
								'The password has been successful and the new password can now be used to log-in'
							)}
							primary={{ onClick: resetError }}
						/>
					)}
					{!updateUserPassword.isLoading && !updateUserPassword.isSuccess && (
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
