import { DateTime } from 'luxon';

import { HealthKitWorkout } from 'services/healthkit';
import { formatDuration } from 'utils/datetime/duration';

export interface Activity {
    sample: HealthKitWorkout;
    duration: string;
}

export function makeActivitiesCalendar(workouts: HealthKitWorkout[]): Map<string, Activity[]> {
    return workouts.reduce<Map<string, Activity[]>>((activitiesCalendar, workout) => {
        const startDate = DateTime.fromISO(workout.startDate);
        const endDate = DateTime.fromISO(workout.endDate);
        const duration = endDate.diff(startDate, ['hours', 'minutes']);
        const effectiveDateTime = startDate.toFormat('ccc dd LLL');

        let sameDateActivities = activitiesCalendar.get(effectiveDateTime) ?? [];
        sameDateActivities.push({
            sample: workout,
            duration: formatDuration(duration),
        });
        activitiesCalendar.set(effectiveDateTime, sameDateActivities);
        return activitiesCalendar;
    }, new Map());
}
