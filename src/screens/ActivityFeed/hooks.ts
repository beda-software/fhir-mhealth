import { useCallback } from 'react';
import { Alert } from 'react-native';

import { HealthKitQueryController } from 'services/healthkit';

import { Activity, describeAcitivitySummary, makeActivitiesCalendar } from './utils';
import { StateTree } from 'models';
import { ActivitySummary, Workout } from 'models/activity';
import { ServiceStatus } from 'models/service-status';

export type ActivityFeedItem = Activity;

export interface ActivityFeedSection {
    title: string;
    data: ActivityFeedItem[];
    summary: string;
}

export function useActivityFeed(activity: StateTree['activity'], serviceStatus: StateTree['serviceStatus']) {
    return {
        activities: convertToActivitySections(activity.workouts, activity.summary),
        isRunning: serviceStatus.healthkit === ServiceStatus.Running ? true : false,
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

function convertToActivitySections(workouts: readonly Workout[], summary?: ActivitySummary) {
    return Array.from(makeActivitiesCalendar(workouts.slice().reverse())).reduce<ActivityFeedSection[]>(
        (sections, [date, oneDayActivities]) => {
            sections.push({ title: date, data: oneDayActivities, summary: describeAcitivitySummary(summary) });
            return sections;
        },
        [],
    );
}
