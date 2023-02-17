import { useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';

import { postLocalNotification } from 'services/notifications';

export interface ActivityFeedSample {
    id: string;
    startDate: string;
    endDate: string;
    category?: string;
    code?: string;
    display?: string;
}

export interface WorkoutFeedSample extends ActivityFeedSample {
    readonly category: 'workout';
    duration?: number;
    activeEnergyBurned?: number;
}

export function useActivityFeed() {
    const [activities, setActivities] = useState<WorkoutFeedSample[]>([]);

    useEffect(() => {
        const subscription = new NativeEventEmitter(NativeModules.HealthKitEventEmitter).addListener(
            'hk-sample-created',
            async (updates: Array<WorkoutFeedSample>) => {
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
