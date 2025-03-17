export enum NotificationType {
    INFO,
    WARNING,
    ERROR
}

interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    timestamp: number;
}

export class NotificationManager {
    private notifications: Notification[] = [];

    send(type: NotificationType, message: string) {
        const notification: Notification = {
            id: this.generateId(),
            type,
            message,
            timestamp: Date.now(),
        };
        this.notifications.push(notification);
    }

    getAll(): Notification[] {
        return this.notifications;
    }

    getByType(type: NotificationType): Notification[] {
        return this.notifications.filter(n => n.type === type);
    }

    pop(): Notification | null {
        return this.notifications.pop() || null;
    }

    clear() {
        this.notifications = [];
    }

    *iterate(): Generator<Notification> {
        for (const notification of this.notifications) {
            yield notification;
        }
    }

    private generateId(): string {
        return Math.random().toString(36).substring(2, 10);
    }

    printAll() {
        console.table(this.notifications);
    }
}