import { TokyoPick } from '@tokyo/TokyoTypes';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styles from './PickElements.module.scss';
import PButton from '@pcomponents/PButton';
import { PButtonSize } from '@pcomponents/PButton';
import { selectEntity } from '../utils';

const PickElements = ({ elements, onClick }: { elements: TokyoPick[]; onClick: () => void }) => {
	const { t } = useTranslation();
	const history = useHistory();

	return (
		<>
			{elements.map((element) => {
				if (element.type === 'EditableGeoJsonLayer') return null;
				const displayString =
					element.volume !== undefined
						? `${element.name} (${element.volume + 1})`
						: element.name;
				return (
					<div key={element.id} className={styles.pick_element}>
						<div className={styles.header}>
							<PButton
								icon="info-sign"
								size={PButtonSize.EXTRA_SMALL}
								onClick={() => {
									selectEntity(element, history);
									onClick();
								}}
							/>
							{displayString !== '' ? displayString : t('<No name>')}
						</div>
						<div className={styles.footer}>{t(element.type)}</div>
					</div>
				);
			})}
		</>
	);
};

export default PickElements;
