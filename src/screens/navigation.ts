import { LayoutRoot } from 'react-native-navigation';
import { navigationLayout } from './ActivityFeed/navigation';

export const mainRoot: LayoutRoot = {
    root: {
        bottomTabs: {
            id: 'FHIRmHealth',
            children: [navigationLayout({})],
            options: {
                bottomTabs: {
                    visible: false,
                },
            },
        },
    },
};
