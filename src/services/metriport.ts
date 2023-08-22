import { DATASTREAM_METRIPORT_URL, METRIPORT_IDENTIFIER_SYSTEM } from 'config';
import { service } from 'fhir-react/lib/services/service';
import { Patient } from 'fhir/r4b';
import { success } from 'fhir-react/src/libs/remoteData';
import { FHIRAPI } from './fhir';

interface ConnectTokenResponseData {
    token: string;
    metriportUserId: string;
}

export async function fetchMetriportConnectToken(token: string) {
    return service<ConnectTokenResponseData>({
        baseURL: DATASTREAM_METRIPORT_URL,
        url: '/connect-token',
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
}

interface UpdatePatientIdentifierArgs {
    token: string;
    patient: Patient;
    metriportUserId: string;
}

export async function updatePatientIdentifier(args: UpdatePatientIdentifierArgs) {
    const { patient, token } = args;
    const metriportIdentifier = patient.identifier?.find((i) => i.system === METRIPORT_IDENTIFIER_SYSTEM);
    if (metriportIdentifier) {
        return success(patient);
    }
    return FHIRAPI(token).patch('/Patient', {
        body: {
            id: patient.id,
            identifier: [
                ...(patient.identifier ?? []),
                { system: METRIPORT_IDENTIFIER_SYSTEM, value: args.metriportUserId },
            ],
        },
    });
}
