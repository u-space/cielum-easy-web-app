import { NotificationType, useNotificationShownNotification, useNotificationStore } from '../store';
import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import classnames from 'classnames';
import styles from '../Notifications.module.scss';
import PButton, { PButtonSize } from '@pcomponents/PButton';
import ReactMarkdown from 'react-markdown';
import { onOff, shift } from '@pcomponents/anims';

const NotificationCenter = () => {
	const notifications = useNotificationStore((state) => state.notifications);
	const remove = useNotificationStore((state) => state.remove);
	const removeAll = useNotificationStore((state) => state.removeAll);
	const shownNotification = useNotificationShownNotification();
	const [isShowingScreen, setShowingScreenFlag] = useState(false);

	const history = useHistory();

	const latestNotificationTime = useRef(new Date());

	useEffect(() => {
		if (shownNotification && latestNotificationTime.current < shownNotification.date) {
			latestNotificationTime.current = shownNotification.date;
		}
	}, [shownNotification]);

	return (
		<>
			<AnimatePresence>
				{!isShowingScreen && shownNotification && (
					<motion.div
						key={shownNotification.id}
						className={classnames(
							styles.top_notification,
							styles[shownNotification.type]
						)}
						initial="shiftUp"
						animate="center"
						exit="shiftDown"
						transition={{ duration: 0.2 }}
						variants={shift}
					>
						<div
							style={{
								display: 'flex',
								marginBottom: '0.5em'
							}}
						>
							<div className={styles.date}>
								{shownNotification.date.toLocaleString()}
							</div>
							<PButton
								style={{ marginLeft: 'auto' }}
								size={PButtonSize.EXTRA_SMALL}
								icon="cross"
								onClick={() => remove(shownNotification.id)}
							></PButton>
						</div>
						<div
							className={styles.top_notification_content}
							onClick={() => {
								if (shownNotification.type === NotificationType.DANGER) {
									remove(shownNotification.id);
									if (shownNotification.link)
										history.push(shownNotification.link);
								} else {
									setShowingScreenFlag(true);
								}
							}}
						>
							<div className={styles.text}>
								<ReactMarkdown>{shownNotification.body}</ReactMarkdown>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{isShowingScreen && (
					<motion.div
						className={styles.notification_center}
						initial="off"
						animate="on"
						exit="off"
						transition={{ duration: 0.2 }}
						variants={onOff}
					>
						<div className={styles.content}>
							<PButton
								icon="cross"
								onClick={() => {
									setShowingScreenFlag(false);
									removeAll();
								}}
							>
								Cerrar
							</PButton>
							{notifications.map((notification) => (
								<motion.div
									layout
									key={notification.id}
									className={classnames(
										styles.notification,
										styles[notification.type]
									)}
									initial="off"
									animate="on"
									transition={{ duration: 0.2, type: 'spring', stifness: '1000' }}
									variants={onOff}
									onClick={() => {
										if (notification.link) history.push(notification.link);
										remove(notification.id);
									}}
								>
									<div className={styles.date}>
										{notification.date.toLocaleString()}
									</div>
									<div className={styles.text}>
										<ReactMarkdown>{notification.body}</ReactMarkdown>
									</div>
								</motion.div>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
};

export default NotificationCenter;
