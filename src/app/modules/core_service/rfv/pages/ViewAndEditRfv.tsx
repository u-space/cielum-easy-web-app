import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import PInput from '@pcomponents/PInput';
import styles from '../../../../commons/Pages.module.scss';
import { CSSProperties, FC } from 'react';
import { UseLocalStoreEntity } from '../../../../commons/utils';
import { RfvEntity } from '@utm-entities/rfv';
import PNumberInput from '@pcomponents/PNumberInput';

interface BaseRfvDetailsProps {
	ls: UseLocalStoreEntity<RfvEntity>;
	isEditing: boolean;
	isCreating?: boolean;
}

const BaseRfvDetails: FC<BaseRfvDetailsProps> = ({ ls, isEditing, isCreating }) => {
	const { t } = useTranslation('glossary');

	const flags = { isRequired: true, isDarkVariant: true, fill: true };

	return (
		<>
			<PInput
				id="description"
				defaultValue={ls.entity.comments}
				label={t('glossary:rfv.comments')}
				disabled={!isEditing}
				onChange={(value) => (ls.entity.comments = value)}
				inline
				{...flags}
			/>
			<PNumberInput
				id="min_altitude"
				defaultValue={ls.entity.min_altitude}
				label={t('glossary:rfv.min_altitude')}
				disabled={!isEditing}
				onChange={(value) => (ls.entity.min_altitude = value)}
				inline
				{...flags}
			/>
			<PNumberInput
				id="max_altitude"
				defaultValue={ls.entity.max_altitude}
				label={t('glossary:rfv.max_altitude')}
				disabled={!isEditing}
				onChange={(value) => (ls.entity.max_altitude = value)}
				inline
				{...flags}
			/>
			{!isCreating && (
				<PInput
					id="id"
					defaultValue={ls.entity.id}
					label={t('glossary:rfv.id')}
					disabled={true}
					{...flags}
				/>
			)}
		</>
	);
};

interface ViewAndEditRfvProps {
	ls: UseLocalStoreEntity<RfvEntity>;
	isEditing: boolean;
	isCreating?: boolean;
	style?: CSSProperties;
}

const ViewAndEditRfv: FC<ViewAndEditRfvProps> = ({ ls, isEditing, isCreating = false, style }) => {
	const { t } = useTranslation();
	return (
		<div className={styles.twobytwo} style={style}>
			<div className={styles.content}>
				<aside className={styles.summary}>
					<h2>{t('Restricted Flight Volume details')}</h2>
					{t(
						'A volume is defined not only by the polygon on the map, but its minimum and maximum altitude'
					)}
				</aside>
				<section className={styles.details}>
					<BaseRfvDetails isEditing={isEditing} isCreating={isCreating} ls={ls} />
				</section>
			</div>
		</div>
	);
};

export default observer(ViewAndEditRfv);
