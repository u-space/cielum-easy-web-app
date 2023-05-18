import classnames from 'classnames';
import styles from './FullBlock.module.scss';
import React, { FC, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { onOff } from '@pcomponents/anims';

export enum FullBlockType {
	ERROR = 'error',
	SUCCESS = 'success',
	DEFAULT = 'default'
}
export interface FullBlockProps {
	type: FullBlockType;
	children: ReactNode;
	isVisible: boolean;
	buttons?: ReactNode;
}

const FullParentOverlayBlock: FC<FullBlockProps> = ({ type, children, buttons, isVisible }) => {
	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					className={classnames(styles.full_block, {
						[styles.error]: type === FullBlockType.ERROR,
						[styles.success]: type === FullBlockType.SUCCESS,
						[styles.default]: type === FullBlockType.DEFAULT
					})}
					initial="off"
					animate="on"
					exit="off"
					transition={{ duration: 0.2 }}
					variants={onOff}
				>
					{children}
					{buttons && <div className={styles.buttons}>{buttons}</div>}
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default FullParentOverlayBlock;
