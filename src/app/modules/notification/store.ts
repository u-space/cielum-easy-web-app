import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import _ from 'lodash';

export enum NotificationType {
	INFO = 'info',
	DANGER = 'danger'
}
export interface Notification {
	id: number;
	type: NotificationType;
	date: Date;
	body: string;
	link?: string;
}
export interface NotificationState {
	notifications: Notification[];
	add(notification: Omit<Notification, 'id' | 'date'>): void;
	remove(id: number): void;
	removeAll(): void;
}

export const useNotificationStore = create<NotificationState>()(
	devtools(
		(set) => ({
			notifications: [],
			add: (notification) =>
				set((state) => {
					let id = 0;
					if (state.notifications.length > 0) {
						id = state.notifications[state.notifications.length - 1]?.id + 1;
					}
					return {
						notifications: [
							...state.notifications,
							{
								...notification,
								id,
								date: new Date()
							}
						]
					};
				}),
			remove: (id) =>
				set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),
			removeAll: () => set({ notifications: [] })
		}),
		{ name: 'NotificationStore' }
	)
);

export const useNotificationShownNotification = () => {
	const notifications = useNotificationStore((state) => state.notifications);
	if (notifications.length > 0) {
		const newestDangerous = _.find(notifications, (n) => n.type === NotificationType.DANGER);
		if (newestDangerous) {
			return newestDangerous;
		} else {
			return notifications[0];
		}
	} else {
		return null;
	}
};
