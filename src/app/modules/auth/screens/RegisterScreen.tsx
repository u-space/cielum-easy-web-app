import { observer } from 'mobx-react';
import { FormEvent, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { useMutation } from 'react-query';
import PButton, { PButtonSize, PButtonType } from '@pcomponents/PButton';
import { UserEntity } from '@utm-entities/user';
import pagesStyles from '../../../commons/Pages.module.scss';
import styles from '../auth.module.scss';
import ViewAndEditUser from '../../core_service/user/pages/ViewAndEditUser';
import { useSchemaStore } from '../../schemas/store';
import { CoreAPIContext, getAssetPath } from '../../../utils';
import { AxiosError, AxiosResponse } from 'axios';
import { translateErrors } from '@utm-entities/_util';
import UnloggedLayout from '../layouts/UnloggedLayout';
import StatusLayout from '../layouts/StatusLayout';
import env from '../../../../vendor/environment/env';
import { Spinner } from '@blueprintjs/core';
import styled from 'styled-components';
import { useLs } from '../../../commons/utils';

const Centered = styled.div`
	margin: 4rem;
`;

const TermsAndConditions = () => {
	const {
		t,
		i18n: { language }
	} = useTranslation();

	const [terms, setTerms] = useState('');

	useEffect(() => {
		const importTerms = async () => {
			try {
				// Fetch the privacy policy getAssetPath('privacy_policy')
				const termsFile = await fetch(
					getAssetPath(env.tenant.assets.privacy_policy[language])
				);
				setTerms(await termsFile.text());
			} catch (e) {
				throw new Error('No privacy policy found for language ' + language + '.');
			}
		};
		importTerms().catch(console.error);
	}, [language]);

	return (
		<div
			className={pagesStyles.twobytwo}
			style={{
				position: 'absolute',
				height: 'auto',
				bottom: '4rem',
				width: 'auto',
				left: '1rem',
				top: '1rem'
			}}
		>
			<aside className={pagesStyles.summary}>
				<h2>{t('Terms and conditions')}</h2>
				{/* {t('Terms and conditions explanation')} */}
			</aside>
			<section className={pagesStyles.details}>
				{/* TODO: Leer de un endpoint */}
				{terms === '' && (
					<Centered>
						<Spinner />
					</Centered>
				)}
				<ReactMarkdown linkTarget="_blank">{terms}</ReactMarkdown>
			</section>
		</div>
	);
};

enum RegisterScreenStep {
	ERROR_SCREEN = -1,
	FORM_SCREEN = 0,
	CONSENT_SCREEN = 1,
	SUBMITTING_SCREEN = 2
}

const RegisterScreen = () => {
	const { t } = useTranslation();
	const [step, setStep] = useState<RegisterScreenStep>(RegisterScreenStep.FORM_SCREEN);
	const [error, setError] = useState<string | null>(null);

	const schema = useSchemaStore((state) => state.users);
	const docSchema = useSchemaStore((state) => state.documents);

	const ls = useLs<UserEntity>(new UserEntity(null, schema));

	const {
		user: { saveUser }
	} = useContext(CoreAPIContext);

	const registerUser = useMutation<
		AxiosResponse<void>,
		AxiosError<{ message?: string }>,
		UserEntity
	>((user: UserEntity) => saveUser(user, false, true));

	const nextStep = (event?: FormEvent<HTMLFormElement>) => {
		if (event) event.preventDefault();
		if (step === RegisterScreenStep.FORM_SCREEN) {
			const errors = ls.entity.validate();

			if (errors.length > 0) {
				setError(translateErrors(errors, 'user')[0]);
				setStep(RegisterScreenStep.ERROR_SCREEN);
			} else {
				setStep(1);
			}
		} else if (step === RegisterScreenStep.CONSENT_SCREEN) {
			setStep(RegisterScreenStep.SUBMITTING_SCREEN);
			registerUser.mutate(ls.entity);
		}
	};

	return (
		<UnloggedLayout extraClassnames={[styles.register]}>
			{step === RegisterScreenStep.ERROR_SCREEN && (
				<StatusLayout isError>
					<h1>{t('Invalid data entered')}</h1>
					<p>{error ? t(error) : t('Unknown error')}</p>
				</StatusLayout>
			)}
			<ViewAndEditUser
				ls={ls}
				isEditing={true}
				isCreating={true}
				isAbleToChangeRole={false}
				isAbleToAddDocuments={false}
				style={{ opacity: step === 0 ? '1' : '0' }}
			/>
			{step === RegisterScreenStep.CONSENT_SCREEN && <TermsAndConditions />}
			{step === RegisterScreenStep.SUBMITTING_SCREEN && (
				<StatusLayout isError={registerUser.isError} isSuccess={registerUser.isSuccess}>
					{registerUser.isLoading && <h1>{t('Creating your user')}...</h1>}
					{registerUser.isSuccess && (
						<>
							<h1>{t('User created!')}</h1>
							<p>
								{t(
									'Please confirm your e-mail by clicking in the link you received in it'
								)}
							</p>
						</>
					)}
					{registerUser.isError && (
						<>
							<h1>{t('An error occurred saving your user!')}</h1>
							<p>
								{t(
									registerUser.error.response?.data?.message?.split(':')[0] ||
									registerUser.error.message
								)}
								<PButton
									style={{ margin: '8px auto' }}
									icon={'info-sign'}
									size={PButtonSize.SMALL}
									onClick={() =>
										alert(
											registerUser.error.response?.data?.message?.split(
												':'
											)[1] || registerUser.error.message
										)
									}
								>
									{t('More details')}
								</PButton>
							</p>
						</>
					)}
				</StatusLayout>
			)}
			<section className={styles.actions}>
				{(step === RegisterScreenStep.ERROR_SCREEN ||
					step === RegisterScreenStep.CONSENT_SCREEN ||
					(step === RegisterScreenStep.SUBMITTING_SCREEN && registerUser.isError)) && (
						<PButton
							onClick={() => {
								setStep(RegisterScreenStep.FORM_SCREEN);
							}}
						>
							{step === RegisterScreenStep.ERROR_SCREEN && t('Back')}
							{step === RegisterScreenStep.CONSENT_SCREEN && t('Back')}
							{step === RegisterScreenStep.SUBMITTING_SCREEN && t('Back')}
						</PButton>
					)}
				{step >= RegisterScreenStep.FORM_SCREEN &&
					step <= RegisterScreenStep.CONSENT_SCREEN && (
						<PButton style={{ marginLeft: 'auto' }} onClick={() => nextStep()}>
							{step === 0 && t('Next')}
							{step === 1 && t('Accept')}
						</PButton>
					)}
				{step === RegisterScreenStep.CONSENT_SCREEN && (
					<PButton
						style={{ marginLeft: 4 }}
						variant={PButtonType.DANGER}
						onClick={() =>
							alert(
								'La aplicación no puede ser usada sin aceptar los términos y condiciones'
							)
						}
					>
						{t('Reject')}
					</PButton>
				)}
			</section>
		</UnloggedLayout>
	);
};

export default observer(RegisterScreen);
