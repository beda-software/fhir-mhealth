import React, { FC } from 'react';
import { ActivityIndicator, SafeAreaView, Text } from 'react-native';
import { MetriportWidget } from '@metriport/react-native-sdk';
import { METRIPORT_CLIENT_KEY } from 'config';
import s from './styles';
import { MetriportConnectProps, useMetriportConnect } from './hooks';
import { observer } from 'mobx-react-lite';
import { NavigationComponentProps } from 'react-native-navigation/lib/dist/src/interfaces/NavigationComponentProps';
import { RenderRemoteData } from 'fhir-react/src/components/RenderRemoteData';

export const MetriportConnect: FC<MetriportConnectProps & NavigationComponentProps> = observer(
    function MetriportConnect(_props) {
        const { response } = useMetriportConnect();

        return (
            <SafeAreaView style={s.safeArea}>
                <RenderRemoteData
                    remoteData={response}
                    renderLoading={() => <ActivityIndicator />}
                    renderFailure={(e) => <Text>{e}</Text>}
                >
                    {({ token }) => (
                        <MetriportWidget
                            sandbox={true}
                            clientApiKey={METRIPORT_CLIENT_KEY}
                            token={token}
                            style={s.metriportWidgetBox}
                        />
                    )}
                </RenderRemoteData>
            </SafeAreaView>
        );
    },
);
