import { Intent, Spinner, SpinnerSize } from '@blueprintjs/core';
import i18n from 'i18next';
import { Component, CSSProperties, ErrorInfo, FC, ReactNode } from 'react';
import PModal, { PModalType } from '@pcomponents/PModal';
import styles from '../../Layouts.module.scss';
import classnames from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import env from '../../../../vendor/environment/env';
import { getAssetPath } from '../../../utils';
import { onOff } from '@pcomponents/anims';

interface CenterErrorBoundaryProps {
	children: ReactNode;
}

interface CenterErrorBoundaryState {
	error: Error | null;
	errorInfo: ErrorInfo | null;
}
class CenterErrorBoundary extends Component<CenterErrorBoundaryProps, CenterErrorBoundaryState> {
	constructor(props: CenterErrorBoundaryProps) {
		super(props);
		this.state = { error: null, errorInfo: null };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.group();
		console.error('%cCIELUMeasy has crashed!', 'font-size: 38px; color: yellow');
		console.error(error);
		console.error(errorInfo);
		console.groupEnd();
		this.setState({ error, errorInfo });
		// TODO: Add an error servicelogErrorToMyService(error, errorInfo)
	}

	render() {
		if (this.state.error) {
			return (
				<PModal
					type={PModalType.ERROR}
					title={i18n.t('An unmanaged error has occured')}
					content={this.state.error && this.state.error.toString()}
					primary={{ onClick: () => window.location.reload() }}
				/>
			);
		}
		return this.props.children;
	}
}

interface CenterProps {
	children: ReactNode;
	style?: CSSProperties;
	isLoading?: boolean;
	hasPadding?: boolean;
}
const Center: FC<CenterProps> = ({
	children,
	style = undefined,
	isLoading = false,
	hasPadding
}) => {
	return (
		<section
			style={{
				...style,
				background: `var(--yokohama-primary-700) url(${getAssetPath(
					env.tenant.assets.dashboard_background
				)})`
			}}
			className={classnames(styles.center, { [styles.padded]: hasPadding })}
		>
			<div className={classnames(styles.full, { [styles.loading]: isLoading })}>
				<CenterErrorBoundary>{children}</CenterErrorBoundary>
			</div>
			<AnimatePresence>
				{isLoading && (
					<motion.div
						className={styles.overtop}
						initial="off"
						animate="on"
						exit="off"
						transition={{ duration: 0.2 }}
						variants={onOff}
					>
						<Spinner size={SpinnerSize.LARGE} intent={Intent.PRIMARY} />
					</motion.div>
				)}
			</AnimatePresence>
		</section>
	);
};

export default Center;
