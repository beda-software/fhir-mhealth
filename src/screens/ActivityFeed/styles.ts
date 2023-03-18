import { StyleSheet } from 'react-native';

import { font, palette } from 'styles/theme';

export default StyleSheet.create({
    safeArea: {
        flexGrow: 1,
        backgroundColor: palette.primary.color,
    },
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
    },
    headerControls: {
        flexDirection: 'row',
        gap: 16,
    },
    scrollView: {
        flexBasis: 1,
        marginTop: 40,
    },
    scrollViewContent: {
        gap: 24,
    },
    title: {
        ...font.primary,
        fontSize: 40,
        lineHeight: 48,
        fontWeight: '800',
    },
    label: {
        ...font.primary,
        fontSize: 24,
        lineHeight: 29,
        fontWeight: '800',
    },
    energy: {
        ...font.primary,
        fontSize: 24,
        lineHeight: 29,
        fontWeight: '400',
    },
    signInContainer: {
        paddingVertical: 15,
        gap: 8,
        alignItems: 'center',
    },
    signInDescriptionText: {
        ...font.primary,
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '400',
    },
});
