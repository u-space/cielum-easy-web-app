import { Icon } from '@blueprintjs/core';
import { BlueprintIcons_16Id } from '@blueprintjs/icons/lib/esm/generated/16px/blueprint-icons-16';
import classnames from 'classnames';
import styles from './Kanpur.module.scss';

export interface PToggleableButtonProps {
	icon: BlueprintIcons_16Id | null;
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	spaceTop?: boolean;
}

const PToggleableButton = ({
	label,
	checked,
	spaceTop = false,
	icon = null,
	onChange
}: PToggleableButtonProps) => {
	return (
		<div
			className={classnames(
				styles.toggleable,
				{ [styles.no]: !checked },
				{ [styles.yes]: checked },
				{ [styles.space_top]: spaceTop }
			)}
			onClick={() => onChange(!checked)}
		>
			{icon && <Icon icon={icon} />}
			{label}
		</div>
	);
};

export default PToggleableButton;
