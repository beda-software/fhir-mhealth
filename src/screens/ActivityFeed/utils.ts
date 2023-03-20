import { DateTime } from 'luxon';

import { HealthKitWorkout } from 'services/healthkit';

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
            duration: duration.hours !== 0 ? duration.toFormat("h 'hr' m 'min'") : duration.toFormat("m 'min'"),
        });
        activitiesCalendar.set(effectiveDateTime, sameDateActivities);
        return activitiesCalendar;
    }, new Map());
}
