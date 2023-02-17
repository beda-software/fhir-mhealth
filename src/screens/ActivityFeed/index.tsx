import React from 'react';
import { SafeAreaView, StatusBar, ScrollView, Text, useColorScheme } from 'react-native';

import { useActivityFeed } from './hooks';
import s from './styles';

export interface ActivityFeedProps {}

export function ActivityFeed(_props: ActivityFeedProps) {
    const isDarkMode = useColorScheme() === 'dark';
    const activities = useActivityFeed();

    return (
        <SafeAreaView style={s.safeArea}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <ScrollView contentContainerStyle={s.container}>
                {activities.reverse().map((activity) => (
                    <Text style={s.label} key={activity.id}>
                        {activity.display}, {activity.activeEnergyBurned} kcal
                    </Text>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}
