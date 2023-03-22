import { Navigation } from 'react-native-navigation';
import { Notifications } from 'react-native-notifications';

import { navigationLayout } from 'screens/ActivityFeed/navigation';
import { startBackgroundWorkoutRecordsSync } from 'services/datastream';
import { restoreApplicationState } from 'models';
import { preloadIconsLibraryRegistry } from 'styles/icons-library';

preloadIconsLibraryRegistry();

Navigation.events().registerAppLaunchedListener(async () => {
    await restoreApplicationState();

    Notifications.registerRemoteNotifications();
    Navigation.setRoot({
        root: {
            bottomTabs: {
                id: 'FHIRmHealth',
                children: [navigationLayout({})],
                options: {
                    bottomTabs: {
                        visible: false,
                    },
                },
            },
        },
    });

    startBackgroundWorkoutRecordsSync();
});
