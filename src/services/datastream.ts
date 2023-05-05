import { DATASTREAM_API_URL } from 'config';
import { stateTree } from 'models';
import { Workout } from 'models/activity';
import { HealthKitEventRegistry, HealthKitQuery, subscribeHealthKitEvents } from 'services/healthkit';
import { postLocalNotification } from 'services/notifications';
import { getUserIdentity, signout } from 'services/auth';
import { uploadActivitySummaryObservation } from 'services/emr';

export function attachActivityHistoryDataStream() {
    HealthKitQuery.activitySummary().then(stateTree.activity.updateSummary);

    subscribeHealthKitEvents(HealthKitEventRegistry.SampleCreated, async (workouts: Workout[]) => {
        const identity = await getUserIdentity();

        if (DATASTREAM_API_URL !== undefined) {
            uploadWorkoutHistory(identity?.jwt, workouts).then(
                checkResponseStatus({ from: 'Time Series Data Stream' }),
            );
        }
        stateTree.activity.pushWorkouts(workouts);

        HealthKitQuery.activitySummary().then((summary) => {
            if (identity && stateTree.user.patient && summary) {
                // EMR requires patient to be authenticated to submit observations
                uploadActivitySummaryObservation(identity.jwt, stateTree.user.patient, summary).then(
                    checkResponseStatus({ from: 'EMR' }),
                );
            }
            stateTree.activity.updateSummary(summary);
        });

        postLocalNotification({
            title: 'New Workout',
            body: `The most recent workouts are: ${workouts.map(({ display }) => display).join(', ')}`,
        });
    });
    subscribeHealthKitEvents(
        HealthKitEventRegistry.QueryStatusHasChanged,
        stateTree.serviceStatus.updateHealthKitServiceStatus,
    );
}

async function uploadWorkoutHistory(token: string | undefined, workouts: Workout[]) {
    return fetch(DATASTREAM_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : undefined),
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

function checkResponseStatus({ from: service }: { from: string }) {
    return (response: Response) => {
        switch (response.status) {
            case 200:
                break;
            case 401:
                signout();
                break;
            default:
                throw Error(`"${service}" service request has Failed, operation status: ${response.status}`);
        }
    };
}
