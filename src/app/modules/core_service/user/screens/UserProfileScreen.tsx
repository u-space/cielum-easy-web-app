import i18n from 'i18next';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import PButton from '@pcomponents/PButton';
import { PModalType } from '@pcomponents/PModal';
import { useQueryUser, useUpdateUser } from '../hooks';
import { useAuthStore } from '../../../auth/store';
import DashboardLayout from 'src/app/commons/layouts/DashboardLayout';
import PageLayout from '../../../../commons/layouts/PageLayout';
import BannerOverlay, { BannerOverlayType } from '../../../../commons/components/BannerOverlay';
import ViewAndEditUser from '../pages/ViewAndEditUser';
import { useLs } from '../../../../commons/utils';
import { UserEntity } from '@utm-entities/user';
import { DocumentEntity } from '@utm-entities/document';
import PFullModal from '@pcomponents/PFullModal';
import { translateErrors } from '@utm-entities/_util';

const UserProfile = () => {
	const { t } = useTranslation();
	const history = useHistory();

	const [loadingLogout, setLoadingLogout] = useState(false);
	const [isEditing, setEditingFlag] = useState(false);

	const username = useAuthStore((state) => state.username);
	const logout = useAuthStore((state) => state.logout);
	const query = useQueryUser(username);
	const { refetch } = query;
	const updateUser = useUpdateUser();

	const ls = useLs<UserEntity>(new UserEntity({}, {}));

	useEffect(() => {
		refetch().then();
	}, [refetch]);

	useEffect(() => {
		if (query.isSuccess) {
			ls.entity = query.data?.data;
		}
	}, [query.isSuccess, query.data?.data, ls]);

	const onLogout = async () => {
		await logout();
		const parts = window.location.href.split('/');
		const base = `${parts[0]}//${parts[2]}`;
		setLoadingLogout(true);
		window.location.href = base;
	};

	const save = () => {
		if (isEditing && ls.entity) {
			updateUser.mutate({
				entity: ls.entity,
				documents: ls.documents as Map<string, DocumentEntity>,
				isCreating: false
			});
		}
		setEditingFlag(!isEditing);
	};

	return (
		<DashboardLayout isLoading={query.isLoading || loadingLogout}>
			<PageLayout
				footer={
					isEditing ? (
						<PButton
							icon={'floppy-disk'}
							disabled={updateUser.isLoading}
							onClick={save}
						>
							{t('Save')}
						</PButton>
					) : (
						<PButton
							icon={'edit'}
							disabled={updateUser.isLoading || ls.entity.username === ''}
							onClick={() => {
								setEditingFlag(true);
							}}
						>
							{t('Edit')}
						</PButton>
					)
				}
				extraLeftHeaderButtons={
					<>
						<PButton
							onClick={() => {
								if (i18n.language.substring(0, 2) === 'es') {
									document.cookie = 'language=en';
								} else {
									document.cookie = 'language=es';
								}
								window.location.href = String(window.location.href);
							}}
						>
							{t('Change language')}
						</PButton>
						<PButton icon={isEditing ? 'floppy-disk' : 'edit'} onClick={save} />
						<PButton style={{ marginLeft: 'auto' }} icon="log-out" onClick={onLogout}>
							{t('Log out')}
						</PButton>
					</>
				}
			>
				<BannerOverlay
					type={BannerOverlayType.DANGER}
					style={{ top: 48 }}
					isVisible={updateUser.isLoading}
					text={t('Saving')}
				/>
				<BannerOverlay
					type={BannerOverlayType.SUCCESS}
					style={{ top: 48 }}
					isVisible={updateUser.isSuccess && !isEditing}
					text={t('The user was saved successfully!')}
				/>

				{ls.entity.username !== '' && (
					<ViewAndEditUser
						ls={ls}
						isEditing={isEditing}
						isCreating={false}
						isAbleToChangeRole={false}
					/>
				)}
				<PFullModal
					type={PModalType.ERROR}
					title={t('An error occurred saving your user!')}
					content={translateErrors(updateUser.error, 'user')[0]}
					isVisible={updateUser.isError}
					primary={{ onClick: () => updateUser.reset() }}
				/>
				<PFullModal
					isVisible={query.isError}
					primary={{ onClick: () => history.goBack() }}
					content={'The server is unavailable, or the profile does not exist'}
					title={'An error occured getting your information'}
				/>
			</PageLayout>
		</DashboardLayout>
	);
};

export default observer(UserProfile);
