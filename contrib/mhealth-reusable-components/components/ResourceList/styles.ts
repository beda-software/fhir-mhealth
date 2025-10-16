import styled, { css } from 'styled-components/native';
import { View, Text, TextInput } from 'react-native';

export const S = {
    Container: styled(View)`
        flex: 1;
    `,
    FilterContainer: styled(View)`
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    `,
    FilterInput: styled(TextInput)`
        background-color: #f3f4f5;
        width: 220px;
        height: 50px;
        border-color: black;
        border-radius: 25px;
        border-width: 1px;
        margin-top: 10px;
        padding: 11px;
    `,
    HeaderContainer: styled(View)`
        flex-direction: row;
        flex: 1;
        height: 48px;
        margin-top: 20px;
    `,
    HeaderCell: styled(View)<{ $isFirst?: boolean; $isLast?: boolean }>`
        flex: 1;
        background-color: #e9ecef;
        justify-content: center;
        ${(props) =>
            props.$isFirst &&
            css`
                border-top-left-radius: 16px;
            `}
        ${(props) =>
            props.$isLast &&
            css`
                border-top-right-radius: 16px;
            `}
    `,
    HeaderText: styled(Text)`
        padding-left: 16px;
    `,
    RowContainer: styled(View)`
        flex-direction: row;
        height: 48px;
        flex: 1;
    `,
    Cell: styled(View)`
        flex: 1;
        background-color: #f3f4f5;
        justify-content: center;
    `,
    CellContent: styled(View)`
        padding-left: 16px;
    `,
    ActionsContainer: styled(View)`
        flex-direction: row;
        gap: 30px;
    `,
};
