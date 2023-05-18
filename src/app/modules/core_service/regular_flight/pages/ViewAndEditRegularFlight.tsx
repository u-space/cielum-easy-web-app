import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import PInput from '@pcomponents/PInput';
import styles from '../../../../commons/Pages.module.scss';
import PNumberInput from '@pcomponents/PNumberInput';
import { CSSProperties, FC } from 'react';
import { UseLocalStoreEntity } from '../../../../commons/utils';
import { RegularFlightEntity } from '@utm-entities/regularFlight';

interface BaseRegularFlightDetailsProps {
	ls: UseLocalStoreEntity<RegularFlightEntity>;
	isEditing: boolean;
	isCreating: boolean;
}

const BaseRegularFlightDetails: FC<BaseRegularFlightDetailsProps> = observer(
	({ ls, isEditing, isCreating }) => {
		const { t } = useTranslation(['ui', 'glossary']);

		if (ls.entity) {
			return (
				<>
					<PInput
						id={'id'}
						defaultValue={ls.entity.id}
						label={t('glossary:regularflight.id')}
						onChange={() => {
							return;
						}}
						isRequired
						isDarkVariant
						disabled
					/>
					<PInput
						id={'name'}
						defaultValue={ls.entity.name}
						label={t('glossary:regularflight.name')}
						explanation={t('glossary:regularflight.name_desc')}
						onChange={(value: string) => (ls.entity.name = value)}
						isRequired
						isDarkVariant={true}
						disabled={!isCreating}
					/>
					<PNumberInput
						id={'verticalSpeed'}
						defaultValue={ls.entity.verticalSpeed}
						label={t('glossary:regularflight.verticalSpeed')}
						explanation={t('glossary:regularflight.verticalSpeed_desc')}
						onChange={(value: number) => (ls.entity.verticalSpeed = value)}
						isRequired
						isDarkVariant={true}
						disabled={!isCreating}
					/>
				</>
			);
		} else {
			return null;
		}
	}
);

export interface ViewAndEditRegularFlightProps {
	ls: UseLocalStoreEntity<RegularFlightEntity>;
	isEditing: boolean;
	isCreating?: boolean;
	style?: CSSProperties;
}
const ViewAndEditRegularFlight: FC<ViewAndEditRegularFlightProps> = ({
	ls,
	isEditing,
	isCreating = false,
	style
}) => {
	const { t } = useTranslation();
	return (
		<div className={styles.twobytwo} style={style}>
			<div className={styles.content}>
				<aside className={styles.summary}>
					<h2>{t('Regular Flight information')}</h2>
					{t('A Regular Flight is a flight that happens regularly')}
				</aside>
				<section className={styles.details}>
					<BaseRegularFlightDetails
						isEditing={isEditing}
						isCreating={isCreating}
						ls={ls}
					/>
				</section>
			</div>
		</div>
	);
};

export default observer(ViewAndEditRegularFlight);
