import DashboardLayout from '../layouts/DashboardLayout';
import { FC } from 'react';
import styles from './SimpleStaticInformation.module.scss';
import { Icon } from '@blueprintjs/core';
import { BlueprintIcons_16Id } from '@blueprintjs/icons/lib/esnext/generated-icons/16px/blueprint-icons-16';

interface SimpleStaticInformationProps {
	title: string;
	icon: string; // IconName, blueprint
	text: string;
}

const SimpleInfoScreen: FC<SimpleStaticInformationProps> = ({ title, icon, text }) => {
	return (
		<DashboardLayout>
			<div className={styles.simple_screen}>
				<div className={styles.icon}>
					<Icon icon={icon as BlueprintIcons_16Id} iconSize={96} />
				</div>
				<div className={styles.content}>
					<h1>{title}</h1>
					<p>{text}</p>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default SimpleInfoScreen;
