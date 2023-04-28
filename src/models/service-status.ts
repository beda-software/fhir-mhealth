import { types } from 'mobx-state-tree';

export enum ServiceStatus {
    Running = 'running',
    Stopped = 'stopped',
}

export const ServiceStatusModel = types
    .model('ServiceStatusModel')
    .props({
        healthkit: types.maybe(types.enumeration<ServiceStatus>('ServiceStatus', Object.values(ServiceStatus))),
    })
    .actions((self) => ({
        updateHealthKitServiceStatus: (status: ServiceStatus) => (self.healthkit = status),
    }));
