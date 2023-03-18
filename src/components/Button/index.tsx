import React from 'react';
import { StyleProp, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { FontAwesomeIcon, FontAwesomeIconStyle } from '@fortawesome/react-native-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

import s from './styles';

export interface ButtonCommonProps {
    onPress: () => void;
    style?: ViewStyle;
}

export interface ButtonIconProps extends ButtonCommonProps {
    icon: IconProp;
    iconStyle?: FontAwesomeIconStyle;
    size?: number;
}

export interface ButtonLabelProps extends ButtonCommonProps {
    label: string;
    labelStyle?: StyleProp<TextStyle>;
}

export type ButtonProps = ButtonIconProps | ButtonLabelProps;

export function Button(props: ButtonProps) {
    const { onPress, style = 'icon' in props ? s.defaultIconButtonStyle : s.defaultLabelButtonStyle } = props;

    return (
        <TouchableOpacity style={style} onPress={onPress}>
            {'icon' in props ? (
                <FontAwesomeIcon
                    icon={props.icon}
                    style={props.iconStyle ?? s.defaultIconStyle}
                    size={props.size ?? 20}
                />
            ) : (
                <Text style={props.labelStyle ?? s.defaultLabelStyle}>{props.label}</Text>
            )}
        </TouchableOpacity>
    );
}
