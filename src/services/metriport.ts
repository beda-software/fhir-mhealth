import { DATASTREAM_METRIPORT_URL } from 'config';

export async function fetchMetriportConnectToken(token: string, userId: string) {
    return fetch(`${DATASTREAM_METRIPORT_URL}/connect-token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
    });
}
