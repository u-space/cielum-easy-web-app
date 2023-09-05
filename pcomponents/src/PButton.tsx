import { Button, ButtonProps, Icon, IconName } from '@blueprintjs/core';
import classnames from 'classnames';
import styles from './Kanpur.module.scss';
import { CSSProperties, ReactNode } from 'react';
import { getCSSVariable } from './utils';
// TODO: Add proper properties

export enum PButtonType {
	PRIMARY = 'Primary',
	SECONDARY = 'Secondary',
	DANGER = 'Danger'
}

export enum PButtonSize {
	MEDIUM = 'Medium',
	SMALL = 'Small',
	EXTRA_SMALL = 'ExtraSmall',
	LARGE = 'Large',
	EXTRA_LARGE = 'ExtraLarge'
}

export interface PButtonProps extends ButtonProps {
	children?: ReactNode;
	variant?: PButtonType;
	size?: PButtonSize;
	icon?: IconName;
	style?: CSSProperties;
	disabled?: boolean;

	iconLocation?: 'left' | 'right';
	id?: string;
}

const PButton = (props: PButtonProps) => {
	const {
		id,
		children,
		variant = PButtonType.PRIMARY,
		size = PButtonSize.MEDIUM,
		style,
		icon = null,
		disabled = false,
		onClick,
		iconLocation = 'left',
		...extraProps
	} = props;
	let iconSize = 18; // Medium icon size
	switch (size) {
		case PButtonSize.SMALL:
			iconSize = 14;
			break;
		case PButtonSize.EXTRA_SMALL:
			iconSize = 12;
	}

	let iconColor = getCSSVariable('mirai-100'); // Primary icon color
	if (variant === PButtonType.SECONDARY) {
		iconColor = getCSSVariable('primary-500');
	}

	// Variations flags
	const isExtraSmall = size === PButtonSize.EXTRA_SMALL;
	const isSmall = size === PButtonSize.SMALL;
	const isMedium = size === PButtonSize.MEDIUM;
	const isExtraLarge = size === PButtonSize.EXTRA_LARGE;
	const isLarge = size === PButtonSize.LARGE;
	const isPrimary = variant === PButtonType.PRIMARY;
	const isSecondary = variant === PButtonType.SECONDARY;
	const isDanger = variant === PButtonType.DANGER;
	const isDisabled = disabled;

	return (
		<Button
			id={id}
			icon={
				iconLocation === 'left' ? (
					<Icon icon={icon} iconSize={iconSize} color={iconColor} />
				) : null
			}
			rightIcon={
				iconLocation === 'right' && (
					<Icon icon={icon} iconSize={iconSize} color={iconColor} />
				)
			}
			style={style}
			{...extraProps}
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			onClick={!disabled ? onClick : () => {}}
			large={isLarge}
			className={classnames(styles.button, {
				[styles.extra_small]: isExtraSmall,
				[styles.small]: isSmall,
				[styles.medium]: isMedium,
				[styles.large]: isLarge,
				[styles.extra_large]: isExtraLarge,
				[styles.primary]: isPrimary,
				[styles.secondary]: isSecondary,
				[styles.danger]: isDanger,
				[styles.disabled]: isDisabled
			})}
			disabled={isDisabled}
		>
			{children}
		</Button>
	);
};

export default PButton;
