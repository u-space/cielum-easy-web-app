import PInput from '@pcomponents/PInput';
import PButton, { PButtonProps } from '@pcomponents/PButton';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { FC } from 'react';
import CardGroup from '../../../../commons/layouts/dashboard/menu/CardGroup';
import { RfvEntity } from '@utm-entities/rfv';
import PNumberInput from '@pcomponents/PNumberInput';

interface InfoProps {
	prop: keyof RfvEntity;
	entity: RfvEntity;
	setInfo: (prop: keyof RfvEntity, value: RfvEntity[keyof RfvEntity]) => void;
}

const Info: FC<InfoProps> = observer(({ prop, entity, setInfo }) => {
	const { t } = useTranslation('glossary');
	const value = entity[prop];
	if (typeof value === 'string') {
		return (
			<PInput
				key={prop}
				id={`editor-rfv-${prop}`}
				defaultValue={value}
				label={t(`glossary:rfv.${prop}`)}
				onChange={(value) => setInfo(prop, value)}
				isRequired
				disabled={prop === 'id'}
			/>
		);
	} else if (typeof value === 'number') {
		return (
			<PNumberInput
				key={prop}
				id={`editor-rfv-${prop}`}
				defaultValue={value}
				label={t(`glossary:rfv.${prop}`)}
				onChange={(value) => setInfo(prop, value)}
				isRequired
				disabled={prop === 'id'}
			/>
		);
	} else {
		return null;
	}
});

interface InfoRfvProps {
	rfv: RfvEntity;
	isEditingExisting: boolean;
	props: string[];
	save: PButtonProps['onClick'];
}

const InfoRfv: FC<InfoRfvProps> = ({ rfv, isEditingExisting, props, save }) => {
	const { t } = useTranslation(['ui', 'glossary']);

	return (
		<>
			<CardGroup header="Creating a RFV">
				{props.map((prop) => (
					<Info
						key={'0' + prop}
						entity={rfv}
						prop={prop as keyof RfvEntity}
						setInfo={(prop: keyof RfvEntity, value: RfvEntity[keyof RfvEntity]) =>
							rfv.set(prop, value)
						}
					/>
				))}
			</CardGroup>
			<PButton onClick={save}>
				{isEditingExisting ? t('Save the RFV') : t('Create the RFV')}
			</PButton>
		</>
	);
};

export default observer(InfoRfv);
