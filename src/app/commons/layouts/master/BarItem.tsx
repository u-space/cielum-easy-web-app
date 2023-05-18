import { FC } from 'react';
import { useAuthStore } from '../../../modules/auth/store';
import classnames from 'classnames';
import styles from '../../Layouts.module.scss';
import { Icon } from '@blueprintjs/core';
import _ from 'lodash';
import { BlueprintIcons_16Id } from '@blueprintjs/icons/lib/esnext/generated-icons/16px/blueprint-icons-16';

interface MasterBarItemProps {
	icon: string;
	label: string;
	spaceTop?: boolean;
	isActive?: boolean;
	roles?: string[];
	onClick: () => void;
}
const BarItem: FC<MasterBarItemProps> = ({
	icon,
	label,
	spaceTop = false,
	isActive = false,
	roles = [],
	onClick
}) => {
	const role = useAuthStore((state) => state.role);

	if (_.includes(roles, role)) {
		return (
			<div
				className={classnames(styles.item, {
					[styles.leaveSpaceBetweenLastAndThisHorizontal]: spaceTop,
					[styles.active]: isActive
				})}
				onClick={onClick}
			>
				<Icon
					className={classnames(styles.icon, { [styles.active]: isActive })}
					icon={icon as BlueprintIcons_16Id}
					iconSize={18}
				/>
				<p>{label}</p>
			</div>
		);
	} else {
		return null;
	}
};

export default BarItem;
