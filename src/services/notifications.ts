import { Notification, Notifications } from 'react-native-notifications';

export interface LocalNotification {
    title: string;
    body: string;
}

export function postLocalNotification(notification: LocalNotification) {
    return Notifications.postLocalNotification(notification as Notification);
}
