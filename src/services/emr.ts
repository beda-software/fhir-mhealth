import { DateTime } from 'luxon';
import decodeJwt, { JwtPayload } from 'jwt-decode';
import { Patient, QuestionnaireResponse } from 'fhir/r4b';

import { FHIRAPI } from 'services/fhir';
import { ActivitySummary } from 'models/activity';
import { RemoteDataResult, failure, isFailure, isSuccess } from 'fhir-react/src/libs/remoteData';
import { FetchError } from 'fhir-react/src/services/fetch';

interface EMRUser {
    role: Array<{ name: string; links: { patient?: { id: string } } }>;
}

export async function signinEMRPatient(token: string, user: { name: { given?: string; family?: string } }) {
    const response = await signupEMRPatientOnce(token, user);
    if (isSuccess(response)) {
        return await fetchEMRPatient(token);
    } else {
        return response;
    }
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

async function fetchEMRPatient(token: string): Promise<RemoteDataResult<Patient, FetchError>> {
    const client = FHIRAPI(token);

    const userinfoResponse = await client.get('/auth/userinfo');
    if (isFailure(userinfoResponse)) {
        return userinfoResponse;
    }

    const userinfo = userinfoResponse.data as EMRUser;
    const patientRole = userinfo.role.find((r) => r.name === 'patient');
    if (patientRole?.links.patient === undefined) {
        return failure<FetchError>({ message: "User doesn't have a Patient role assigned" });
    }

    return await client.get(`/fhir/Patient/${patientRole.links.patient.id}`);
}

export async function uploadActivitySummaryObservation(token: string, patient: Patient, summary: ActivitySummary) {
    return FHIRAPI(token).post('/Questionnaire/activity-summary/$extract', {
        body: {
            resourceType: 'Parameters',
            parameter: [
                {
                    name: 'questionnaire_response',
                    resource: {
                        resourceType: 'QuestionnaireResponse',
                        questionnaire: 'activity-summary',
                        subject: { reference: `Patient/${patient.id}` },
                        item: [
                            {
                                linkId: 'effective',
                                answer: [{ valueDate: DateTime.now().toISODate() }],
                            },
                            {
                                linkId: 'active-energy-burned-goal',
                                answer: [{ valueQuantity: { value: summary.activeEnergyBurnedGoal } }],
                            },
                            {
                                linkId: 'active-energy-burned',
                                answer: [{ valueQuantity: { value: summary.activeEnergyBurned } }],
                            },
                            {
                                linkId: 'stand-hours-goal',
                                answer: [{ valueQuantity: { value: summary.standHoursGoal } }],
                            },
                            {
                                linkId: 'stand-hours',
                                answer: [{ valueQuantity: { value: summary.standHours } }],
                            },
                            {
                                linkId: 'exercise-time-goal',
                                answer: [{ valueQuantity: { value: summary.exerciseTimeGoal } }],
                            },
                            {
                                linkId: 'exercise-time',
                                answer: [{ valueQuantity: { value: summary.exerciseTime } }],
                            },
                        ],
                    } as QuestionnaireResponse,
                },
            ],
        },
    });
}
