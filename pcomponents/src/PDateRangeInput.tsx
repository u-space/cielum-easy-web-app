import { DateRange, DateRangeInput2 } from '@blueprintjs/datetime2';

export interface PDateRangeInputProps {
	value?: DateRange;
	onChange: (value: DateRange) => void;
}

const PDateRangeInput = (props: PDateRangeInputProps) => {
	const { value, onChange } = props;
	return (
		<DateRangeInput2
			onChange={onChange}
			value={value}
			allowSingleDayRange={true}
			formatDate={(date) => date.toLocaleDateString()}
			parseDate={(str) => new Date(str)}
		></DateRangeInput2>
	);
};

export default PDateRangeInput;
