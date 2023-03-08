import { NativeModules } from 'react-native';

export const PersistentStorage = {
    store: (key: string, data: object): Promise<void> =>
        NativeModules.PersistentStorage.store(key, JSON.stringify(data)),
    retrieve: <T>(key: string): Promise<T> =>
        NativeModules.PersistentStorage.retrieve(key).then((data: string) => JSON.parse(data) as T),
    remove: (key: string): Promise<void> => NativeModules.PersistentStorage.remove(key),
};
