import React from 'react';
import { AppleButton } from '@invertase/react-native-apple-authentication';

import { useAuthentication } from 'services/auth';

import s from './styles';

export interface AuthButtonProps {}

export function AuthButton(_props: AuthButtonProps) {
    const { authenticate } = useAuthentication();

    return (
        <AppleButton
            buttonStyle={AppleButton.Style.BLACK}
            buttonType={AppleButton.Type.SIGN_IN}
            cornerRadius={s.signInButton.height / 2}
            style={s.signInButton}
            onPress={authenticate}
        />
    );
}
