import { Navigation } from 'react-native-navigation';
import { MetriportConnect } from '.';
import { MetriportConnectProps } from './hooks';

export const metriportConnectComponentName = 'software.beda.fhirmhealth.screens.MetriportConnect';

Navigation.registerComponent(metriportConnectComponentName, () => MetriportConnect);

export function pushToMetriportScreen(parentComponentId: string, passProps: MetriportConnectProps) {
    return Navigation.push(parentComponentId, {
        component: {
            name: metriportConnectComponentName,
            options: {
                topBar: { title: { text: 'Metriport connect' } },
            },
            passProps,
        },
    });
}
