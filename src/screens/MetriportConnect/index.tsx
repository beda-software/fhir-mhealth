import React, { FC } from 'react';
import { View } from 'react-native';
import { MetriportWidget } from '@metriport/react-native-sdk';
import { METRIPORT_CLIENT_KEY } from 'config';
import s from './styles';
import { MetriportConnectProps, useMetriportWidget } from './hooks';
import { observer } from 'mobx-react-lite';
import { NavigationComponentProps } from 'react-native-navigation/lib/dist/src/interfaces/NavigationComponentProps';
import { RenderRemoteData } from 'fhir-react/lib/components/RenderRemoteData';

export const MetriportConnect: FC<MetriportConnectProps & NavigationComponentProps> = observer(
    function MetriportConnect(_props) {
        const { response } = useMetriportWidget();
        return (
            <RenderRemoteData remoteData={response}>
                {({ token }) => (
                    <View style={s.metriportModalContainer}>
                        <MetriportWidget
                            sandbox={true}
                            clientApiKey={METRIPORT_CLIENT_KEY}
                            token={token}
                            style={s.metriportWidgetBox}
                        />
                    </View>
                )}
            </RenderRemoteData>
        );
    },
);
