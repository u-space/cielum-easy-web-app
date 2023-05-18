import { Children, ReactNode } from 'react';

export interface PFragProps {
	children: ReactNode[];
}

function PFrag({ children }: PFragProps) {
	const count = Children.toArray(children).length;
	if (count > 0) {
		return <>{children}</>;
	} else {
		return null;
	}
}

export default PFrag;
