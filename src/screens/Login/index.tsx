import React from 'react';
import { View, Text } from 'react-native';

import s from './styles';
import { AuthButton } from 'components/AuthButton';

export function Login() {
    return (
        <View style={s.container}>
            <View style={s.logoContainer}>
                <Text style={s.logoText}>Beda EMR</Text>
            </View>
            <View style={s.buttonContainer}>
                <AuthButton />
            </View>
        </View>
    );
}
