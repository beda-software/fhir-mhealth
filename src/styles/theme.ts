import { DynamicColorIOS, StyleSheet } from 'react-native';

export const font = StyleSheet.create({
    primary: {
        color: DynamicColorIOS({
            light: 'black',
            dark: 'white',
        }),
    },
});
