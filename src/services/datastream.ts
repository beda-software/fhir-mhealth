import { DATASTREAM_API_URL } from 'config';
import { HealthKitEventRegistry, HealthKitQuery, subscribeHealthKitEvents } from 'services/healthkit';
import { postLocalNotification } from 'services/notifications';
import { getUserIdentity } from 'services/auth';
import { stateTree } from 'models';
import { Workout } from 'models/activity';

export function attachActivityHistoryDataStream() {
    subscribeHealthKitEvents(HealthKitEventRegistry.SampleCreated, async (workouts: Workout[]) => {
        stateTree.activity.pushWorkouts(workouts);
        HealthKitQuery.activitySummary().then((summary) => stateTree.activity.updateSummary(summary));

        if (DATASTREAM_API_URL !== undefined) {
            uploadWorkoutHistory(workouts);
        }

        postLocalNotification({
            title: 'New Workout',
            body: `The most recent workouts are: ${workouts.map(({ display }) => display).join(', ')}`,
        });
    });
}

async function uploadWorkoutHistory(workouts: Workout[]) {
    const identity = await getUserIdentity();

    return fetch(DATASTREAM_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(identity ? { Authorization: `Bearer ${identity.jwt}` } : undefined),
        },
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
}
