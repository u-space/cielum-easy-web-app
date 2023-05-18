import { FC, ReactNode } from 'react';
import CardGroup from './CardGroup';
import styles from './PermanentItem.module.scss';
import PButton, { PButtonProps } from '@pcomponents/PButton';

export const PermanentItemButton: FC<PButtonProps> = (props) => {
	return <PButton className={styles.button} {...props} />;
};

const PermanentItem: FC<{ children: ReactNode; extra?: ReactNode }> = ({ children, extra }) => {
	return (
		<CardGroup extraClassNames={styles.permanent}>
			<div className={styles.row}>{children}</div>
			{extra}
		</CardGroup>
	);
};

export default PermanentItem;
