import classnames from 'classnames';
import styles from '../auth.module.scss';
import { ReactNode } from 'react';

interface StatusProps {
	children: ReactNode;
	isError?: boolean;
	isSuccess?: boolean;
	isLogin?: boolean;
}
const StatusLayout = ({
	children,
	isError = false,
	isSuccess = false,
	isLogin = false
}: StatusProps) => {
	return (
		<div
			className={classnames(styles.status, {
				[styles.login]: isLogin,
				[styles.error]: isError,
				[styles.success]: isSuccess
			})}
		>
			{children}
		</div>
	);
};

export default StatusLayout;
