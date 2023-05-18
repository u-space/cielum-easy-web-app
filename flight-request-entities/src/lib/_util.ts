export function buildFilterAndOrderParametersObject(
	take: any,
	skip: any,
	orderBy: any,
	order: any,
	filterBy: any,
	filter: any
) {
	const parameters = { take, skip } as any;
	if (orderBy && order) {
		parameters.order = order;
		parameters.orderBy = orderBy;
	}
	if (filterBy && filter) {
		parameters.filterBy = filterBy;
		parameters.filter = filter;
	}
	return parameters;
}
