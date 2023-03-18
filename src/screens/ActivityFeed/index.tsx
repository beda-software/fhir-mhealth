import React, { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { SafeAreaView, StatusBar, ScrollView, Text, View } from 'react-native';
import { NavigationComponentProps } from 'react-native-navigation';

import { useStateTree } from 'models';
import { useAuthentication } from 'services/auth';
import { AuthButton } from 'components/AuthButton';
import { Button } from 'components/Button';

import { useActivityFeed } from './hooks';
import s from './styles';

export interface ActivityFeedProps {}

export const ActivityFeed: FC<ActivityFeedProps & NavigationComponentProps> = observer(function ActivityFeed(_props) {
    const { user } = useStateTree();
    const { signout } = useAuthentication();

    const { activities, ...controllers } = useActivityFeed();

    return (
        <SafeAreaView style={s.safeArea}>
            <View style={s.container}>
                <StatusBar barStyle={'light-content'} />
                <View style={s.header}>
                    <View style={s.headerTitle}>
                        <Text style={s.title}>Activity</Text>
                    </View>
                    <View style={s.headerControls}>
                        {controllers.isRunning ? (
                            <Button icon={'stop'} onPress={controllers.stop} />
                        ) : (
                            <Button icon={'play'} onPress={controllers.start} />
                        )}
                        <Button icon={'rotate-right'} onPress={controllers.reset} />
                    </View>
                </View>
                <ScrollView style={s.scrollView} contentContainerStyle={s.scrollViewContent}>
                    {activities
                        .slice()
                        .reverse()
                        .map((activity) => (
                            <View key={activity.id}>
                                <Text style={s.label}>{activity.display}</Text>
                                {activity.activeEnergyBurned !== undefined ? (
                                    <Text style={s.energy}>{Math.round(activity.activeEnergyBurned)} kcal</Text>
                                ) : undefined}
                            </View>
                        ))}
                </ScrollView>
                <View style={s.signInContainer}>
                    {user.name !== undefined ? (
                        <>
                            <Button onPress={signout} label="Sign out" />
                            <Text style={s.signInDescriptionText}>Signed in as: {user.name}</Text>
                        </>
                    ) : (
                        <>
                            <AuthButton />
                            <Text style={s.signInDescriptionText}>{}</Text>
                        </>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
});
