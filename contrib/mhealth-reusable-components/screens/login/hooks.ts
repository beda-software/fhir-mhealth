import { useEffect, useMemo, useState } from 'react';

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

interface SetAuthTokenArgs {
    tokenURL: string;
    authCode: string;
    codeVerifier: string;
    onSetToken: () => void;
}

export interface LoginScreenProps {
    clientId: string,
    baseURL: string,
    setAuthToken: (args: SetAuthTokenArgs) => Promise<void>;
    useSession: () => {
        onAuthStatusChanged: () => void;
    }
}

export function useLoginScreen({ clientId, setAuthToken, useSession, baseURL}:LoginScreenProps) {
    const { onAuthStatusChanged } = useSession();
    const appScheme = Constants.expoConfig!.scheme![0];
    const redirectUri = AuthSession.makeRedirectUri({ scheme: appScheme, path: 'login' });
    const [obtainTokenError, setTokenError] = useState<string | undefined>(undefined);

    const discovery = AuthSession.useAutoDiscovery(baseURL);
    const [request, result, onSignIn] = AuthSession.useAuthRequest(
        {
            clientId: clientId,
            redirectUri,
            scopes: ['profile'],
        },
        discovery,
    );

    useEffect(() => {
        if (request && discovery && result?.type === 'success') {
            const authCode = result.params.code;
            const defaultTokenUrl = `${baseURL}/auth/token`;
            const tokenURL = discovery.tokenEndpoint ?? defaultTokenUrl;

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
