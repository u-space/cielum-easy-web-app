import { FC, ReactNode } from 'react';
import styles from './QuickLaunchButtonsLayout.module.scss';
import { useTranslation } from 'react-i18next';
import { Icon, IconName } from '@blueprintjs/core';
import { useHistory } from 'react-router-dom';
import { useAuthIsAdmin } from '../../modules/auth/store';

export interface QuickLaunchButton {
	label: string;
	icon: IconName;
	path: string; // Relative to / (root)
	isAdmin: boolean;
}
interface QuickLaunchButtonsProps {
	title: string;
	subheader?: ReactNode;
	buttons: QuickLaunchButton[];
}

const QuickLaunchButtonsLayout: FC<QuickLaunchButtonsProps> = ({ title, subheader, buttons }) => {
	const { t } = useTranslation();
	const history = useHistory();
	const isAdmin = useAuthIsAdmin();
	return (
		<div className={styles.horizontal_usecases}>
			<div className={styles.title}>{t(title) || title}</div>
			{subheader && <div className={styles.subheader}>{subheader}</div>}
			{buttons.map((button, index) => {
				if ((button.isAdmin && isAdmin) || !button.isAdmin) {
					return (
						<div
							key={button.label}
							className={styles.item}
							onClick={() => history.push(button.path)}
						>
							<div>
								<Icon icon={button.icon} size={64} />
							</div>
							<div>{t(button.label) || button.label}</div>
						</div>
					);
				} else {
					return null;
				}
			})}
		</div>
	);
};

export default QuickLaunchButtonsLayout;
