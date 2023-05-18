import { TokyoPick } from '@tokyo/TokyoTypes';
import { RouteComponentProps } from 'react-router-dom';

export const selectEntity = (pick: TokyoPick, history: RouteComponentProps['history']) => {
	const prev = history.location.pathname;
	history.push(
		pick.volume
			? `/map?${pick.type}=${pick.id}&volume=${pick.volume}&prev=${prev}`
			: `/map?${pick.type}=${pick.id}&prev=${prev}`
	);
};
