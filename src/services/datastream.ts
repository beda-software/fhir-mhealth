import { DATASTREAM_API_URL } from 'config';
import { HealthKitEventRegistry, HealthKitWorkout, subscribeHealthKitEvents } from 'services/healthkit';

export function launchBackgroundWorkoutRecordsSync() {
    if (DATASTREAM_API_URL !== undefined) {
        subscribeHealthKitEvents(HealthKitEventRegistry.SampleCreated, async (workouts: HealthKitWorkout[]) => {
            fetch(DATASTREAM_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    records: workouts.map((r) => ({
                        sid: r.id,
                        ts: r.startDate,
                        start: r.startDate,
                        finish: r.endDate,
                        code: r.code,
                        duration: r.duration,
                        energy: r.activeEnergyBurned,
                    })),
                }),
            });
        });
    }
}
