import { createContext, useContext } from 'react';
import { Instance, types } from 'mobx-state-tree';

const StateTreeModel = types.model('StateTreeModel').props({});

export interface StateTree extends Instance<typeof StateTreeModel> {}

const root = StateTreeModel.create();
const StateTreeContext = createContext<StateTree>(root);

export const useStateTree = () => useContext<StateTree>(StateTreeContext);
