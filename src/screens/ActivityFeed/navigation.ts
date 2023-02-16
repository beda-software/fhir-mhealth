import { Navigation, Layout } from 'react-native-navigation';

import { ActivityFeed, ActivityFeedProps } from '.';

export const componentName = 'software.beda.fhirmhealth.screens.ActivityFeed';

Navigation.registerComponent(componentName, () => ActivityFeed);

export function navigationLayout(props: ActivityFeedProps): Layout {
    return {
        stack: {
            options: {
                bottomTab: {
                    text: 'Activity Feed',
                },
            },
            children: [
                {
                    component: {
                        name: componentName,
                        passProps: props,
                        options: {
                            topBar: {
                                noBorder: true,
                                title: { text: 'Activity Feed' },
                            },
                        },
                    },
                },
            ],
        },
    };
}
