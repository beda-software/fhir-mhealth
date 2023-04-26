import { DateTime } from 'luxon';

import { Workout } from 'models/activity';
import { formatDuration } from 'utils/datetime/duration';

export interface Activity {
    sample: Workout;
    duration: string;
}

export function makeActivitiesCalendar(workouts: readonly Workout[]): Map<string, Activity[]> {
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
