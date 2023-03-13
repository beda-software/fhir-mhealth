import React from 'react';
import { useColorScheme } from 'react-native';
import { AppleButton } from '@invertase/react-native-apple-authentication';

import { useAuthentication } from 'services/auth';

import s from './styles';

export interface AuthButtonProps {}

export function AuthButton(_props: AuthButtonProps) {
    const isDarkMode = useColorScheme() === 'dark';

    const { authenticate } = useAuthentication();

    return (
        <AppleButton
            buttonStyle={isDarkMode ? AppleButton.Style.WHITE : AppleButton.Style.BLACK}
            buttonType={AppleButton.Type.SIGN_IN}
            style={s.signInButton}
            onPress={authenticate}
        />
    );
}
