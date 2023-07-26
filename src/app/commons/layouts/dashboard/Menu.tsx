import { Spinner } from '@blueprintjs/core';
import styles from '../../Layouts.module.scss';
import { FC, ReactNode } from 'react';

interface MenuProps {
	children: ReactNode;
	isLoading?: boolean;
}

const Menu: FC<MenuProps> = ({ isLoading, children }) => {
	return (
		<>
			<aside className={styles.menu}>
				<div className={styles.content}>{children}</div>
			</aside>
			{isLoading && (
				<div className={styles.blocking}>
					<Spinner />
				</div>
			)}
		</>
	);
};

export default Menu;
