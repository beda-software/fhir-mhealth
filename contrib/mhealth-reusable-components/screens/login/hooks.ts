import { useEffect, useMemo, useState } from 'react';

import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';

import { setAuthToken } from '@/services/auth';

import * as config from '@/config';
import { useSession } from '@/context/auth/hooks';

export function useLoginScreen() {
    const { onAuthStatusChanged } = useSession();
    const appScheme = Constants.expoConfig!.scheme![0];
    const redirectUri = AuthSession.makeRedirectUri({ scheme: appScheme, path: 'login' });
    const [obtainTokenError, setTokenError] = useState<string | undefined>(undefined);

    const discovery = AuthSession.useAutoDiscovery(config.OAUTH_BASE_URL);
    const [request, result, onSignIn] = AuthSession.useAuthRequest(
        {
            clientId: config.OAUTH_CLIENT_ID,
            redirectUri,
            scopes: ['profile'],
        },
        discovery,
    );

    useEffect(() => {
        if (request && discovery && result?.type === 'success') {
            const authCode = result.params.code;
            const tokenURL = discovery.tokenEndpoint ?? config.OAUTH_TOKEN_ENDPOINT;

            try {
                setAuthToken({
                    tokenURL,
                    authCode,
                    codeVerifier: request.codeVerifier!,
                    onSetToken: onAuthStatusChanged,
                });
            } catch (error) {
                if (error instanceof Error) {
                    setTokenError(error.message);
                }
            }
        }
    }, [result, discovery, request, onAuthStatusChanged]);

    const isReadyForRequest = useMemo(() => request !== null, [request]);

    return { onSignIn, isReadyForRequest, result, obtainTokenError };
}
