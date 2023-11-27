import { appleAuth, AppleRequestResponse } from '@invertase/react-native-apple-authentication';

import { stateTree } from 'models';
import { KeychainStorage } from 'services/storage';
import { signinEMRPatient } from 'services/emr';
import { isSuccess } from 'fhir-react/src/libs/remoteData';
import { Navigation } from 'react-native-navigation';
import { mainRoot } from 'screens/navigation';
import { loginRoot } from 'screens/Login/navigation';
import { service } from 'fhir-react/src/services/fetch';
import { DATASTREAM_BASE_URL } from 'config';

const AUTH_IDENTITY_KEYCHAIN_PATH = 'datasequence_identity';

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

export interface AuthTokenResponse {
    access_token: string;
}

export async function getUserIdentity() {
    return KeychainStorage.retrieve<Authenticated>(AUTH_IDENTITY_KEYCHAIN_PATH);
}

export async function signout() {
    await KeychainStorage.remove(AUTH_IDENTITY_KEYCHAIN_PATH);
    stateTree.user.switchPatient(undefined);
    Navigation.setRoot(loginRoot);
}

export async function signin(authenticated: AuthenticatedAppleResponse) {
    const identity: Authenticated = { status: AuthStatus.Authenticated, jwt: authenticated.jwt };
    if (await KeychainStorage.retrieve<Authenticated>(AUTH_IDENTITY_KEYCHAIN_PATH)) {
        await KeychainStorage.remove(AUTH_IDENTITY_KEYCHAIN_PATH);
    }
    const authTokenResponse = await getAuthToken(identity.jwt);
    if (isSuccess(authTokenResponse)) {
        const authToken = authTokenResponse.data.access_token;
        await KeychainStorage.store(AUTH_IDENTITY_KEYCHAIN_PATH, { status: AuthStatus.Authenticated, jwt: authToken });

        return await signinEMRPatient(authToken, {
            name: {
                given: authenticated.username?.givenName ?? undefined,
                family: authenticated.username?.familyName ?? undefined,
            },
        });
    } else {
        console.error('authTokenResponse error', authTokenResponse.error);
        return authTokenResponse;
    }
}

export async function signinWithApple() {
    const authentication = await openAppleAuthenticationDialog();

    if (authentication.status === AuthStatus.Authenticated) {
        const response = await signin(authentication);
        if (isSuccess(response)) {
            stateTree.user.switchPatient(response.data);
            Navigation.setRoot(mainRoot);
        }
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

async function getAuthToken(appleToken: string) {
    return await service<AuthTokenResponse>(`${DATASTREAM_BASE_URL}/auth/token`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${appleToken}` },
    });
}
