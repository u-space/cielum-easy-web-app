import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import PInput from '@pcomponents/PInput';
import styles from '../../../../commons/Pages.module.scss';
import { CSSProperties, FC } from 'react';
import { UseLocalStoreEntity } from '../../../../commons/utils';
import { UvrEntity } from '@utm-entities/uvr';
import PNumberInput from '@pcomponents/PNumberInput';

interface BaseUvrDetailsProps {
	ls: UseLocalStoreEntity<UvrEntity>;
	isEditing: boolean;
	isCreating?: boolean;
}

const BaseUvrDetails: FC<BaseUvrDetailsProps> = ({ ls, isEditing, isCreating }) => {
	const { t } = useTranslation('glossary');

	const flags = { isRequired: true, isDarkVariant: true, fill: true };

	return (
		<>
			<PInput
				id="reason"
				defaultValue={ls.entity.reason}
				label={t('glossary:uvr.reason')}
				disabled={!isEditing}
				onChange={(value: string) => (ls.entity.reason = value)}
				inline
				{...flags}
			/>
			{/*<PInput
				id="cause"
				defaultValue={ls.entity.cause}
				label={t('glossary:uvr.cause')}
				disabled={!isEditing}
				onChange={(value) => (ls.entity.reason = value)}
				inline
				{...flags}
			/>*/}
			<PNumberInput
				id="min_altitude"
				defaultValue={ls.entity.min_altitude}
				label={t('glossary:uvr.min_altitude')}
				disabled={!isEditing}
				onChange={(value: number) => (ls.entity.min_altitude = value)}
				inline
				{...flags}
			/>
			<PNumberInput
				id="max_altitude"
				defaultValue={ls.entity.max_altitude}
				label={t('glossary:uvr.max_altitude')}
				disabled={!isEditing}
				onChange={(value: number) => (ls.entity.max_altitude = value)}
				inline
				{...flags}
			/>
			{!isCreating && ls.entity.message_id && (
				<PInput
					id="id"
					defaultValue={ls.entity.message_id}
					label={t('glossary:uvr.message_id')}
					disabled={true}
					{...flags}
				/>
			)}
		</>
	);
};

interface ViewAndEditUvrProps {
	ls: UseLocalStoreEntity<UvrEntity>;
	isEditing: boolean;
	isCreating?: boolean;
	style?: CSSProperties;
}

const ViewAndEditUvr: FC<ViewAndEditUvrProps> = ({ ls, isEditing, isCreating = false, style }) => {
	const { t } = useTranslation();
	return (
		<div className={styles.twobytwo} style={style}>
			<div className={styles.content}>
				<aside className={styles.summary}>
					<h2>{t('UAS Volume Reservation details')}</h2>
					{t(
						'A volume is defined not only by the polygon on the map, but its minimum and maximum altitude'
					)}
				</aside>
				<section className={styles.details}>
					<BaseUvrDetails isEditing={isEditing} isCreating={isCreating} ls={ls} />
				</section>
			</div>
		</div>
	);
};

export default observer(ViewAndEditUvr);
