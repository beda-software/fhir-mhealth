import { useEffect, useState } from 'react';

import { HealthKitEventRegistry, HealthKitWorkout, subscribeHealthKitEvents } from 'services/healthkit';
import { postLocalNotification } from 'services/notifications';

export function useActivityFeed() {
    const [activities, setActivities] = useState<HealthKitWorkout[]>([]);

    useEffect(() => {
        const subscription = subscribeHealthKitEvents(
            HealthKitEventRegistry.SampleCreated,
            async (updates: HealthKitWorkout[]) => {
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
