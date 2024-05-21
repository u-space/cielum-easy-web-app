export const showDate = (date: Date | string) => {
	const format = (date: Date) => {
		const day = date.getDate();
		const month = date.getMonth() + 1;
		const year = date.getFullYear();
		return day + '/' + month + '/' + year;
	};
	if (!date) return '';

	if (typeof date === 'string') {
		const auxDate = new Date(date);
		return format(auxDate);
	} else if (date instanceof Date) {
		return format(date);
	}
};
