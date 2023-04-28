import { init as configureSentry } from '@sentry/react-native';

import { SENTRY_DSN } from 'config';

export function setupSentryErrorTracking() {
    if (SENTRY_DSN !== undefined) {
        configureSentry({
            dsn: SENTRY_DSN,
        });
    }
}
