import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Navigation, NavigationComponentProps } from 'react-native-navigation';

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
        status: feedStatus,
        start: HealthKitQueryController.start,
        stop: HealthKitQueryController.stop,
        reset: () => {
            setActivities([]);
            HealthKitQueryController.reset();
        },
    };
}

export function useNavigationControls(
    props: NavigationComponentProps & {
        start: () => void;
        stop: () => void;
        reset: () => void;
        status?: HealthKitQueryStatus;
    },
) {
    const { componentId, status, start, stop, reset } = props;

    useEffect(() => {
        Navigation.mergeOptions(componentId, {
            topBar: {
                leftButtons: [
                    {
                        id: 'toggle',
                        text: status === HealthKitQueryStatus.Running ? 'Stop' : 'Start',
                    },
                ],
            },
        });
    }, [status, componentId]);

    useEffect(() => {
        const buttonHandler = Navigation.events().registerNavigationButtonPressedListener(({ buttonId }) => {
            switch (buttonId) {
                case 'toggle':
                    if (status === HealthKitQueryStatus.Running) {
                        stop();
                    } else {
                        start();
                    }
                    break;
                case 'reset':
                    Alert.alert('Reset history anchor?', 'Resetting history anchor will result in data duplicates', [
                        {
                            text: 'Reset',
                            style: 'destructive',
                            onPress: reset,
                        },
                        { text: 'Cancel', style: 'cancel' },
                    ]);
            }
        });

        return () => buttonHandler.remove();
    }, [status, start, stop, reset]);
}
