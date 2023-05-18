import { observer } from 'mobx-react';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useUpdateCoordinator } from '../hooks';
import { useQueryString } from '../../../../utils';
import { CoordinatorEntity } from '@flight-request-entities/coordinator';
import NewEntity from '../../../../commons/pages/NewEntity';
import { useAuthIsAdmin } from '../../../auth/store';
import ViewAndEditCoordinator from '../pages/ViewAndEditCoordinator';
import { useLs } from '../../../../commons/utils';
import { UseMutationResult } from 'react-query';

const NewCoordinatorScreen = () => {
	const queryString = useQueryString();

	const isAdmin = useAuthIsAdmin();

	const history = useHistory();
	const id = queryString.get('geographical-zone');

	const registerCoordinator = useUpdateCoordinator();
	const data = registerCoordinator.data?.data;

	const ls = useLs<CoordinatorEntity>(new CoordinatorEntity({}));

	useEffect(() => {
		if (id) {
			ls.setInfo('geographical_zone', id);
		}
	}, [id, ls]);

	const onClickFinished = () =>
		history.push(data ? `/coordinators?id=${data.id}` : '/coordinators');
	const finishedText = data ? `${data.email}` : '';

	// noinspection JSObjectNullOrUndefined
	return (
		<NewEntity
			ls={ls}
			entityComponent={ViewAndEditCoordinator}
			componentProps={{ isAdmin: isAdmin }}
			entity={'coordinator'}
			isLoading={false}
			finishedText={finishedText}
			mutation={registerCoordinator as UseMutationResult}
			onClickFinished={onClickFinished}
		/>
	);
};

export default observer(NewCoordinatorScreen);
