import { useState } from 'react';

export interface SunriseData {
	sunrise: (SunriseSunsetResults | null)[];
	fetchSunrise: (dates: string[], latitude: number, longitude: number) => Promise<void>;
	isFetchingSunrise: boolean;
}

export interface SunriseSunsetResults {
	sunrise: string;
	sunset: string;
	solar_noon: string;
	day_length: string;
	civil_twilight_begin: string;
	civil_twilight_end: string;
	nautical_twilight_begin: string;
	nautical_twilight_end: string;
	astronomical_twilight_begin: string;
	astronomical_twilight_end: string;
}

export interface SunriseSunsetResponse {
	results: SunriseSunsetResults;
	status: string;
}

export const useSunrise = (): SunriseData => {
	const [sunrise, setSunrise] = useState<(SunriseSunsetResults | null)[]>([]);
	const [isFetchingSunrise, setIsFetchingSunrise] = useState<boolean>(false);

	const fetchSunrise = async (dates: string[], latitude: number, longitude: number) => {
		setIsFetchingSunrise(true);
		const promises = dates.map(async (date) => {
			const apiStr = `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&date=${date}&tzid=America/Montevideo`;
			const response = await fetch(apiStr);
			const data: SunriseSunsetResponse = await response.json();

			if (data.status === 'OK') {
				return data.results;
			}
			return null;
		});
		const results = await Promise.all(promises);
		setSunrise(results);
		setIsFetchingSunrise(false);
	};

	return { sunrise, fetchSunrise, isFetchingSunrise };
};
