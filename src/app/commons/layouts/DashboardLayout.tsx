import styles from '../Layouts.module.scss';
import Center from './dashboard/Center';
import Menu from './dashboard/Menu';
import { FC, ReactNode } from 'react';
import NotificationCenter from '../../modules/notification/components/NotificationCenter';

interface DashboardLayoutProps {
	children: ReactNode;
	isLoading?: boolean;
	menu?: ReactNode;
	overlay?: ReactNode;
	options?: {
		center?: {
			hasPadding?: boolean;
		};
	};
}
const DashboardLayout: FC<DashboardLayoutProps> = ({
	isLoading,
	options,
	children,
	menu,
	overlay
}) => {
	return (
		<>
			<Center
				isLoading={isLoading}
				hasPadding={options?.center?.hasPadding}
				style={menu ? undefined : { gridArea: '1 / 2 / 2 / -1' }}
			>
				{children}
				{overlay && <div className={styles.overlay}>{overlay}</div>}
				<NotificationCenter />
			</Center>
			{menu && <Menu>{menu}</Menu>}
		</>
	);
};

export default DashboardLayout;
