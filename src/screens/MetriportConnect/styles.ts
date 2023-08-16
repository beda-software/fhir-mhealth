import { StyleSheet } from 'react-native';
import { font, palette } from 'styles/theme';

export default StyleSheet.create({
    safeArea: {
        flexGrow: 1,
    },
    metriportWidgetBox: {
        width: '100%',
        height: '100%',
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    failureText: {
        fontFamily: font.primary.fontFamily,
        color: palette.primary.color,
        fontSize: 16,
    },
});
