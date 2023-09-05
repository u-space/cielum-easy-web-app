import classnames from 'classnames';
import _ from 'lodash';
import { observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import styles from './Kanpur.module.scss';
import PButton, { PButtonType, PButtonSize } from './PButton';
import LabelInfo from './form/LabelInfo';
import PInput from './PInput';
import { getVehicleAPIClient } from '@utm-entities/vehicle';

const PVehicleSelect = ({
	label,
	username,
	disabled = false,
	single = false,
	onSelect,
	isDarkVariant = false,
	preselected,
	showInfoSign = true,
	api,
	token,
	schema,
	...extra
}) => {
	const [value, setValue] = useState('');
	const [selected, setSelected] = useState(preselected);

	const { getVehiclesByOperator } = getVehicleAPIClient(api, token, schema);

	const {
		isLoading,
		isSuccess,
		isError,
		data: response,
		refetch
	} = useQuery(
		[`short_vehicles_op_${username}`, value],
		() => getVehiclesByOperator(username, 3, 0, 'vehicleName', value),
		{
			retry: false,
			enabled: !!username
		}
	);

	const debouncedRefetch = _.debounce(refetch, 500, { trailing: true, leading: false });

	const data = isSuccess ? response.data.vehicles : [];

	const isChoosing = !single || (single && selected.length === 0);
	const isEditing = !disabled;

	const remove = (uvin) => {
		setSelected((current) => {
			const selected = _.filter(current, (u) => u.uvin !== uvin);
			onSelect(selected);
			return selected;
		});
	};

	useEffect(() => {
		setSelected(preselected);
	}, [preselected]);

	return (
		<>
			<div style={{ display: 'flex' }}>
				<p style={{ margin: '0 5px 0 0' }}>{label}</p>
				<LabelInfo isRequired />
			</div>
			{selected.map((vehicle) => (
				<DisplaySelectedVehicle
					key={vehicle.uvin}
					vehicle={vehicle}
					isDarkVariant={isDarkVariant}
					remove={remove}
					showInfoSign={showInfoSign}
					isEditing={isEditing}
				/>
			))}
			{isChoosing && (
				<TextFieldSelectVehicle
					{...{
						value,
						disabled,
						selected,
						label,
						setValue,
						debouncedRefetch,
						extra,
						isLoading,
						isSuccess,
						isError,
						isDarkVariant,
						onSelect,
						setSelected,
						data,
						response
					}}
				/>
			)}
		</>
	);
};

const DisplaySelectedVehicle = ({ isDarkVariant, showInfoSign, remove, vehicle, isEditing }) => {
	const history = useHistory();
	return (
		<div
			key={vehicle.uvin}
			className={classnames(styles.selected_vehicle, { [styles.dark]: isDarkVariant })}
		>
			{isEditing && (
				<PButton
					size={PButtonSize.EXTRA_SMALL}
					icon={'cross'}
					variant={PButtonType.PRIMARY}
					onClick={() => remove(vehicle.uvin)}
				/>
			)}
			{vehicle.asNiceString}
			{showInfoSign && (
				<PButton
					icon="info-sign"
					size={PButtonSize.EXTRA_SMALL}
					variant={PButtonType.SECONDARY}
					onClick={() => history.push(`/vehicles?id=${vehicle.uvin}`)}
				/>
			)}
		</div>
	);
};

const TextFieldSelectVehicle = ({
	value,
	disabled,
	selected,
	setValue,
	debouncedRefetch,
	extra,
	isLoading,
	isSuccess,
	isError,
	isDarkVariant,
	onSelect,
	setSelected,
	data,
	response
}) => {
	const difference = response && data ? response.data.count - data.length : 0;
	return (
		<>
			<PInput
				id="vehicle-name-input"
				defaultValue={value}
				disabled={disabled}
				onChange={(value) => {
					setValue(value);
					if (value) {
						debouncedRefetch();
					}
				}}
				inline
				fill
				{...extra}
			/>
			<div style={{ textAlign: 'right' }}>
				{isLoading && 'Loading information of the vehicle...'}
				{isSuccess && !disabled && (
					<>
						{data.map((vehicle) => {
							if (
								_.filter(selected, (veh) => veh.uvin === vehicle.uvin).length === 0
							) {
								// Vehicle is not already selected
								return (
									<div
										key={vehicle.uvin}
										style={{ marginBottom: '0.5rem' }}
										className={classnames(styles.vehicle, {
											[styles.dark]: isDarkVariant,
											[styles.error]: !vehicle.isAuthorized
										})}
									>
										<PButton
											id={`select-vehicle-${vehicle.uvin}`}
											fill
											disabled={!vehicle.isAuthorized}
											variant={PButtonType.SECONDARY}
											icon="plus"
											onClick={() => {
												setSelected((current) => {
													const selected = [...current, vehicle];
													onSelect(selected);
													return selected;
												});
											}}
										>
											{vehicle.asNiceString}
										</PButton>
									</div>
								);
							} else {
								return <div key={vehicle.uvin} />;
							}
						})}
						{difference > 0 && (
							<p style={{ color: 'white', height: '1rem', textAlign: 'center' }}>
								... {`y ${difference} más`} ...
							</p>
						)}
					</>
				)}
				{isSuccess && value.length > 0 && data.length === 0 && (
					<p
						className={classnames(styles.vehicle, styles.error, {
							[styles.dark]: isDarkVariant
						})}
					>
						No hay vehiculo con ese nombre
					</p>
				)}
				{isError && value.length > 0 && (
					<p
						className={classnames(styles.vehicle, styles.error, {
							[styles.dark]: isDarkVariant
						})}
					>
						Ha ocurrido un error contactando al servidor
					</p>
				)}
			</div>
		</>
	);
};

export default observer(PVehicleSelect);
