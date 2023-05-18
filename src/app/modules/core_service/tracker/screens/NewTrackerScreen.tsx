import { observer, useLocalStore } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { useMutation, UseMutationResult } from 'react-query';
import { useHistory } from 'react-router-dom';
import { TrackerEntity } from '@utm-entities/tracker';
import { useLs } from '../../../../commons/utils';
import { useUpdateTracker } from '../hooks';
import NewEntity from '../../../../commons/pages/NewEntity';
import ViewAndEditTracker from '../pages/ViewAndEditTracker';

const NewTrackerScreen = () => {
	const history = useHistory();
	const { t } = useTranslation();

	const ls = useLs<TrackerEntity>(new TrackerEntity({}));
	const registerTracker = useUpdateTracker();
	const data = registerTracker.data?.data;

	const onClickFinished = () => history.push(data ? `/trackers?id=${data.hardware_id}` : '');
	const finishedText = data ? t('The tracker x has been created', { x: data.hardware_id }) : '';

	// noinspection JSObjectNullOrUndefined
	return (
		<NewEntity
			ls={ls}
			entityComponent={ViewAndEditTracker}
			entity={'tracker'}
			finishedText={finishedText}
			mutation={registerTracker as UseMutationResult}
			onClickFinished={onClickFinished}
		/>
	);
};

export default observer(NewTrackerScreen);
