import { Checkbox } from '@blueprintjs/core';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import FilterAndOrderSearchTools from '../../../../commons/components/hubs/FilterAndOrderSearchTools';
import CardGroup from '../../../../commons/layouts/dashboard/menu/CardGroup';
import { shallow } from 'zustand/shallow';
import { UserVerificationState, useUserStore } from '../store';

const UserSearchToolsExtras = () => {
	const { t } = useTranslation(['ui', 'glossary']);
	const history = useHistory();
	const store = useUserStore(
		(state) => ({
			filterMatchingText: state.filterMatchingText,
			filterProperty: state.filterProperty,
			setFilterByText: state.setFilterByText,
			setFilterProperty: state.setFilterProperty,
			sortingProperty: state.sortingProperty,
			setSortingOrder: state.setSortingOrder,
			setSortingProperty: state.setSortingProperty,
			sortingOrder: state.sortingOrder,
			filterStatus: state.filterStatus,
			setFilterStatus: state.setFilterStatus
		}),
		shallow
	);

	return (
		<CardGroup header="Filter by type">
			{/* TODO: Replace by generic PCheckbox */}
			<Checkbox
				style={{
					display: 'flex',
					justifyContent: 'flex-start',
					alignItems: 'center'
				}}
				label={t('Show only unauthorized')}
				checked={store.filterStatus === UserVerificationState.UNVERIFIED}
				onChange={(evt) => {
					if (evt.currentTarget.checked) {
						store.setFilterStatus(UserVerificationState.UNVERIFIED);
						history.replace(`/users?status=${UserVerificationState.UNVERIFIED}`);
					} else {
						store.setFilterStatus(UserVerificationState.ALL);
						history.replace('/users');
					}
				}}
			/>
			<Checkbox
				style={{
					display: 'flex',
					justifyContent: 'flex-start',
					alignItems: 'center'
				}}
				label={t('Show only pilots')}
				checked={store.filterMatchingText === 'PILOT' && store.filterProperty === 'role'}
				onChange={(evt) => {
					if (evt.currentTarget.checked) {
						store.setFilterByText('PILOT');
						store.setFilterProperty('role');
					} else {
						store.setFilterByText('');
						store.setFilterProperty('');
					}
				}}
			/>
			<Checkbox
				style={{
					display: 'flex',
					justifyContent: 'flex-start',
					alignItems: 'center'
				}}
				label={t('Show only admins')}
				checked={store.filterMatchingText === 'ADMIN' && store.filterProperty === 'role'}
				onChange={(evt) => {
					if (evt.currentTarget.checked) {
						store.setFilterByText('ADMIN');
						store.setFilterProperty('role');
					} else {
						store.setFilterByText('');
						store.setFilterProperty('');
					}
				}}
			/>
		</CardGroup>
	);
};

const UserSearchTools: FC = () => {
	return (
		<FilterAndOrderSearchTools
			useStore={useUserStore}
			entityName={'user'}
			searchableProps={['firstName', 'lastName', 'email']}
			orderableProps={['firstName', 'lastName', 'email', 'createdAt', 'updatedAt']}
			extra={UserSearchToolsExtras}
		/>
	);
};

export default UserSearchTools;
