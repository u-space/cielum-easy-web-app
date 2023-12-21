import { useEffect } from 'react';
import { useMutation } from 'react-query';
import { useHistory, useLocation } from 'react-router-dom';
import PModal, { PModalType } from '@pcomponents/PModal';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@blueprintjs/core';
import { useFlightRequestServiceAPI } from '../../../../utils';
import DashboardLayout from '../../../../commons/layouts/DashboardLayout';
import { AxiosError, AxiosResponse } from 'axios';

const SuccessScreen = () => {
	// get sessionId query param from url
	const { t } = useTranslation();
	const { search } = useLocation();
	const sessionId = new URLSearchParams(search).get('session_id');
	const history = useHistory();

	const {
		flightRequest: { saveFlightRequestPostPayment }
	} = useFlightRequestServiceAPI();

	const finishAction = useMutation<AxiosResponse<{ id: string }>, AxiosError, void>(
		[sessionId],
		async () => {
			if (!sessionId) {
				throw Error('Missing sessionId');
			}
			return saveFlightRequestPostPayment(sessionId);
		}
	);
	const error = finishAction.error;
	useEffect(() => {
		if (finishAction.isIdle) finishAction.mutate();
	}, [sessionId]);

	return (
		<DashboardLayout isLoading={false}>
			{finishAction.isLoading && (
				<PModal
					type={PModalType.INFORMATION}
					title={t('Please wait')}
					content={
						<>
							<p>
								{t(
									'Please wait while we contact the payment server, which usually takes approximately 1 minute'
								)}
							</p>
							<Spinner />
						</>
					}
				/>
			)}
			{finishAction.isSuccess && (
				<PModal
					type={PModalType.SUCCESS}
					title={t('Success')}
					content={<p>{t('Your payment was successful')}</p>}
					primary={{
						onClick: () => {
							history.push('/flight-requests?id=' + finishAction.data?.data?.id);
						}
					}}
				/>
			)}
			{finishAction.isError && (
				<PModal
					type={PModalType.ERROR}
					title={t('An error occured!')}
					content={<p>{error?.message}</p>}
					primary={{
						onClick: () => {
							history.push('/map');
						}
					}}
				/>
			)}
		</DashboardLayout>
	);
};

export default SuccessScreen;
