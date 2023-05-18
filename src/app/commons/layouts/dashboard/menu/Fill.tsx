import styles from '../../../Layouts.module.scss';
import { ReactNode } from 'react';
const Fill = ({ children }: { children: ReactNode }) => {
	return <div className={styles.full}>{children}</div>;
};
export default Fill;
