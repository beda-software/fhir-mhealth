import React from 'react';

import { RenderRemoteData } from '@beda.software/fhir-react';
import { Resource } from 'fhir/r4b';
import { Text, ActivityIndicator, FlatList, FlatListProps } from 'react-native';
import { useSearchBar } from 'src/components/SearchBar/hooks';
import { useResourceListPage } from 'src/uberComponents/ResourceListPage/hooks';
import {
    CustomActionType,
    ResourceListProps as GeneralResourceListProps,
    NavigationActionType,
    QuestionnaireActionType,
    isNavigationAction,
} from 'src/uberComponents/ResourceListPage/types';
import { RecordType } from 'src/components/Table/utils';
import { Link, LinkProps } from 'expo-router';
import { isLoading } from '@beda.software/remote-data';
import { S as initialStyles } from './styles';
import { IStyledComponentBase } from 'styled-components/native/dist/types';
import { SearchBarColumn } from 'src/components/SearchBar/types';
import { SearchBarColumnProps } from 'src/components/SearchBar/SearchBarColumn/types';

interface Column<R extends Resource> {
    title: string;
    key: string;
    render: (record: RecordType<R>) => React.ReactElement | string;
    width?: number;
}

interface TableManager {
    reload: () => void;
}

type ComponentStyles = { [key: string]: IStyledComponentBase<'native'> };

type FilterSearchBarColumn = SearchBarColumn & {
    // TODO: move renderControl to SearchBarColumn
    renderControl?: (props: SearchBarColumnProps) => React.ReactNode;
};

type ResourceListProps<R extends Resource> = GeneralResourceListProps<R, unknown, LinkProps['href']> & {
    getFilters?: () => FilterSearchBarColumn[];

    getTableColumns?: (manager: TableManager) => Array<Column<R>>;

    flatListProps?: Partial<FlatListProps<RecordType<R>>>;

    styles?: ComponentStyles;
};

export function ResourceList<R extends Resource>(props: ResourceListProps<R>) {
    const {
        resourceType,
        extractPrimaryResources,
        extractChildrenResources,
        getFilters,
        getRecordActions,
        searchParams,
        getTableColumns,
        getHeaderActions,
        flatListProps,
        styles = {},
    } = props;
    const allFilters = getFilters?.() ?? [];

    const { columnsFilterValues, onChangeColumnFilter } = useSearchBar({
        columns: allFilters ?? [],
    });

    const { recordResponse, reload } = useResourceListPage<R>(
        resourceType,
        extractPrimaryResources,
        extractChildrenResources,
        columnsFilterValues,
        searchParams ?? {},
    );

    const headerActions = getHeaderActions?.() ?? [];

    const initialTableColumns = getTableColumns?.({ reload }) ?? [];

    const columns = [...initialTableColumns, ...(getRecordActions ? [{ title: 'Actions', key: 'actions' }] : [])];

    const S = { ...initialStyles, ...styles };

    const renderHeader = () => {
        return (
            <S.HeaderContainer>
                {columns.map((column, index) => (
                    <S.HeaderCell key={column.key} $isFirst={index === 0} $isLast={index === columns.length - 1}>
                        <S.HeaderText>{column.title}</S.HeaderText>
                    </S.HeaderCell>
                ))}
            </S.HeaderContainer>
        );
    };

    const renderTableItem = (item: RecordType<R>) => {
        return (
            <S.RowContainer key={item.resource.id}>
                {initialTableColumns.map((column) => {
                    const value = column.render(item);
                    const component = typeof value === 'string' ? <Text>{value}</Text> : value;
                    return (
                        <S.Cell key={column.key}>
                            <S.CellContent>{component}</S.CellContent>
                        </S.Cell>
                    );
                })}
                {getRecordActions ? (
                    <S.Cell>
                        <S.CellContent>
                            <Actions actions={getRecordActions(item, { reload })} S={S} />
                        </S.CellContent>
                    </S.Cell>
                ) : null}
            </S.RowContainer>
        );
    };

    return (
        <S.Container>
            <S.FilterContainer>
                {columnsFilterValues.map((filter) => {
                    if ('renderControl' in filter.column && filter.column.renderControl) {
                        return (
                            <React.Fragment key={filter.column.id}>
                                {(filter.column as any).renderControl({
                                    columnFilterValue: filter,
                                    onChange: onChangeColumnFilter,
                                })}
                            </React.Fragment>
                        );
                    }

                    return (
                        <S.FilterInput
                            key={filter.column.id}
                            value={filter.value as string}
                            onChangeText={(text) => onChangeColumnFilter(text, filter.column.id)}
                            placeholder={filter.column.placeholder.toString()}
                        />
                    );
                })}
                {headerActions ? <Actions actions={headerActions} S={S} /> : null}
            </S.FilterContainer>
            <RenderRemoteData
                remoteData={recordResponse}
                renderFailure={(error) => <Text>{JSON.stringify(error, undefined, 4)}</Text>}
                renderLoading={() => <ActivityIndicator />}
            >
                {(records) => {
                    return (
                        <FlatList
                            onRefresh={reload}
                            refreshing={isLoading(recordResponse)}
                            ListHeaderComponent={renderHeader()}
                            data={records}
                            renderItem={({ item }: { item: RecordType<R> }) => renderTableItem(item)}
                            {...flatListProps}
                        />
                    );
                }}
            </RenderRemoteData>
        </S.Container>
    );
}

type PossibleActions = QuestionnaireActionType | NavigationActionType<LinkProps['href']> | CustomActionType;

function Actions({ actions, S }: { actions: Array<PossibleActions>; S: ComponentStyles }) {
    return (
        <S.ActionsContainer>
            {actions.map((action, index) => {
                return (
                    <React.Fragment key={index}>
                        {isNavigationAction(action) ? (
                            <Link href={action.link}>{action.title}</Link>
                        ) : (
                            <Text>{JSON.stringify(action)}</Text>
                        )}
                    </React.Fragment>
                );
            })}
        </S.ActionsContainer>
    );
}
