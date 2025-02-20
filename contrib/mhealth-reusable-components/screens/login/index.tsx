import React from 'react';

import { Button, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLoginScreen } from './hooks';
import s from './styles';

export function LoginScreen() {
    const { onSignIn, isReadyForRequest, result, obtainTokenError } = useLoginScreen();

    return (
        <SafeAreaView style={s.safeArea}>
            <View style={s.container}>
                <Button title="Log in" onPress={() => onSignIn()} disabled={!isReadyForRequest} />
                {result?.type === 'error' && <Text style={s.erroText}>{JSON.stringify(result.error)}</Text>}
                {obtainTokenError !== undefined && <Text style={s.erroText}>{obtainTokenError}</Text>}
            </View>
        </SafeAreaView>
    );
}
