import { types } from 'mobx-state-tree';

export const UserModel = types
    .model('UserModel')
    .props({ name: types.maybe(types.string) })
    .actions((self) => ({
        changeName: (newName?: string) => (self.name = newName),
    }));
