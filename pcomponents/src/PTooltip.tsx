import { Tooltip2 } from '@blueprintjs/popover2';
import { ReactNode } from 'react';
import styles from './Kanpur.module.scss';

export interface PTooltipProps {
	children: ReactNode;
	content: string;
}

const PTooltip = ({ children, content }: PTooltipProps) => {
	return (
		<Tooltip2
			content={<span className={styles.tooltip}>{content}</span>}
			openOnTargetFocus={false}
			placement="bottom"
			usePortal
			minimal={true}
		>
			{children}
		</Tooltip2>
	);
};

export default PTooltip;
