import { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';

import {
    HealthKitQueryController,
    HealthKitQueryStatus,
    useHealthKitQueryStatus,
    useHealthKitWorkouts,
} from 'services/healthkit';

import { Activity, makeActivitiesCalendar } from './utils';

export type ActivityFeedItem = Activity;

export interface ActivityFeedSection {
    title: string;
    data: ActivityFeedItem[];
}

export function useActivityFeed() {
    const [workouts, setWorkouts] = useHealthKitWorkouts();
    const feedStatus = useHealthKitQueryStatus();

    return {
        activities: useMemo(
            () =>
                Array.from(makeActivitiesCalendar(workouts.slice().reverse())).reduce<ActivityFeedSection[]>(
                    (sections, [date, oneDayActivities]) => {
                        sections.push({ title: date, data: oneDayActivities });
                        return sections;
                    },
                    [],
                ),
            [workouts],
        ),
        isRunning: feedStatus === HealthKitQueryStatus.Running ? true : false,
        start: HealthKitQueryController.start,
        stop: HealthKitQueryController.stop,
        reset: useCallback(() => {
            Alert.alert('Reset history?', 'History reset will result in data duplicates', [
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        setWorkouts([]);
                        HealthKitQueryController.reset();
                        HealthKitQueryController.start();
                    },
                },
                { text: 'Cancel', style: 'cancel' },
            ]);
        }, [setWorkouts]),
    };
}
