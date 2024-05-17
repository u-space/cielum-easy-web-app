import { Tooltip2 } from '@blueprintjs/popover2';
import { ReactNode } from 'react';
import styles from './Kanpur.module.scss';

export interface PTooltipProps {
	children: ReactNode;
	content: string;
	placement?: 'left' | 'right' | 'top' | 'bottom';
}

const PTooltip = ({ children, content, placement }: PTooltipProps) => {
	return (
		<Tooltip2
			content={<span className={styles.tooltip}>{content}</span>}
			openOnTargetFocus={false}
			placement={placement ? placement : 'bottom'}
			usePortal
			minimal={true}
		>
			{children}
		</Tooltip2>
	);
};

export default PTooltip;
