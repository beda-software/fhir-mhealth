import { StyleSheet } from 'react-native';

import { font } from 'styles/theme';

export default StyleSheet.create({
    safeArea: {
        flexGrow: 1,
    },
    container: {
        padding: 30,
    },
    scrollView: {
        flexBasis: 1,
    },
    label: {
        ...font.primary,
        fontSize: 24,
        lineHeight: 30,
    },
    userInfoText: {
        ...font.primary,
        fontSize: 15,
        lineHeight: 20,
    },
    controlsContainer: {
        paddingVertical: 15,
        gap: 15,
        alignItems: 'center',
    },
});
