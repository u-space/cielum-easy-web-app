import classnames from 'classnames';
import PButton, { PButtonType } from './PButton';
import styles from './Kanpur.module.scss';

import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';

export enum PModalType {
	INFORMATION = 'information',
	SUCCESS = 'success',
	ERROR = 'error'
}

export interface PModalProps {
	type?: PModalType;
	title: string;
	content: string | string[] | ReactNode;
	primary?: {
		onClick: () => void;
		text?: string;
	};
	secondary?: {
		onClick: () => void;
		text: string;
	};
}

const PModal = (props: PModalProps) => {
	const { t } = useTranslation();
	const { type = PModalType.SUCCESS, title, content, primary, secondary } = props;
	return (
		<div className={styles.modal}>
			<div className={classnames(styles.title, styles[type])}>{t(title)}</div>
			<div className={styles.body}>
				{Array.isArray(content) ? (
					content.map((item) => <li key={item}>{t(item)}</li>)
				) : typeof content === 'string' ? (
					<p>{t(content)}</p>
				) : (
					<p>{content}</p>
				)}
			</div>
			<div className={styles.actions}>
				{secondary && (
					<PButton variant={PButtonType.SECONDARY} onClick={secondary.onClick}>
						{secondary.text}
					</PButton>
				)}
				{primary && <PButton onClick={primary.onClick}>{primary.text ?? t('OK')}</PButton>}
			</div>
		</div>
	);
};

export default PModal;
