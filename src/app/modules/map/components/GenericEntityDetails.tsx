/* eslint-disable @typescript-eslint/no-explicit-any */

import { Spinner } from '@blueprintjs/core';
import { useTranslation } from 'react-i18next';
import PButton from '@pcomponents/PButton';
import _ from 'lodash';
import BackButton from '../../../commons/layouts/dashboard/menu/BackButton';
import { FC } from 'react';
import CardGroup, { CardGroupDetailLine } from '../../../commons/layouts/dashboard/menu/CardGroup';

interface GenericEntityDetailsProps {
	route: string;
	isLoading: boolean;
	isSuccess: boolean;
	isError: boolean;
	entity: any;
	label?: string;
	baseLabelKey: string;
	onEdit?: () => void;
	canEdit?: boolean;
	extra?: any;
}

const GenericEntityDetails: FC<GenericEntityDetailsProps> = ({
	route,
	isLoading,
	isSuccess,
	isError,
	entity,
	label = 'Entity info',
	baseLabelKey,
	onEdit = null,
	canEdit = false,
	extra
}) => {
	const { t } = useTranslation();
	return (
		<>
			<BackButton route={route} />
			{isLoading && <Spinner />}
			{isSuccess && (
				<>
					<CardGroup header={label}>
						{_.keys(entity).map((prop) => {
							const value = entity[prop];
							if (typeof value === 'string' || typeof value === 'number') {
								return (
									<CardGroupDetailLine
										key={prop}
										prop={`glossary:${baseLabelKey}.${prop}`}
										value={value}
									/>
								);
							} else if (typeof value === 'object' && value instanceof Date) {
								return (
									<CardGroupDetailLine
										key={prop}
										prop={`glossary:${baseLabelKey}.${prop}`}
										value={value.toLocaleString()}
									/>
								);
							} else if (Array.isArray(value)) {
								return (
									<CardGroupDetailLine
										key={prop}
										prop={`glossary:${baseLabelKey}.${prop}`}
										value={value.map((item, index) => (
											<>
												{/* {value.length > 1 && (
													<p>
														{t('item')} {index + 1}
													</p>
												)} */}
												<ul key={item} style={{ margin: '0.1rem', backgroundColor: '#f5f5f522', borderRadius: '0.5rem' }}>
													{Object.entries(item).map((subitem) => {
														if (typeof subitem[1] !== 'object') {
															return (
																<li key={JSON.stringify(subitem)}>
																	<b>
																		{t(
																			`glossary:${baseLabelKey}.${subitem[0]}`
																		)}
																	</b>
																	<br />
																	<p
																		style={{
																			paddingLeft: '0.5rem'
																		}}
																	>
																		{t(subitem[1] as string)}
																	</p>
																</li>
															);
														} else {
															return null;
														}
													})}
												</ul>
											</>
										))}
									/>
								);
							}
						})}
						{extra}
					</CardGroup>
					{onEdit && canEdit && (
						<PButton icon="edit" onClick={onEdit}>
							{t('Edit')}
						</PButton>
					)}
				</>
			)}
			{isError && (
				<CardGroup header="Error" isDanger>
					{t(
						'The details could not be fetched as an error has occurred while contacting the server'
					)}
				</CardGroup>
			)}
		</>
	);
};

export default GenericEntityDetails;
