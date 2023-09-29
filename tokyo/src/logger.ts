// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function logDebug(method: string, ...args: any[]) {
	if ((window as typeof window & { cielum_log: boolean }).cielum_log) {
		if (process.env.NODE_ENV === 'development') {
			console.group(
				`%c [DeckController] (${method})`,
				'font-weight: bold; color: turquoise; font-size: 1rem'
			);
			console.log(...args);
			console.groupEnd();
		}
	}
}
