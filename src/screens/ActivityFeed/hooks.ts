import { useCallback } from 'react';
import { Alert } from 'react-native';

import { HealthKitQueryController, HealthKitQueryStatus, useHealthKitQueryStatus } from 'services/healthkit';

import { Activity, makeActivitiesCalendar } from './utils';
import { StateTree } from 'models';
import { Workout } from 'models/activity';

export type ActivityFeedItem = Activity;

export interface ActivityFeedSection {
    title: string;
    data: ActivityFeedItem[];
}

export function useActivityFeed(activity: StateTree['activity']) {
    const feedStatus = useHealthKitQueryStatus();

    return {
        activities: convertToActivitySections(activity.workouts),
        isRunning: feedStatus === HealthKitQueryStatus.Running ? true : false,
        start: HealthKitQueryController.start,
        stop: HealthKitQueryController.stop,
        reset: useCallback(() => {
            Alert.alert('Reset history?', 'History reset will result in data duplicates', [
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        activity.clear();
                        HealthKitQueryController.reset();
                        HealthKitQueryController.start();
                    },
                },
                { text: 'Cancel', style: 'cancel' },
            ]);
        }, [activity]),
    };
}

function convertToActivitySections(workouts: readonly Workout[]) {
    return Array.from(makeActivitiesCalendar(workouts.slice().reverse())).reduce<ActivityFeedSection[]>(
        (sections, [date, oneDayActivities]) => {
            sections.push({ title: date, data: oneDayActivities });
            return sections;
        },
        [],
    );
}
