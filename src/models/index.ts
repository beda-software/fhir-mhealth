import { createContext, useContext } from 'react';
import { applySnapshot, Instance, onSnapshot, types } from 'mobx-state-tree';

import { PersistentStorage } from 'services/storage';
import { UserModel } from 'models/user';

const PERSISTENCE_KEY = 'statetree.snapshot';

const StateTreeModel = types.model('StateTreeModel').props({
    user: types.optional(UserModel, {}),
});

export interface StateTree extends Instance<typeof StateTreeModel> {}

const root = StateTreeModel.create();
const StateTreeContext = createContext<StateTree>(root);

export const useStateTree = () => useContext<StateTree>(StateTreeContext);

onSnapshot(root, (snapshot) => PersistentStorage.store(PERSISTENCE_KEY, snapshot));

export async function restoreApplicationState() {
    const latestSnapshot = await PersistentStorage.retrieve<StateTree>(PERSISTENCE_KEY).catch(() => undefined);
    if (latestSnapshot !== undefined) {
        applySnapshot(root, latestSnapshot);
    }
}
