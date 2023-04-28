import { useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { ActivitySummary, Workout } from 'models/activity';
import { ServiceStatus } from 'models/service-status';

export type HealthKitEvent<T> = { __internal_code: string; __payload?: { __type: T } };

export const HealthKitEventRegistry = {
    get SampleCreated(): HealthKitEvent<Workout[]> {
        return { __internal_code: NativeModules.HealthKitEventChannel.getConstants().HK_SAMPLE_CREATED };
    },
    get QueryStatusHasChanged(): HealthKitEvent<ServiceStatus> {
        return { __internal_code: NativeModules.HealthKitEventChannel.getConstants().HK_QUERY_STATUS_HAS_CHANGED };
    },
};

type HealthKitEventPayload = NonNullable<
    (typeof HealthKitEventRegistry)[keyof typeof HealthKitEventRegistry]['__payload']
>['__type'];

const HealthKitEventChannel = new NativeEventEmitter(NativeModules.HealthKitEventChannel);

export function subscribeHealthKitEvents<P = HealthKitEventPayload>(
    event: HealthKitEvent<P>,
    handler: (eventPayload: P) => void,
) {
    return HealthKitEventChannel.addListener(event.__internal_code, handler);
}

export const HealthKitQueryController = {
    start: () => NativeModules.HealthKitQueryController.start(),
    stop: () => NativeModules.HealthKitQueryController.stop(),
    reset: () => NativeModules.HealthKitQueryController.reset(),
    status: (): Promise<ServiceStatus.Running | ServiceStatus.Stopped> =>
        NativeModules.HealthKitQueryController.status(),
};

export const HealthKitQuery = {
    activitySummary: (): Promise<ActivitySummary | undefined> => NativeModules.HealthKitQuery.activitySummary(),
};

export function useHealthKitQueryStatus() {
    const [status, setStatus] = useState<ServiceStatus>();

    useEffect(() => {
        HealthKitQueryController.status().then((currentStatus) =>
            setStatus(currentStatus === ServiceStatus.Running ? ServiceStatus.Running : ServiceStatus.Stopped),
        );

        const subscription = subscribeHealthKitEvents(HealthKitEventRegistry.QueryStatusHasChanged, setStatus);

        return () => subscription.remove();
    }, []);

    return status;
}
