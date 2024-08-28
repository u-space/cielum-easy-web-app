import PInput from '@pcomponents/PInput';
import PButton, { PButtonProps } from '@pcomponents/PButton';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { FC } from 'react';
import CardGroup from '../../../../commons/layouts/dashboard/menu/CardGroup';

import PNumberInput from '@pcomponents/PNumberInput';
import { CoordinatorEntity } from '@flight-request-entities/coordinator';

interface InfoProps {
	prop: keyof CoordinatorEntity;
	entity: CoordinatorEntity;
	setInfo: (
		prop: keyof CoordinatorEntity,
		value: CoordinatorEntity[keyof CoordinatorEntity]
	) => void;
}

const Info: FC<InfoProps> = observer(({ prop, entity, setInfo }) => {
	const { t } = useTranslation('glossary');
	const value = entity[prop];
	if (typeof value === 'string') {
		return (
			<PInput
				key={prop}
				id={`editor-coordinator-${prop}`}
				defaultValue={value}
				label={t(`glossary:coordinator.${prop}`)}
				onChange={(value) => setInfo(prop, value)}
				isRequired
				disabled={prop === 'id'}
			/>
		);
	} else if (typeof value === 'number') {
		return (
			<PNumberInput
				key={prop}
				id={`editor-coordinator-${prop}`}
				defaultValue={value}
				label={t(`glossary:coordinator.${prop}`)}
				onChange={(value) => setInfo(prop, value)}
				isRequired
				disabled={prop === 'id'}
			/>
		);
	} else {
		return null;
	}
});

interface InfoCoordinatorProps {
	coordinator: CoordinatorEntity;
	isEditingExisting: boolean;
	props: string[];
	save: PButtonProps['onClick'];
}

const InfoCoordinator: FC<InfoCoordinatorProps> = ({
	coordinator,
	isEditingExisting,
	props,
	save
}) => {
	const { t } = useTranslation(['ui', 'glossary']);
	const visibleProps = [
		'id',
		'infrastructure',
		'telephone',
		'email',
		'minimun_coordination_days',
		'role_manager'
	];
	const visibleFilter = (prop: string) => visibleProps.includes(prop);

	return (
		<>
			<CardGroup header="Creating a Coordination Zone">
				{props.filter(visibleFilter).map((prop) => (
					<Info
						key={'0' + prop}
						entity={coordinator}
						prop={prop as keyof CoordinatorEntity}
						setInfo={(
							prop: keyof CoordinatorEntity,
							value: CoordinatorEntity[keyof CoordinatorEntity]
						) => coordinator.set(prop, value)}
					/>
				))}
			</CardGroup>
			<PButton onClick={save}>
				{isEditingExisting
					? t('Save the Coordination Zone')
					: t('Create the Coordination Zone')}
			</PButton>
		</>
	);
};

export default observer(InfoCoordinator);
