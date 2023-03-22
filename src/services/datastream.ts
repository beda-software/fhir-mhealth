import { DATASTREAM_API_URL } from 'config';
import { HealthKitEventRegistry, HealthKitWorkout, subscribeHealthKitEvents } from 'services/healthkit';
import { postLocalNotification } from 'services/notifications';

export function startBackgroundWorkoutRecordsSync() {
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
            postLocalNotification({
                title: 'New Workout',
                body: `The most recent workouts are: ${workouts.map(({ display }) => display).join(', ')}`,
            });
        });
    }
}
