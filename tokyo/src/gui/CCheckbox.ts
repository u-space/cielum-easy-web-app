export interface CCheckboxProps {
	id: string;
	label: string;
	fill?: boolean;
	checked?: boolean;
}

export type CCheckboxCheckedEvent = CustomEvent<{
	checked: boolean;
	id: string;
}>;
