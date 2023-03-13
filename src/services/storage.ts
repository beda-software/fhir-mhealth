import { NativeModules } from 'react-native';

export interface Storage {
    store: (key: string, data: object) => Promise<void>;
    retrieve: <T>(key: string) => Promise<T | undefined>;
    remove: (key: string) => Promise<void>;
}

function materializeStorageProvider(provider: 'PersistentStorage' | 'KeychainStorage'): Storage {
    return {
        store: (key: string, data: object) => NativeModules[provider].store(key, JSON.stringify(data)),
        retrieve: <T>(key: string) =>
            NativeModules[provider]
                .retrieve(key)
                .then((data?: string) => (data !== undefined ? (JSON.parse(data) as T) : undefined)),
        remove: (key: string) => NativeModules[provider].remove(key),
    };
}

/**
 * PersistentStorage - general file-based storage for caching, state-persisting between runs etc
 */
export const PersistentStorage: Storage = materializeStorageProvider('PersistentStorage');

/**
 * KeychainStorage - storage for sensitive information (objects with max size of 4KB: passwords, tokens etc)
 */
export const KeychainStorage: Storage = materializeStorageProvider('KeychainStorage');
