import { FC, FormEventHandler, ReactNode } from 'react';
import styles from './PageLayout.module.scss';
import PButton from '@pcomponents/PButton';
import { useHistory } from 'react-router-dom';

export interface PageLayoutProps {
	children: ReactNode;
	headerText?: string;
	onSubmit?: FormEventHandler<HTMLElement>;
	extraLeftHeaderButtons?: ReactNode;
	footer?: ReactNode;
	onArrowBack?: FormEventHandler<HTMLElement>;
}

const PageLayout: FC<PageLayoutProps> = ({
	children,
	headerText,
	onSubmit,
	extraLeftHeaderButtons,
	footer,
	onArrowBack
}) => {
	const history = useHistory();
	const goBack = () => history.goBack();
	return (
		<form className={styles.page} onSubmit={onSubmit}>
			<header className={styles.borders}>{headerText}</header>
			<div className={styles.nav}>
				<PButton icon="arrow-left" onClick={onArrowBack || goBack} />
				{extraLeftHeaderButtons}
			</div>
			{children}
			{footer && <footer className={styles.borders}>{footer}</footer>}
		</form>
	);
};
export default PageLayout;
