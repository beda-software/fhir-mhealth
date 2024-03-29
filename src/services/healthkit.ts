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
    handler: (eventPayload: P) => Promise<void>,
) {
    return HealthKitEventChannel.addListener(event.__internal_code, ({ transaction, event: payload }) =>
        handler(payload).then(async () => {
            if (transaction !== undefined) {
                await HealthKitQueryController.commit(transaction);
            }
        }),
    );
}

export const HealthKitQueryController = {
    start: async (): Promise<void> => NativeModules.HealthKitQueryController.start(),
    stop: async (): Promise<void> => NativeModules.HealthKitQueryController.stop(),
    reset: async (): Promise<void> => NativeModules.HealthKitQueryController.reset(),
    status: async (): Promise<ServiceStatus.Running | ServiceStatus.Stopped> =>
        NativeModules.HealthKitQueryController.status(),
    commit: async (transaction: string): Promise<void> => NativeModules.HealthKitQueryController.commit(transaction),
};

export const HealthKitQuery = {
    activitySummary: (): Promise<ActivitySummary | undefined> => NativeModules.HealthKitQuery.activitySummary(),
};
