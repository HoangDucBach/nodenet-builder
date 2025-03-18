import React, { useState, useEffect, useRef } from 'react';
import * as GameSdk from "@/game-sdk"
import { nanoid } from 'nanoid';

// Notification types (matching those in NotificationManager)
const NotificationType = {
    INFO: 'INFO',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
    SUCCESS: 'SUCCESS'
};

const NotificationItem = ({ notification }: { notification: string }) => {

    return (
        <div className={`flex items-start p-3 mb-2 rounded-lg borderrelative`}>
            <p>
                {notification}
            </p>
        </div>
    );
};

const NotificationPanel = ({ notifications = [], maxHeight = "500px" }: { notifications: string[], maxHeight?: string }) => {
    const [visibleNotifications, setVisibleNotifications] = useState(notifications);
    const notificationEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setVisibleNotifications(notifications);
        scrollToBottom();
    }, [notifications]);

    const scrollToBottom = () => {
        if (notificationEndRef.current) {
            notificationEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };


    return (
        <div className="w-64 bg-white rounded-3xl p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Notifications</h3>
                {visibleNotifications.length > 0 && (
                    <button
                        className="text-xs text-gray-500 hover:text-gray-700"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {visibleNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                    <p>No notifications yet</p>
                </div>
            ) : (
                <div className="overflow-y-auto flex-1" style={{ maxHeight }}>
                    {visibleNotifications.map(notification => (
                        <NotificationItem
                            key={nanoid()}
                            notification={notification}
                        />
                    ))}
                    <div ref={notificationEndRef} />
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;