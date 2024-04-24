import PInput from '@pcomponents/PInput';
import PButton, { PButtonProps } from '@pcomponents/PButton';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { FC } from 'react';
import CardGroup from '../../../../commons/layouts/dashboard/menu/CardGroup';
import { UvrEntity } from '@utm-entities/uvr';
import PNumberInput from '@pcomponents/PNumberInput';

interface InfoProps {
	prop: keyof UvrEntity;
	entity: UvrEntity;
	setInfo: (prop: keyof UvrEntity, value: UvrEntity[keyof UvrEntity]) => void;
}

const Info: FC<InfoProps> = observer(({ prop, entity, setInfo }) => {
	const { t } = useTranslation('glossary');
	const value = entity[prop];
	if (typeof value === 'string') {
		return (
			<PInput
				key={prop}
				id={`editor-uvr-${prop}`}
				defaultValue={value}
				label={t(`glossary:uvr.${prop}`)}
				onChange={(value) => setInfo(prop, value)}
				isRequired
				disabled={prop === 'id'}
			/>
		);
	} else if (typeof value === 'number') {
		return (
			<PNumberInput
				key={prop}
				id={`editor-uvr-${prop}`}
				defaultValue={value}
				label={t(`glossary:uvr.${prop}`)}
				onChange={(value) => setInfo(prop, value)}
				isRequired
				disabled={prop === 'id'}
			/>
		);
	} else {
		return null;
	}
});

interface InfoUvrProps {
	uvr: UvrEntity;
	isEditingExisting: boolean;
	props: string[];
	save: PButtonProps['onClick'];
}

const InfoUvr: FC<InfoUvrProps> = ({ uvr, isEditingExisting, props, save }) => {
	const { t } = useTranslation(['ui', 'glossary']);

	return (
		<>
			<CardGroup header="Creating a Uvr">
				{props.map((prop) => (
					<Info
						key={'0' + prop}
						entity={uvr}
						prop={prop as keyof UvrEntity}
						setInfo={(prop: keyof UvrEntity, value: UvrEntity[keyof UvrEntity]) =>
							uvr.set(prop, value)
						}
					/>
				))}
			</CardGroup>
			<PButton onClick={save}>
				{isEditingExisting ? t('Save the UVR') : t('Create the UVR')}
			</PButton>
		</>
	);
};

export default observer(InfoUvr);
