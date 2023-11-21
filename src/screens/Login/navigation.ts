import { Navigation, LayoutRoot } from 'react-native-navigation';

import { Login } from '.';

export const componentName = 'software.beda.fhirmhealth.screens.Login';

Navigation.registerComponent(componentName, () => Login);

export const loginRoot: LayoutRoot = {
    root: {
        component: {
            name: componentName,
        },
    },
};
