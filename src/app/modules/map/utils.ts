import { TokyoPick } from '@tokyo/TokyoTypes';
import { RouteComponentProps } from 'react-router-dom';

export const selectEntity = (pick: TokyoPick, history: RouteComponentProps['history']) => {
	const prev = history.location.pathname;
	history.push(
		pick.volume
			? `${prev}?${pick.type}=${pick.id}&volume=${pick.volume}&prev=${prev}`
			: `${prev}?${pick.type}=${pick.id}&prev=${prev}`
	);
};
