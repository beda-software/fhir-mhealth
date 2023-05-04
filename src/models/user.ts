import { Patient } from 'fhir/r4b';
import { types } from 'mobx-state-tree';
import { formatHumanName } from 'utils/fhir';

export const UserModel = types
    .model('UserModel')
    .props({ patient: types.maybe(types.frozen<Patient>()) })
    .views((self) => ({
        get name() {
            return self.patient?.name?.[0] ? formatHumanName(self.patient.name[0]) : undefined;
        },
    }))
    .actions((self) => ({
        switchPatient: (patient?: Patient) => (self.patient = patient),
    }));
