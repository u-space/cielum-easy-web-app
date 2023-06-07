import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import styles from '../Layouts.module.scss';
import { getAssetPath, getCSSVariable, setCSSVariable } from '../../utils';
import BarItems from './master/BarItems';
import env from '../../../vendor/environment/env';

interface MasterLayoutProps {
	children: ReactNode;
}

const defaultBarWidth = getCSSVariable('bar-width');
const extendedBarWidth = getCSSVariable('bar-width-extended');

const MasterLayout: FC<MasterLayoutProps> = ({ children }) => {
	const [isExtended, setExtendedFlag] = useState(false);
	const increaseBarWidth = () => {
		setExtendedFlag(true);
		setCSSVariable('bar-width', extendedBarWidth);
	};
	const resetBarWidth = () => {
		setExtendedFlag(false);
		setCSSVariable('bar-width', defaultBarWidth);
	};

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
				{!isExtended && (
					<img
						src={getAssetPath(env.tenant.assets.logo)}
						alt="logo"
						style={{ width: 200, transform: 'translateX(-25%) scale(0.75)' }}
					/>
				)}
				{isExtended && (
					<img
						src={getAssetPath(env.tenant.assets.logo)}
						alt="logo"
						style={{ width: 200 }}
					/>
				)}
				<BarItems />
			</aside>
		</section>
	);
};

export default MasterLayout;
