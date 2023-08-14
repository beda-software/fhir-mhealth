import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { HealthKitQueryController } from 'services/healthkit';

import { Activity, describeAcitivitySummary, makeActivitiesCalendar } from './utils';
import { StateTree, stateTree } from 'models';
import { ActivitySummary, Workout } from 'models/activity';
import { ServiceStatus } from 'models/service-status';
import { getUserIdentity } from 'services/auth';
import { fetchMetriportConnectToken } from 'services/metriport';

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
                    onPress: async () => {
                        activity.clear();
                        await HealthKitQueryController.reset();
                        await HealthKitQueryController.start();
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

interface ConnectTokenResponseData {
    token: string;
}

export function useMetriportWidget(userId?: string) {
    const [metriportModalVisible, setMetriportModalVisible] = useState(false);

    const getConnectToken = useCallback(async () => {
        if (userId) {
            const userIdentity = await getUserIdentity();
            try {
                if (userIdentity?.jwt) {
                    const response = await fetchMetriportConnectToken(userIdentity.jwt, userId);

                    if (response.status === 200) {
                        const result: ConnectTokenResponseData = await response.json();
                        stateTree.metriport.updateMetriportConnectToken(result.token);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }
    }, [userId]);

    useEffect(() => {
        getConnectToken();
    }, [getConnectToken]);

    return { metriportModalVisible, setMetriportModalVisible };
}
