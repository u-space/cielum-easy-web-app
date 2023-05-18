import styles from '../../Layouts.module.scss';
import { FC, ReactNode } from 'react';

interface ContextualProps {
	isLoading?: boolean;
	children: ReactNode;
}

const Contextual: FC<ContextualProps> = ({ isLoading = false, children }) => {
	// TODO: AnimatePresence
	if (children && !isLoading) {
		return <aside className={styles.contextual}>{children}</aside>;
	} else {
		return null;
	}
};

export default Contextual;
