import { FC, ReactNode } from 'react';
import styles from '../Layouts.module.scss';
import { getCSSVariable, setCSSVariable } from '../../utils';
import BarItems from './master/BarItems';

interface MasterLayoutProps {
	children: ReactNode;
}

const defaultBarWidth = getCSSVariable('bar-width');
const extendedBarWidth = getCSSVariable('bar-width-extended');

const MasterLayout: FC<MasterLayoutProps> = ({ children }) => {
	const increaseBarWidth = () => setCSSVariable('bar-width', extendedBarWidth);
	const resetBarWidth = () => setCSSVariable('bar-width', defaultBarWidth);

	return (
		<section className={styles.master}>
			{children}
			<aside
				className={styles.bar}
				onMouseEnter={() => increaseBarWidth()}
				onMouseLeave={() => {
					resetBarWidth();
				}}
			>
				<BarItems />
			</aside>
		</section>
	);
};

export default MasterLayout;
