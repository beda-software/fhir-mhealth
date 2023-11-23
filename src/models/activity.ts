import { Instance, types } from 'mobx-state-tree';

const WORKOUTS_HISTORY_TO_KEEP = 30;

const ActivitySummaryModel = types.model('ActivitySummaryModel').props({
    activeEnergyBurned: types.maybe(types.number),
    activeEnergyBurnedGoal: types.maybe(types.number),
    moveTime: types.maybe(types.number),
    moveTimeGoal: types.maybe(types.number),
    exerciseTime: types.maybe(types.number),
    standHours: types.maybe(types.number),
    exerciseTimeGoal: types.maybe(types.number),
    standHoursGoal: types.maybe(types.number),
});

export interface ActivitySummary extends Instance<typeof ActivitySummaryModel> {}

export enum ActivitySampleCategory {
    Workout = 'workout',
}

const ActivitySampleModel = types.model('ActivitySampleModel').props({
    id: types.string,
    startDate: types.string,
    endDate: types.string,
    category: types.enumeration<ActivitySampleCategory>(
        'ActivitySampleCategory',
        Object.values(ActivitySampleCategory),
    ),
    code: types.maybe(types.string),
    display: types.maybe(types.string),
});

const WorkoutSampleModel = types.model('WorkoutSampleModel').props({
    category: types.literal(ActivitySampleCategory.Workout),
    duration: types.maybe(types.number),
    activeEnergyBurned: types.maybe(types.number),
});

const WorkoutModel = types.compose('WorkoutModel', ActivitySampleModel, WorkoutSampleModel);

export interface Workout extends Instance<typeof WorkoutModel> {}

export const ActivityModel = types
    .model('ActivityModel')
    .props({
        workouts: types.array(WorkoutModel),
        summary: types.maybe(ActivitySummaryModel),
    })
    .actions((self) => ({
        pushWorkouts: (workouts: Workout[]) => {
            for (const workout of workouts) {
                const existingWorkout = self.workouts.find((w) => w.id === workout.id);
                if (existingWorkout) {
                    continue;
                }
                self.workouts.push(workout);
                if (self.workouts.length > WORKOUTS_HISTORY_TO_KEEP) {
                    self.workouts.shift();
                }
            }
        },
        updateSummary: (summary: ActivitySummary | undefined) => {
            self.summary = summary;
        },
        clear: () => {
            self.workouts.splice(0, self.workouts.length);
            self.summary = undefined;
        },
    }));
