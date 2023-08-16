import { DATASTREAM_METRIPORT_URL } from 'config';
import { service } from 'fhir-react/lib/services/service';

interface ConnectTokenResponseData {
    token: string;
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
