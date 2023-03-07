import React, { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { SafeAreaView, StatusBar, ScrollView, Text, useColorScheme, Button, Alert, View } from 'react-native';

import { useActivityFeed } from './hooks';
import s from './styles';

export interface ActivityFeedProps {}

export const ActivityFeed: FC<ActivityFeedProps> = observer(function ActivityFeed(_props) {
    const isDarkMode = useColorScheme() === 'dark';
    const { activities, start, stop, reset, isRunning } = useActivityFeed();

    return (
        <SafeAreaView style={s.safeArea}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <ScrollView style={s.scrollView} contentContainerStyle={s.container}>
                {activities
                    .slice()
                    .reverse()
                    .map((activity) => (
                        <Text style={s.label} key={activity.id}>
                            {activity.display}, {activity.activeEnergyBurned} kcal
                        </Text>
                    ))}
            </ScrollView>
            <View style={s.feedControlsContainer}>
                {isRunning ? (
                    <Button title="Stop feed" onPress={stop} />
                ) : (
                    <Button title="Start feed" onPress={start} />
                )}
                <Button
                    title="Reset history"
                    onPress={() =>
                        Alert.alert(
                            'Reset history anchor?',
                            'Resetting history anchor will result in data duplicates',
                            [
                                { text: 'Reset', style: 'destructive', onPress: reset },
                                { text: 'Cancel', style: 'cancel' },
                            ],
                        )
                    }
                    color={'red'}
                />
            </View>
        </SafeAreaView>
    );
});
