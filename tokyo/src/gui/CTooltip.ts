export enum CTooltipPosition {
	Top = 'top',
	Bottom = 'bottom',
	Left = 'left',
	Right = 'right'
}
export interface CTooltipProps {
	open: boolean;
	position: CTooltipPosition;
	text: string;
}
