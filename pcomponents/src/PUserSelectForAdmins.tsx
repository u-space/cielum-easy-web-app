import classnames from 'classnames';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import { getUserAPIClient, UserEntity } from '@utm-entities/user';
import styles from './Kanpur.module.scss';
import PButton, { PButtonType, PButtonSize } from './PButton';
import PInput, { PInputProps } from './PInput';
import { ExtraFieldSchema } from '@utm-entities/extraFields';

export interface PUserSelectForAdminsProps extends Omit<PInputProps, 'onSelect'> {
	label: string;
	disabled?: boolean;
	single?: boolean;
	onSelect: (users: UserEntity[]) => void;
	isDarkVariant?: boolean;
	preselected?: UserEntity[];
	api: string;
	schema: ExtraFieldSchema;
	isAdmin?: boolean;
	isPilot?: boolean;
	token: string;
}

const PUserSelectForAdmins = (props: PUserSelectForAdminsProps) => {
	const {
		label,
		disabled = false,
		single = true,
		onSelect,
		isDarkVariant = false,
		preselected,
		api,
		schema,
		isAdmin,
		isPilot,
		token,
		...extra
	}: PUserSelectForAdminsProps = props;

	const [value, setValue] = useState('');
	const [selected, setSelected] = useState<UserEntity[]>(preselected ? preselected : []);

	const { getUsers } = getUserAPIClient(api, token, schema);

	const {
		isLoading,
		isSuccess,
		isError,
		data: response,
		refetch
	} = useQuery(
		['short_users', value],
		() => getUsers(7, 0, 'username', 'ASC', 'email,firstName,lastName', value),
		{ retry: false, enabled: false }
	);

	useEffect(() => {
		if (props.preselected) {
			setSelected(props.preselected);
		}
	}, [props.preselected]);

	const debouncedRefetch = _.debounce(refetch, 500, { trailing: true, leading: false });

	const data = response?.data.user;

	const isEditing = !disabled;
	const isChoosing = isEditing && ((single && selected.length === 0) || !single);

	const remove = (username: string) => {
		setSelected((current) => {
			const selected = _.filter(current, (u) => u.username !== username);
			onSelect(selected);
			return selected;
		});
	};

	return (
		<>
			{label && label.length > 0 && <p>{label}</p>}
			{selected.map((user) => (
				<DisplaySelectedUser
					key={user.username}
					user={user}
					isDarkVariant={isDarkVariant}
					isEditing={isEditing}
					remove={remove}
					isAdmin={isAdmin || false}
				/>
			))}
			{isChoosing && (
				<TextFieldSelectUser
					{...{
						value,
						disabled,
						isAdmin,
						isPilot,
						setValue,
						debouncedRefetch,
						extra,
						isLoading,
						isSuccess,
						isError,
						isDarkVariant,
						onSelect,
						setSelected,
						data
					}}
				/>
			)}
		</>
	);
};

interface DisplaySelectedUserProps {
	isDarkVariant: boolean;
	isEditing: boolean;
	user: UserEntity;
	isAdmin: boolean;
	remove: (username: string) => void;
}

const DisplaySelectedUser = (props: DisplaySelectedUserProps) => {
	const { isDarkVariant, user, remove, isEditing, isAdmin } = props;
	const history = useHistory();

	return (
		<div className={classnames(styles.selected_user, { [styles.dark]: isDarkVariant })}>
			{isEditing && (
				<PButton
					size={PButtonSize.EXTRA_SMALL}
					icon={'cross'}
					variant={PButtonType.SECONDARY}
					onClick={() => remove(user.username)}
				/>
			)}
			{user.username}, {user.firstName} {user.lastName}
			{isAdmin && (
				<PButton
					icon="info-sign"
					size={PButtonSize.EXTRA_SMALL}
					variant={PButtonType.SECONDARY}
					onClick={() => {
						history.push(`/users?id=${user.username}`);
					}}
				/>
			)}
		</div>
	);
};

interface TextFieldSelectUserProps {
	value: string;
	disabled: boolean;
	setValue: (value: string) => void;
	debouncedRefetch: () => void;
	extra: any;
	isLoading: boolean;
	isSuccess: boolean;
	isError: boolean;
	isDarkVariant: boolean;
	onSelect: (users: UserEntity[]) => void;
	setSelected: (fn: (current: UserEntity[]) => UserEntity[]) => void;
	data: UserEntity[];
}

const TextFieldSelectUser = (props: TextFieldSelectUserProps) => {
	const {
		value,
		disabled,
		setValue,
		debouncedRefetch,
		extra,
		isLoading,
		isSuccess,
		isError,
		isDarkVariant,
		onSelect,
		setSelected,
		data
	} = props;
	const { t } = useTranslation();
	return (
		<>
			<PInput
				id="owner"
				defaultValue={value}
				disabled={disabled}
				onChange={(value) => {
					setValue(value);
					debouncedRefetch();
				}}
				isDarkVariant={isDarkVariant}
				inline
				fill
				{...extra}
			/>

			<div style={{ textAlign: 'right' }}>
				{isLoading && `${t('Loading information of the user')}...`}
				{isSuccess &&
					data.length > 0 &&
					data.map((user) => (
						<div
							key={user.username}
							className={classnames(styles.user, { [styles.dark]: isDarkVariant })}
						>
							{user.firstName} {user.lastName} ({user.email})
							<PButton
								size={PButtonSize.EXTRA_SMALL}
								variant={PButtonType.SECONDARY}
								icon="plus"
								onClick={() => {
									setSelected((current: UserEntity[]) => {
										const selected = [...current, user];
										onSelect(selected);
										return selected;
									});
								}}
							/>
						</div>
					))}
				{isSuccess && value.length > 0 && data.length === 0 && (
					<p
						className={classnames(styles.user, styles.error, {
							[styles.dark]: isDarkVariant
						})}
					>
						{t('There is no user with a matching username')}
					</p>
				)}
				{isError && (
					<p
						className={classnames(styles.user, styles.error, {
							[styles.dark]: isDarkVariant
						})}
					>
						{t('An error ocurred while contacting the server')}
					</p>
				)}
			</div>
		</>
	);
};

export default PUserSelectForAdmins;
