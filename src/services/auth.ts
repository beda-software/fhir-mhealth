import { appleAuth, AppleRequestResponse } from '@invertase/react-native-apple-authentication';
import { useMemo } from 'react';

import { stateTree } from 'models';
import { KeychainStorage } from 'services/storage';

const AUTH_IDENTITY_KEYCHAIN_PATH = 'apple_identity';

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

export async function getUserIdentity() {
    return KeychainStorage.retrieve<Authenticated>(AUTH_IDENTITY_KEYCHAIN_PATH);
}

export async function signout() {
    stateTree.user.changeName(undefined);
    KeychainStorage.remove(AUTH_IDENTITY_KEYCHAIN_PATH);
}

export function signin(authenticationDetails: Authenticated) {
    stateTree.user.changeName(authenticationDetails.username);
    KeychainStorage.store(AUTH_IDENTITY_KEYCHAIN_PATH, authenticationDetails);
}

export function useAuthentication() {
    return useMemo(
        () => ({
            authenticate: authenticateWithApple,
            signout,
        }),
        [],
    );
}

async function authenticateWithApple() {
    const authentication = await signInWithApple();
    if (authentication.status === AuthStatus.Authenticated) {
        signin(authentication);
    }
    return authentication;
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
