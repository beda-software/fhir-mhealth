import { Navigation } from 'react-native-navigation';
import { Notifications } from 'react-native-notifications';

import { attachActivityHistoryDataStream } from 'services/datastream';
import { setupSentryErrorTracking } from 'services/sentry';
import { restoreApplicationState } from 'models';
import { preloadIconsLibraryRegistry } from 'styles/icons-library';
import { loginRoot } from 'screens/Login/navigation';
import { getUserIdentity } from 'services/auth';
import { mainRoot } from 'screens/navigation';

setupSentryErrorTracking();
preloadIconsLibraryRegistry();

Navigation.events().registerAppLaunchedListener(async () => {
    await restoreApplicationState();
    const identity = await getUserIdentity();

    Notifications.registerRemoteNotifications();
    if (identity) {
        Navigation.setRoot(mainRoot);
        attachActivityHistoryDataStream();
    } else {
        Navigation.setRoot(loginRoot);
    }
});
