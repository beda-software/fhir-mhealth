import { useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';

import { postLocalNotification } from 'services/notifications';

export interface ActivityFeedSample {
    id: string;
    code?: string;
    display?: string;
}

export function useActivityFeed() {
    const [activities, setActivities] = useState<ActivityFeedSample[]>([]);

    useEffect(() => {
        const subscription = new NativeEventEmitter(NativeModules.HealthKitEventEmitter).addListener(
            'hk-sample-created',
            async (updates: Array<ActivityFeedSample>) => {
                setActivities((existingActivities) => existingActivities.concat(updates));
                postLocalNotification({
                    title: 'New Workout',
                    body: `The most recent activities are: ${updates.map(({ display }) => display).join(', ')}`,
                });
            },
        );

        return () => subscription.remove();
    }, []);

    return activities;
}
