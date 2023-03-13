import { appleAuth, AppleRequestResponse } from '@invertase/react-native-apple-authentication';
import { useCallback, useMemo } from 'react';

import { useStateTree } from 'models';
import { KeychainStorage } from 'services/storage';

export enum AuthStatus {
    Authenticated = 1,
    NotAuthenticated = 2,
}

export interface AuthState {
    readonly status: AuthStatus;
}

export interface Authenticated extends AuthState {
    readonly status: AuthStatus.Authenticated;
    uid: string;
    username: string;
    jwt: string;
}

export interface NotAuthenticated extends AuthState {
    readonly status: AuthStatus.NotAuthenticated;
}

export function useAuthentication() {
    const { user } = useStateTree();

    const persistAuthenticationDetails = useCallback(
        (authenticationDetails: Authenticated) => {
            user.changeName(authenticationDetails.username);
            KeychainStorage.store('apple_identity', authenticationDetails);
        },
        [user],
    );

    const authenticateWithApple = useCallback(async (): Promise<AuthState> => {
        const authentication = await signInWithApple();
        if (authentication.status === AuthStatus.Authenticated) {
            persistAuthenticationDetails(authentication);
        }
        return authentication;
    }, [persistAuthenticationDetails]);

    const signout = useCallback(() => {
        user.changeName(undefined);
        KeychainStorage.remove('apple_identity');
    }, [user]);

    return useMemo(
        () => ({
            authenticate: authenticateWithApple,
            signout,
        }),
        [authenticateWithApple, signout],
    );
}

async function signInWithApple(): Promise<Authenticated | NotAuthenticated> {
    try {
        const response = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,
            requestedScopes: [appleAuth.Scope.FULL_NAME],
        });
        if ((await appleAuth.getCredentialStateForUser(response.user)) === appleAuth.State.AUTHORIZED) {
            return {
                status: AuthStatus.Authenticated,
                uid: response.user,
                username: formatAppleFullName(response.fullName),
                jwt: response.identityToken!,
            };
        } else {
            return { status: AuthStatus.NotAuthenticated };
        }
    } catch (error: any) {
        if (error.code === appleAuth.Error.CANCELED) {
            return { status: AuthStatus.NotAuthenticated };
        }
        throw error;
    }
}

function formatAppleFullName(fullName: AppleRequestResponse['fullName']): string {
    return [fullName?.namePrefix, fullName?.givenName, fullName?.middleName, fullName?.familyName]
        .filter((component): component is string => component !== undefined)
        .join(' ');
}
