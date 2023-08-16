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
    sectionList: {
        flexBasis: 1,
        marginTop: 40,
    },
    sectionListContent: {
        gap: 24,
    },
    title: {
        ...font.primary,
        fontSize: 40,
        lineHeight: 48,
        fontWeight: '800',
    },
    sectionHeader: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionHeaderTitle: {
        backgroundColor: 'white',
        borderRadius: 14,
        paddingVertical: 5,
        paddingHorizontal: 16,
    },
    sectionHeaderTitleText: {
        ...font.primary,
        color: 'black',
        fontSize: 14,
        lineHeight: 18,
        fontWeight: '500',
    },
    sectionItem: {
        flexDirection: 'row',
        gap: 16,
    },
    sectionItemActivity: {
        flex: 1,
    },
    sectionItemActivityLabelText: {
        ...font.primary,
        fontSize: 24,
        lineHeight: 29,
        fontWeight: '800',
    },
    sectionItemActivityDetailsText: {
        ...font.primary,
        fontSize: 24,
        lineHeight: 29,
        fontWeight: '400',
    },
    sectionFooter: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    signInContainer: {
        paddingTop: 16,
        gap: 8,
        alignItems: 'center',
    },
    footnote: {
        ...font.primary,
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '400',
        textAlign: 'center',
    },
});
