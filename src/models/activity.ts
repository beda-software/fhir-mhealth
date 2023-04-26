import { Instance, types } from 'mobx-state-tree';

const ActivitySummaryModel = types.model('ActivitySummaryModel').props({
    activeEnergyBurned: types.maybe(types.number),
    activeEnergyBurnedGoal: types.maybe(types.number),
    moveTime: types.maybe(types.number),
    moveTimeGoal: types.maybe(types.number),
    exerciesTime: types.maybe(types.number),
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
