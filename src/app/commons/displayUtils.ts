import { MAX_DATE } from '@pcomponents/PDateInput';

export const showDate = (date: Date | string) => {
	const format = (date: Date) => {
		const day = date.getDate();
		const month = date.getMonth() + 1;
		const year = date.getFullYear();
		return day + '/' + month + '/' + year;
	};
	if (!date) return '';
	let auxDate: Date;

	if (typeof date === 'string') {
		auxDate = new Date(date);
	} else if (date instanceof Date) {
		auxDate = date;
	} else {
		return '';
	}
	if (auxDate < MAX_DATE) {
		return format(auxDate);
	} else {
		return '';
	}
};
