import CardGroup, { CardGroupDetailLine } from '../../../commons/layouts/dashboard/menu/CardGroup';
import { Spinner } from '@blueprintjs/core';
import BackButton from '../../../commons/layouts/dashboard/menu/BackButton';
import React, { FC, useEffect, useState } from 'react';
import { getCSSVariable, setCSSVariable } from '../../../utils';

import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PButton from '@pcomponents/PButton';
import Fill from '../../../commons/layouts/dashboard/menu/Fill';
import ViewAndEditOperation from '../../core_service/operation/pages/ViewAndEditOperation';
import { useLs } from '../../../commons/utils';
import { Operation } from '@utm-entities/v2/model/operation';

export interface OperationDetailsProps {
	isLoading: boolean;
	isSuccess: boolean;
	isError: boolean;
	operation: Operation;
	canEdit?: boolean;
	hideButtons?: boolean;
}

const OperationDetails: FC<OperationDetailsProps> = ({
	isLoading,
	isSuccess,
	isError,
	operation,
	canEdit = false,
	hideButtons = false
}) => {
	const history = useHistory();
	const { t } = useTranslation(['ui', 'glossary']);
	const [isExpanded, setExpanded] = useState(false);
	const defaultSideWidth = getCSSVariable('side-width-default');
	const fullSideWidth = getCSSVariable('side-width-full');

	const props: string[] = [];
	const values: string[] = [];
	if (operation) {
		for (const prop in operation) {
			const value = operation[prop as keyof Operation];
			if (
				prop !== 'gufi' &&
				prop !== 'name' &&
				prop !== 'state' &&
				prop !== 'aircraft_comments' &&
				prop !== 'faa_rule' &&
				prop !== 'volumes_description' &&
				prop !== 'airspace_authorization' &&
				typeof value === 'string'
			) {
				props.push(prop);
				values.push(value);
			}
		}
	}

	const ls = useLs<Operation>(operation);

	useEffect(() => {
		ls.entity = operation;
	}, [operation]);

	useEffect(() => {
		if (isExpanded) {
			setCSSVariable('side-width', fullSideWidth);
		} else {
			setCSSVariable('side-width', defaultSideWidth);
		}
		return () => {
			setCSSVariable('side-width', defaultSideWidth);
		};
	}, [isExpanded]);

	return (
		<>
			{!hideButtons && <BackButton />}
			{isLoading && <Spinner />}
			{isSuccess && !isExpanded && (
				<>
					<CardGroup header="Operation details">
						<CardGroupDetailLine
							prop={'glossary:operation.name'}
							value={operation.name}
						/>
						<CardGroupDetailLine
							prop={'glossary:operation.gufi'}
							value={operation.gufi}
						/>
						<CardGroupDetailLine
							prop={'glossary:operation.state'}
							value={t(operation.state)}
						/>
						{/*operation.uas_registrations.map((uasr) => (
							<CardGroupDetailLine
								key={`uasr_${uasr.uvin}`}
								prop={'glossary:operation.uas_registrations'}
								value={uasr.asNiceString}
							/>
						))*/}
						{props.map((prop, index) => (
							<CardGroupDetailLine
								key={`prop_${prop}`}
								prop={`glossary:operation.${prop}`}
								value={values[index]}
							/>
						))}
						<CardGroupDetailLine
							prop={'glossary:operation.submit_time'}
							value={(operation['submit_time'] as Date).toLocaleString()}
						/>
					</CardGroup>
					{!hideButtons && (
						<>
							<PButton icon="info-sign" onClick={() => setExpanded(true)}>
								{t('See more details')}
							</PButton>
							{canEdit && (
								<PButton
									icon="edit"
									onClick={() =>
										history.push(`/editor/operation?id=${operation.gufi}`)
									}
								>
									{t('Edit')}
								</PButton>
							)}
						</>
					)}
				</>
			)}
			{isSuccess && isExpanded && (
				<>
					<Fill>
						<ViewAndEditOperation ls={ls} isEditing={false} />
					</Fill>
					<PButton onClick={() => setExpanded(false)}>{t('See less details')}</PButton>
				</>
			)}
			{isError && (
				<CardGroup header="Error" isDanger>
					{t(
						'The operation details could not be fetched as an error has occurred while contacting the server'
					)}
				</CardGroup>
			)}
		</>
	);
};

export default OperationDetails;
