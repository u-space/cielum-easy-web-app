import { observer } from 'mobx-react';
import { useHistory } from 'react-router-dom';
import { UserEntity } from '@utm-entities/user';
import { SchemaStatus, useSchemaStore } from '../../../schemas/store';
import { useAuthIsAdmin } from '../../../auth/store';
import NewEntity from '../../../../commons/pages/NewEntity';
import ViewAndEditUser from '../pages/ViewAndEditUser';
import { useUpdateUser } from '../hooks';
import { useLs } from '../../../../commons/utils';
import { UseMutationResult } from 'react-query';

const NewUserScreen = () => {
	const history = useHistory();

	const schema = useSchemaStore((state) => state.users);
	const schemaStoreStatus = useSchemaStore((state) => state.status);

	const registerUser = useUpdateUser();
	const data = registerUser.data?.data;

	const isAdmin = useAuthIsAdmin();
	const ls = useLs<UserEntity>(new UserEntity({}, schema));

	const onClickFinished = data
		? () => history.push(`/users?id=${data.username}`)
		: () => {
			history.push(`/users`)
		};
	const finishedText = data ? data.username : '';

	return (
		<NewEntity
			ls={ls}
			entityComponent={ViewAndEditUser}
			componentProps={{ isAbleToChangeRole: isAdmin }}
			entity={'user'}
			isLoading={schemaStoreStatus !== SchemaStatus.FETCHED}
			finishedText={finishedText}
			mutation={registerUser as UseMutationResult}
			onClickFinished={onClickFinished}
		/>
	);
};

export default observer(NewUserScreen);
