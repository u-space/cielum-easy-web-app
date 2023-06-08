import { selectEntity } from './utils';
import PickElements from './components/PickElements';
import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { TokyoPick } from '@tokyo/TokyoTypes';
import { PModalProps } from '@pcomponents/PModal';
import { useHistory } from 'react-router-dom';

const usePickElements = () => {
	const history = useHistory();
	const { t } = useTranslation();
	const [pickElements, setPickElements] = useState<TokyoPick[]>([]);
	const onClick = () => {
		setPickElements([]);
	};

	const content = <PickElements elements={pickElements} onClick={onClick} />;

	const pickModalProps: PModalProps | undefined = useMemo(() => {
		return pickElements.length > 0
			? {
					title: t('Many possible elements clicked'),

					primary: {
						onClick: onClick
					},
					content: content
			  }
			: undefined;
	}, [pickElements]);

	const onPick = useMemo(
		() => (elements: TokyoPick[]) => {
			if (elements.length > 0) {
				// At least something was under clicked position
				if (elements.length === 1) {
					// No need to show a picking menu
					selectEntity(elements[0], history);
				} else {
					// Show picking menu
					setPickElements(elements);
				}
			} else {
				// Nothing was under clicked position
				setPickElements([]);
			}
		},
		[history]
	);

	return { pickModalProps, onPick };
};

export default usePickElements;
