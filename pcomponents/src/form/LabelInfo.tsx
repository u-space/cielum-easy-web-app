import classnames from 'classnames';
import styles from '../Kanpur.module.scss';
import { Icon } from '@blueprintjs/core';
import { FC } from 'react';

interface LabelInfoProps {
	isRequired?: boolean;
	isHidden?: boolean;
	labelInfo?: string;
}

const LabelInfo: FC<LabelInfoProps> = ({ isRequired, isHidden, labelInfo = '' }) => {
	return (
		<span className={styles.labelinfo}>
			{isRequired && (
				<Icon
					className={classnames(styles.icon, { [styles.hidden]: isHidden })}
					icon="asterisk"
					iconSize={8}
				/>
			)}
			{labelInfo}
		</span>
	);
};
export default LabelInfo;
