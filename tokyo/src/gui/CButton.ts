import type { CTooltipProps } from './CTooltip';

export enum CButtonVariant {
	PRIMARY = 'Primary',
	SECONDARY = 'Secondary',
	DANGER = 'Danger'
}

export enum CButtonSize {
	EXTRA_LARGE = 'ExtraLarge',
	LARGE = 'Large',
	MEDIUM = 'Medium',
	SMALL = 'Small',
	EXTRA_SMALL = 'ExtraSmall'
}

export interface CButtonProps {
	variant?: CButtonVariant;
	size?: CButtonSize;
	disabled?: boolean;
	icon?: string; // Search for icon name in https://icon-sets.iconify.design/ph/ (https://phosphoricons.com/)
	iconLocation?: 'left' | 'right';
	id?: string;
	tooltip?: Partial<CTooltipProps>;
	fill?: boolean;
}
