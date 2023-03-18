import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import {
    HealthKitEventRegistry,
    HealthKitQueryController,
    HealthKitQueryStatus,
    HealthKitWorkout,
    subscribeHealthKitEvents,
} from 'services/healthkit';
import { postLocalNotification } from 'services/notifications';

export function useActivityFeed() {
    const [activities, setActivities] = useState<HealthKitWorkout[]>([]);
    const [feedStatus, setFeedStatus] = useState<HealthKitQueryStatus | undefined>();

    useEffect(() => {
        const subscription = subscribeHealthKitEvents(
            HealthKitEventRegistry.SampleCreated,
            (updates: HealthKitWorkout[]) => {
                setActivities((existingActivities) => existingActivities.concat(updates));
                postLocalNotification({
                    title: 'New Workout',
                    body: `The most recent activities are: ${updates.map(({ display }) => display).join(', ')}`,
                });
            },
        );

        return () => subscription.remove();
    }, []);

    useEffect(() => {
        const subscription = subscribeHealthKitEvents(HealthKitEventRegistry.QueryStatusHasChanged, setFeedStatus);

        return () => subscription.remove();
    }, []);

    return {
        activities,
        isRunning: feedStatus === HealthKitQueryStatus.Running ? true : false,
        start: HealthKitQueryController.start,
        stop: HealthKitQueryController.stop,
        reset: useCallback(() => {
            Alert.alert('Reset history?', 'History reset will result in data duplicates', [
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        setActivities([]);
                        HealthKitQueryController.reset();
                        HealthKitQueryController.start();
                    },
                },
                { text: 'Cancel', style: 'cancel' },
            ]);
        }, []),
    };
}
