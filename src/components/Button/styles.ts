import { StyleSheet } from 'react-native';

import { palette } from 'styles/theme';

export default StyleSheet.create({
    defaultIconButtonStyle: {
        backgroundColor: palette.secondary.color,
        padding: 10,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    defaultLabelButtonStyle: {
        backgroundColor: '#05BDB1',
        width: 300,
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    defaultIconStyle: {
        color: palette.primary.color as unknown as string,
    },
    defaultLabelStyle: {
        color: palette.secondary.color as unknown as string,
        fontSize: 17,
        lineHeight: 22,
        fontWeight: '600',
    },
});
