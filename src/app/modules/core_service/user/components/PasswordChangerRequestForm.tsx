import PButton from '@pcomponents/PButton';
import PInput from '@pcomponents/PInput';
import PModal, { PModalType } from '@pcomponents/PModal';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useAuthStore } from 'src/app/modules/auth/store';

interface PasswordChangerProps {
	onFinish?: () => void;
}

const PasswordChangerRequestForm: FC<PasswordChangerProps> = ({ onFinish = null }) => {
	const { t } = useTranslation();
	const [error, setError] = useState<string | null>(null);
	const [email, setEmail] = useState<string>('emialonzo@gmail.com');

	const reset = useAuthStore((state) => state.reset);

	return (
		<>
			<h1>{t('Change password')}!</h1>
			<OneLine>
				<>
					<PInput
						id={'email'}
						onChange={(value) => {
							console.log(value);
							setEmail(value);
						}}
						type="email"
						label={t('email')}
						autoComplete="email"
						isDarkVariant
						minLength={5}
						defaultValue={email}
					>
						<p style={{ color: 'var(--ramen-500)' }}>
							{t('Your password must have atleast 9 characters')}
						</p>
					</PInput>
					<PButton
						style={{ margin: '1rem auto' }}
						onClick={() => {
							if (email) {
								reset(
									email,
									() => {
										setError(null);
									},
									(error) => {
										setError(error);
									}
								);
							}
						}}
					>
						{t('Recover password')}
					</PButton>
				</>
				{error && (
					<PModal
						type={PModalType.ERROR}
						title={t('Error while saving')}
						content={error}
						primary={{ onClick: () => console.log('error') }}
					/>
				)}
			</OneLine>
		</>
	);
};

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

export default PasswordChangerRequestForm;
