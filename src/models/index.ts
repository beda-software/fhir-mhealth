import { createContext, useContext } from 'react';
import { applySnapshot, Instance, onSnapshot, types } from 'mobx-state-tree';

import { PersistentStorage } from 'services/storage';
import { UserModel } from 'models/user';
import { ActivityModel } from 'models/activity';
import { ServiceStatusModel } from 'models/service-status';
import { MetriportModel } from './metriport';

const PERSISTENCE_KEY = 'statetree.snapshot';

const StateTreeModel = types.model('StateTreeModel').props({
    user: types.optional(UserModel, {}),
    activity: types.optional(ActivityModel, {}),
    serviceStatus: types.snapshotProcessor(types.optional(ServiceStatusModel, {}), {
        postProcessor() {
            // Do not preserve service status between app launches
            return {};
        },
    }),
    metriport: types.optional(MetriportModel, {}),
});

export interface StateTree extends Instance<typeof StateTreeModel> {}

export const stateTree = StateTreeModel.create();
const StateTreeContext = createContext<StateTree>(stateTree);

export const useStateTree = () => useContext<StateTree>(StateTreeContext);

onSnapshot(stateTree, (snapshot) => PersistentStorage.store(PERSISTENCE_KEY, snapshot));

export async function restoreApplicationState() {
    const latestSnapshot = await PersistentStorage.retrieve<StateTree>(PERSISTENCE_KEY).catch(() => undefined);
    if (latestSnapshot !== undefined) {
        applySnapshot(stateTree, latestSnapshot);
    }
}
