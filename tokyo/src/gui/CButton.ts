import type { CTooltipProps } from './CTooltip';
import type { CSize } from './CSizeWrapper';

export enum CButtonVariant {
	PRIMARY = 'Primary',
	SECONDARY = 'Secondary',
	DANGER = 'Danger'
}

export interface CButtonProps {
	variant?: CButtonVariant;
	size?: CSize;
	disabled?: boolean;
	icon?: string; // Search for icon name in https://icon-sets.iconify.design/ph/ (https://phosphoricons.com/)
	iconLocation?: 'left' | 'right';
	id?: string;
	tooltip?: Partial<CTooltipProps>;
	fill?: boolean;
}
