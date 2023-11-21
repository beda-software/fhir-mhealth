import { StyleSheet } from 'react-native';
import { palette } from 'styles/theme';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.primary.color,
        alignItems: 'center',
    },
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontWeight: 'bold',
        fontSize: 38,
        lineHeight: 40,
        color: palette.secondary.color,
    },
    buttonContainer: {
        marginBottom: 50,
        paddingHorizontal: 16,
    },
});
