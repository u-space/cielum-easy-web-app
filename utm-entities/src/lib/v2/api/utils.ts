import { AxiosResponse } from 'axios';

export function extractDataFromResponse(axiosResponse: AxiosResponse) {
	return axiosResponse.data;
}
