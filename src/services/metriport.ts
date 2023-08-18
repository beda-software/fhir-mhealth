import { DATASTREAM_METRIPORT_URL, FHIR_API_URL, METRIPORT_IDENTIFIER_SYSTEM } from 'config';
import { service } from 'fhir-react/lib/services/service';
import { Patient } from 'fhir/r4b';
import { success } from 'fhir-react/src/libs/remoteData';

interface ConnectTokenResponseData {
    token: string;
    metriportUserId: string;
}

export async function fetchMetriportConnectToken(token: string, userId: string) {
    return service<ConnectTokenResponseData>({
        baseURL: DATASTREAM_METRIPORT_URL,
        url: '/connect-token',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        data: { userId },
    });
}

interface UpdatePatientIdentifierArgs {
    token: string;
    patient: Patient;
    metriportUserId: string;
}

export async function updatePatientIdentifier(args: UpdatePatientIdentifierArgs) {
    const { patient } = args;
    const metriportIdentifier = patient.identifier?.find((i) => i.system === METRIPORT_IDENTIFIER_SYSTEM);
    if (metriportIdentifier) {
        return success(patient);
    }

    return await service<Patient>({
        baseURL: FHIR_API_URL,
        url: `/Patient/${patient.id}`,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${args.token}` },
        data: {
            id: patient.id,
            identifier: [
                ...(patient.identifier ?? []),
                { system: METRIPORT_IDENTIFIER_SYSTEM, value: args.metriportUserId },
            ],
        },
    });
}
