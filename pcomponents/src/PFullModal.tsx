import { AnimatePresence, motion } from 'framer-motion';
import PModal, { PModalProps, PModalType } from './PModal';
import styles from './Kanpur.module.scss';
import { catchAttention } from './anims';

export const undefinedModal = {
	isVisible: false,
	title: '',
	content: ''
};
export type PFullModalProps = PModalProps & { isVisible: boolean };
// I recommend always to have this component drawn and just animate it in and out (setting isVisible to true or false)
const PFullModal = (props: PFullModalProps) => {
	const { isVisible } = props;
	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial="off"
					animate="on"
					exit="off"
					transition={{ duration: 0.25 }}
					className={styles.full_modal}
					variants={catchAttention}
				>
					<PModal {...props} />
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default PFullModal;
