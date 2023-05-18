import { CSSProperties, FC } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import classnames from 'classnames';
import styles from './BannerOverlay.module.scss';
import ReactMarkdown from 'react-markdown';
import { onOff } from '@pcomponents/anims';

export enum BannerOverlayType {
	DANGER = 'danger',
	SUCCESS = 'success',
	ERROR = 'error'
}
interface BannerOverlayProps {
	type: BannerOverlayType;
	isVisible: boolean; // It is recommended to always render the overlay, and use this prop to show/hide it (instead of conditionally rendering the overlay)
	text: string;
	style?: CSSProperties;
}

const BannerOverlay: FC<BannerOverlayProps> = ({ type, isVisible, text, style }) => {
	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					className={classnames(styles.small_overlay, styles[type])}
					initial="off"
					animate="on"
					exit="off"
					transition={{ duration: 0.1 }}
					variants={onOff}
					style={style}
				>
					<ReactMarkdown>{text}</ReactMarkdown>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default BannerOverlay;
