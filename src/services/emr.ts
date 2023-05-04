import decodeJwt, { JwtPayload } from 'jwt-decode';
import { Patient, QuestionnaireResponse } from 'fhir/r4b';

import { FHIRAPI } from 'services/fhir';

interface EMRUser {
    role: Array<{ name: string; links: { patient?: { id: string } } }>;
}

export async function signinEMRPatient(token: string, user: { name: { given?: string; family?: string } }) {
    return signupEMRPatientOnce(token, user).then(() => fetchEMRPatient(token));
}

async function signupEMRPatientOnce(token: string, user: { name: { given?: string; family?: string } }) {
    return FHIRAPI(token).post('/Questionnaire/federated-identity-signin/$extract', {
        body: {
            resourceType: 'Parameters',
            parameter: [
                {
                    name: 'FederatedIdentity',
                    value: {
                        Identifier: {
                            system: decodeJwt<JwtPayload>(token).iss,
                            value: decodeJwt<JwtPayload>(token).sub,
                        },
                    },
                },
                {
                    name: 'questionnaire_response',
                    resource: {
                        resourceType: 'QuestionnaireResponse',
                        questionnaire: 'federated-identity-signin',
                        status: 'completed',
                        item: [
                            {
                                linkId: 'firstname',
                                answer: [{ valueString: user.name?.given }],
                            },
                            {
                                linkId: 'lastname',
                                answer: [{ valueString: user.name?.family }],
                            },
                        ],
                    } as QuestionnaireResponse,
                },
            ],
        },
    });
}

async function fetchEMRPatient(token: string): Promise<Patient> {
    const client = FHIRAPI(token);

    const userinfoResponse = await client.get('/auth/userinfo');
    if (userinfoResponse.status !== 200) {
        return Promise.reject(`Unable to fetch user roles: ${userinfoResponse.status}`);
    }

    const userinfo = (await userinfoResponse.json()) as EMRUser;
    const patientRole = userinfo.role.find((r) => r.name === 'patient');
    if (patientRole?.links.patient === undefined) {
        return Promise.reject("User doesn't have a Patient role assigned");
    }

    const patientResponse = await client.get(`/fhir/Patient/${patientRole.links.patient.id}`);
    if (patientResponse.status !== 200) {
        return Promise.reject(`Unable to fetch patient resource: ${patientResponse.status}`);
    }

    return patientResponse.json() as Promise<Patient>;
}
