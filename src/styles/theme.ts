import { DynamicColorIOS, StyleSheet } from 'react-native';

export const palette = StyleSheet.create({
    primary: {
        color: DynamicColorIOS({
            light: '#3366FF',
            dark: '#3366FF',
        }),
    },
    secondary: {
        color: DynamicColorIOS({
            light: 'white',
            dark: 'white',
        }),
    },
    font: {
        color: DynamicColorIOS({
            light: 'white',
            dark: 'white',
        }),
    },
});

export const font = StyleSheet.create({
    primary: {
        fontFamily: 'System',
        color: palette.font.color,
    },
});
