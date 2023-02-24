import { NativeEventEmitter, NativeModules } from 'react-native';

export enum HealthKitSampleCategory {
    Workout = 'workout',
}

export interface HealthKitSample {
    id: string;
    startDate: string;
    endDate: string;
    category?: HealthKitSampleCategory;
    code?: string;
    display?: string;
}

export interface HealthKitWorkout extends HealthKitSample {
    readonly category: HealthKitSampleCategory.Workout;
    duration?: number;
    activeEnergyBurned?: number;
}

export enum HealthKitQueryStatus {
    Running = 'running',
    Stopped = 'stopped',
}

export type HealthKitEvent<T> = { __internal_code: string; __payload?: { __type: T } };

export const HealthKitEventRegistry = {
    get SampleCreated(): HealthKitEvent<HealthKitWorkout[]> {
        return { __internal_code: NativeModules.HealthKitEventChannel.HK_SAMPLE_CREATED };
    },
    get QueryStatusHasChanged(): HealthKitEvent<HealthKitQueryStatus> {
        return { __internal_code: NativeModules.HealthKitEventChannel.HK_QUERY_STATUS_HAS_CHANGED };
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
};
