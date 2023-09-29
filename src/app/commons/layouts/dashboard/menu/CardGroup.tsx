/* eslint-disable @typescript-eslint/no-empty-function */
// TODO: remove this file, replaced by DashboardCard
import { useTranslation } from 'react-i18next';
import styles from './CardGroup.module.scss';
import classnames from 'classnames';
import { Collapse } from '@blueprintjs/core';
import { useState, ReactNode, CSSProperties } from 'react';

export interface CardGroupProps {
	header?: string; // Should be a i18n key
	children?: ReactNode;
	isDanger?: boolean;
	expandable?: boolean;
	defaultOpen?: boolean;
	style?: CSSProperties;
	extraClassNames?: string;
	hasSeparators?: boolean;
}

export interface CardGroupDetailLineProps {
	prop: string; // Should be a i18n key
	value: ReactNode;
}

export const CardGroupDetailLine = (props: CardGroupDetailLineProps) => {
	const { t } = useTranslation(['ui', 'glossary']);
	const { prop, value } = props;
	const tProp = t(prop);
	return (
		<div className={styles.detail_line}>
			<div className={styles.prop}>{tProp}</div>
			<div className={styles.value}>{value}</div>
		</div>
	);
};

const CardGroup = (props: CardGroupProps) => {
	const { t } = useTranslation();
	const {
		header,
		extraClassNames,
		children,
		isDanger,
		expandable,
		defaultOpen = false,
		style,
		hasSeparators = false
	} = props;

	const tHeader = t(header || '');
	const [opened, setOpened] = useState(defaultOpen);

	return (
		<section
			className={classnames([
				styles.card_group,
				{ [extraClassNames || '']: !!extraClassNames },
				{ [styles.danger]: isDanger }
			])}
			style={style}
		>
			{header && (
				<div
					onClick={expandable ? () => setOpened(!opened) : () => {}}
					className={classnames(styles.header, { [styles.expand]: expandable })}
				>
					{tHeader}
				</div>
			)}

			<Collapse isOpen={!expandable || opened}>
				<div
					className={classnames([
						styles.body,
						{ [styles.withSeparators]: hasSeparators }
					])}
				>
					{children}
				</div>
			</Collapse>
		</section>
	);
};

export default CardGroup;
