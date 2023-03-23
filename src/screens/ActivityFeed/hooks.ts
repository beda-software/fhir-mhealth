import { useCallback } from 'react';
import { Alert } from 'react-native';

import { Activity } from './utils';

export type ActivityFeedItem = Activity;

export interface ActivityFeedSection {
    title: string;
    data: ActivityFeedItem[];
}

export function useActivityFeed() {
    return {
        activities: [],
        isRunning: true,
        start: () => {},
        stop: () => {},
        reset: useCallback(() => {
            Alert.alert('Reset history?', 'History reset will result in data duplicates', [
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {},
                },
                { text: 'Cancel', style: 'cancel' },
            ]);
        }, []),
    };
}
