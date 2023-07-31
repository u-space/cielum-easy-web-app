import Axios, { AxiosResponseTransformer } from 'axios';
import { AdesRole, FilteringParameters } from '../../_util';
import { Operation, ResponseOperation } from '../model/operation';

interface GetOperationsSpecificParameters {
	states?: string;
	fromDate?: Date;
	toDate?: Date;
}
interface GetOperationsResponse {
	ops: ResponseOperation[];
	count: number;
}

interface GetOperationsParsedResponse {
	ops: Operation[];
	count: number;
}

export const transformOperations = (data: GetOperationsResponse) => {
	return {
		ops: data.ops.map((operation) => new Operation(operation)),
		count: data.count
	};
};

export const transformOperation = (data: ResponseOperation) => new Operation(data);

export const getOperationAPIUnloggedClient = (api: string) => {
	const axiosInstance = Axios.create({
		baseURL: api,
		timeout: 15000,
		headers: { 'Content-Type': 'application/json' }
	});

	return {
		getOperations(
			orderBy: string,
			order: string,
			states: string[],
			filterBy?: string,
			filter?: string,
			fromDate?: Date,
			toDate?: Date
		) {
			const parameters: FilteringParameters & GetOperationsSpecificParameters = {};
			if (orderBy) parameters.orderBy = orderBy;
			if (orderBy && order) parameters.order = order;
			if (filter && filterBy) parameters.filterBy = filterBy;
			if (filter) parameters.filter = filter;
			if (states) parameters.states = JSON.stringify(states);
			if (fromDate) parameters.fromDate = fromDate;
			if (toDate) parameters.toDate = toDate;

			return axiosInstance.get<GetOperationsParsedResponse>('operation', {
				params: parameters,
				transformResponse: (
					Axios.defaults.transformResponse as AxiosResponseTransformer[]
				).concat(transformOperations)
			});
		}
	};
};

export const getOperationAPIClient = (api: string, token: string) => {
	const axiosInstance = Axios.create({
		baseURL: api,
		timeout: 15000,
		headers: { 'Content-Type': 'application/json' }
	});

	return {
		saveOperation(operation: Operation, isPilot = false) {
			if (isPilot && operation.state === 'CLOSED')
				throw new Error("You can't edit a closed operation");

			return axiosInstance.post(
				'operation',
				operation.asBackendFormat({ omitOwner: isPilot }),
				{
					headers: { auth: token }
				}
			);
		},
		getOperations(
			role: string,
			_states: string[],
			take: number,
			skip: number,
			orderBy: string,
			order: string,
			filterBy: string,
			filter?: string,
			fromDate?: Date,
			toDate?: Date
		) {
			const parameters: FilteringParameters & GetOperationsSpecificParameters = {};
			if (take) parameters.take = take;
			if (skip) parameters.skip = skip;
			if (orderBy) parameters.orderBy = orderBy;
			if (orderBy && order) parameters.order = order;
			if (filter && filterBy) parameters.filterBy = filterBy;
			if (filter) parameters.filter = filter;
			if (_states) parameters.states = JSON.stringify(_states);
			if (fromDate) parameters.fromDate = fromDate;
			if (toDate) parameters.toDate = toDate;

			if (_states.length === 0) return Promise.resolve({ data: { ops: [], count: 0 } });
			if (role === AdesRole.ADMIN || role === AdesRole.MONITOR) {
				return axiosInstance.get<GetOperationsParsedResponse>('operation', {
					params: parameters,
					headers: { auth: token },
					transformResponse: (
						Axios.defaults.transformResponse as AxiosResponseTransformer[]
					).concat(transformOperations)
				});
			} else {
				return axiosInstance.get<GetOperationsParsedResponse>('operation/owner', {
					params: parameters,
					headers: { auth: token },
					transformResponse: (
						Axios.defaults.transformResponse as AxiosResponseTransformer[]
					).concat(transformOperations)
				});
			}
		},
		getOperation(gufi: string) {
			return axiosInstance.get(`operation/${gufi}`, {
				headers: { auth: token },
				transformResponse: (
					Axios.defaults.transformResponse as AxiosResponseTransformer[]
				).concat(transformOperation)
			});
		},
		deleteOperation(gufi: string) {
			return axiosInstance.delete(`/operation/${gufi}`, { headers: { auth: token } });
		}
	};
};
