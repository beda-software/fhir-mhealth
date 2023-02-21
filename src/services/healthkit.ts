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

export type HealthKitEvent = { __internal_code: string };

export const HealthKitEventRegistry = {
    get SampleCreated(): HealthKitEvent {
        return { __internal_code: NativeModules.HealthKitEventChannel.HK_SAMPLE_CREATED };
    },
};

const HealthKitEventChannel = new NativeEventEmitter(NativeModules.HealthKitEventChannel);

export function subscribeHealthKitEvents(event: HealthKitEvent, handler: (eventPayload: HealthKitWorkout[]) => void) {
    return HealthKitEventChannel.addListener(event.__internal_code, handler);
}
