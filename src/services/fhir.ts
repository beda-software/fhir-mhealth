import { FHIR_API_URL } from 'config';
import { service } from 'fhir-react/src/services/fetch';
import { Patient } from 'fhir/r4b';

export const FHIRAPI = (token: string) => ({
    get: async (path: string) =>
        fetch(`${FHIR_API_URL}/${path}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        }),

    post: async (path: string, { body }: { body: Record<string, any> }) =>
        fetch(`${FHIR_API_URL}/${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        }),
    patch: async (path: string, { body }: { body: Record<string, any> }) =>
        service<Patient>(`${FHIR_API_URL}/${path}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        }),
});
