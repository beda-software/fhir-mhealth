import React, { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { SafeAreaView, StatusBar, ScrollView, Text, useColorScheme, View, Button } from 'react-native';
import { NavigationComponentProps } from 'react-native-navigation';

import { useStateTree } from 'models';
import { useAuthentication } from 'services/auth';
import { AuthButton } from 'components/AuthButton';

import { useActivityFeed, useNavigationControls } from './hooks';
import s from './styles';

export interface ActivityFeedProps {}

export const ActivityFeed: FC<ActivityFeedProps & NavigationComponentProps> = observer(function ActivityFeed(props) {
    const isDarkMode = useColorScheme() === 'dark';
    const { user } = useStateTree();
    const { signout } = useAuthentication();

    const { activities, ...controllers } = useActivityFeed();

    useNavigationControls({ componentId: props.componentId, ...controllers });

    return (
        <SafeAreaView style={s.safeArea}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <ScrollView style={s.scrollView} contentContainerStyle={s.container}>
                {activities
                    .slice()
                    .reverse()
                    .map((activity) => (
                        <Text style={s.label} key={activity.id}>
                            {activity.display}
                            {activity.activeEnergyBurned !== undefined
                                ? `, ${Math.round(activity.activeEnergyBurned)} kcal`
                                : undefined}
                        </Text>
                    ))}
            </ScrollView>
            <View style={s.controlsContainer}>
                {user.name !== undefined ? (
                    <>
                        <Text style={s.userInfoText}>Signed in as: {user.name}</Text>
                        <Button onPress={signout} title="Sign out" />
                    </>
                ) : (
                    <AuthButton />
                )}
            </View>
        </SafeAreaView>
    );
});
