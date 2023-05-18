import { Checkbox, Icon } from '@blueprintjs/core';
import { DateInput, TimePrecision } from '@blueprintjs/datetime';
import { useTranslation } from 'react-i18next';
import styles from './HistoricalModeCheckboxes.module.scss';
import { FC } from 'react';

function add_years(date: Date, years: number) {
	return new Date(date.setFullYear(date.getFullYear() + years));
}

export interface HistoricalModeCheckboxesProps {
	checked: boolean;
	onCheck: (checked: boolean) => void;
	onDateChange: (from: Date | null, to: Date | null) => void;
	from: Date | null;
	to: Date | null;
}

const HistoricalModeCheckboxes: FC<HistoricalModeCheckboxesProps> = ({
	checked,
	onCheck,
	onDateChange,
	from,
	to
}) => {
	const { t } = useTranslation();
	return (
		<div className={styles.dateranges}>
			<div className={styles.checkbox_container}>
				<Checkbox checked={checked} onChange={(evt) => onCheck(evt.currentTarget.checked)}>
					{t('Show only those operations that match the following date filters')}
				</Checkbox>
			</div>
			<div className={styles.date_container}>
				<DateInput
					canClearSelection={false}
					minDate={add_years(new Date(), -5)}
					formatDate={(date) =>
						date.toLocaleString([], {
							year: 'numeric',
							month: 'numeric',
							day: 'numeric',
							hour: 'numeric',
							minute: 'numeric'
						})
					}
					parseDate={(str) => new Date(str)}
					placeholder="DD/MM/YYYY"
					value={from}
					disabled={!checked}
					timePrecision={TimePrecision.MINUTE}
					onChange={(value) => onDateChange(value, null)}
					maxDate={add_years(new Date(), 5)}
				/>
				<Icon style={{ margin: 8 }} icon="double-chevron-down" />
				<DateInput
					canClearSelection={false}
					minDate={add_years(new Date(), -5)}
					maxDate={add_years(new Date(), 5)}
					formatDate={(date) =>
						date.toLocaleString([], {
							year: 'numeric',
							month: 'numeric',
							day: 'numeric',
							hour: 'numeric',
							minute: 'numeric'
						})
					}
					disabled={!checked}
					parseDate={(str) => new Date(str)}
					placeholder="DD/MM/YYYY"
					value={to}
					timePrecision={TimePrecision.MINUTE}
					onChange={(value) => onDateChange(null, value)}
				/>
			</div>
		</div>
	);
};
export default HistoricalModeCheckboxes;
