export enum CModalVariant {
	INFORMATION = 'information',
	SUCCESS = 'warning',
	ERROR = 'error'
}

export enum CModalWidth {
	SMALLEST = 'small',
	LARGEST = 'large'
}

export interface CModalProps {
	title: string;
	variant: CModalVariant;
	width: CModalWidth;
}
