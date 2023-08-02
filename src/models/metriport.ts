import { types } from 'mobx-state-tree';

export const MetriportModel = types
    .model('MetroportModel')
    .props({
        connectToken: types.maybe(types.string),
    })
    .actions((self) => ({
        updateMetriportConnectToken: (token: string) => (self.connectToken = token),
    }));
