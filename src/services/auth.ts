import { appleAuth, AppleRequestResponse } from '@invertase/react-native-apple-authentication';

import { stateTree } from 'models';
import { KeychainStorage } from 'services/storage';
import { signinEMRPatient } from 'services/emr';

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
    jwt: string;
}

interface AuthenticatedAppleResponse extends Authenticated {
    uid: string;
    username: AppleRequestResponse['fullName'];
}

export interface NotAuthenticated extends AuthState {
    readonly status: AuthStatus.NotAuthenticated;
}

export async function getUserIdentity() {
    return KeychainStorage.retrieve<Authenticated>(AUTH_IDENTITY_KEYCHAIN_PATH);
}

export async function signout() {
    await KeychainStorage.remove(AUTH_IDENTITY_KEYCHAIN_PATH);
    stateTree.user.switchPatient(undefined);
}

export async function signin(authenticated: AuthenticatedAppleResponse) {
    const identity: Authenticated = { status: AuthStatus.Authenticated, jwt: authenticated.jwt };
    if (await KeychainStorage.retrieve<Authenticated>(AUTH_IDENTITY_KEYCHAIN_PATH)) {
        await KeychainStorage.remove(AUTH_IDENTITY_KEYCHAIN_PATH);
    }
    await KeychainStorage.store(AUTH_IDENTITY_KEYCHAIN_PATH, identity);

    stateTree.user.switchPatient(
        await signinEMRPatient(authenticated.jwt, {
            name: {
                given: authenticated.username?.givenName ?? undefined,
                family: authenticated.username?.familyName ?? undefined,
            },
        }),
    );
}

export async function signinWithApple() {
    const authentication = await openAppleAuthenticationDialog();
    if (authentication.status === AuthStatus.Authenticated) {
        signin(authentication);
    }
    return authentication;
}

async function openAppleAuthenticationDialog(): Promise<AuthenticatedAppleResponse | NotAuthenticated> {
    try {
        const response = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,
            requestedScopes: [appleAuth.Scope.FULL_NAME],
        });

        if ((await appleAuth.getCredentialStateForUser(response.user)) === appleAuth.State.AUTHORIZED) {
            return {
                status: AuthStatus.Authenticated,
                uid: response.user,
                username: response.fullName,
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
