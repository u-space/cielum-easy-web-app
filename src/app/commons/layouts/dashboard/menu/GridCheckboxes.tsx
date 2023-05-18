import { useTranslation } from 'react-i18next';
import { Checkbox } from '@blueprintjs/core';
import { FC } from 'react';
import styles from './GridCheckboxes.module.scss';
import { PButtonSize, PButtonType } from '@pcomponents/PButton';
import PButton from '@pcomponents/PButton';
export interface GridCheckboxesProps {
	gridItems: {
		checked: boolean;
		label: string;
		onChange: (checked: boolean) => void;
		legendColor?: string;
		onClick?: () => void;
	}[];
}
const GridCheckboxes: FC<GridCheckboxesProps> = ({ gridItems }) => {
	const { t } = useTranslation();
	return (
		<div className={styles.grid}>
			{gridItems.map((item) => {
				const tLabel = t(item.label);
				return (
					<div key={item.label} className={styles.line}>
						{item.onClick && (
							<PButton
								size={PButtonSize.EXTRA_SMALL}
								icon="eye-open"
								variant={PButtonType.SECONDARY}
								onClick={item.onClick}
							/>
						)}
						<Checkbox
							className={styles.checkbox}
							checked={item.checked}
							onChange={(evt) => item.onChange(evt.currentTarget.checked)}
						>
							{tLabel}
						</Checkbox>
						{item.legendColor && (
							<div
								className={styles.legend}
								style={{ backgroundColor: item.legendColor }}
							/>
						)}
						{/*item.legendColor && (
							<input
								style={{
									padding: 0,
									margin: 0,
									border: 0,
									backgroundColor: item.legendColor
								}}
								type="color"
								value={item.legendColor}
							/>
						)*/}
					</div>
				);
			})}
		</div>
	);
};

export default GridCheckboxes;
