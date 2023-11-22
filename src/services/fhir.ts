import { FHIR_API_URL } from 'config';
import { service } from 'fhir-react/src/services/fetch';

export const FHIRAPI = (token: string) => ({
    get: async <S = any>(path: string) =>
        service<S>(`${FHIR_API_URL}/${path}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        }),

    post: async <S = any>(path: string, { body }: { body: Record<string, any> }) =>
        service<S>(`${FHIR_API_URL}/${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        }),
    patch: async <S = any>(path: string, { body }: { body: Record<string, any> }) =>
        service<S>(`${FHIR_API_URL}/${path}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        }),
});
