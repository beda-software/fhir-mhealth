import React  from 'react';

import { RenderRemoteData } from '@beda.software/fhir-react';
import { Resource } from 'fhir/r4b';
import { View, Text, FlatList, TextInput } from 'react-native';
import { useSearchBar } from 'src/components/SearchBar/hooks';
import { useResourceListPage } from 'src/uberComponents/ResourceListPage/hooks';
import { CustomActionType, ResourceListProps as GenaralResourceListProps, NavigationActionType, QuestionnaireActionType, isNavigationAction } from 'src/uberComponents/ResourceListPage/types';
import { RecordType } from 'src/components/Table/utils';
import { Link } from 'expo-router';

interface Column<R extends Resource>{
    title: string,
    key: string,
    render: (record: RecordType<R>) => React.ReactElement | string,
    width?: number,
}


interface TableManager {
    reload: () => void;
}

type ResourceListProps<R extends Resource> = GenaralResourceListProps<R> & {
    getTableColumns: (manager: TableManager) => Array<Column<R>>;
}

export function ResourceList<R extends Resource>({
    resourceType,
    extractPrimaryResources,
    getFilters,
    getRecordActions,
    searchParams,
    getTableColumns,
}: ResourceListProps<R>) {
    const allFilters = getFilters?.() ?? [];

    const { columnsFilterValues, onChangeColumnFilter } = useSearchBar({
        columns: allFilters ?? [],
    });

    const {
        recordResponse,
        reload,
    } = useResourceListPage<R>(resourceType, extractPrimaryResources, columnsFilterValues, searchParams ?? {});


    const initialTableColumns = getTableColumns({ reload });

    const columns = [...initialTableColumns, ...(getRecordActions ? [{ title: 'Actions', key: 'actions' }] : [])]

    return (
        <View>
            {columnsFilterValues.map(f => {
                return (
                    <TextInput
                        key={f.column.id}
                        value={f.value as string}
                        onChangeText={(text) => onChangeColumnFilter(text, f.column.id)}
                        placeholder={f.column.placeholder.toString()}
                        style={{
                            backgroundColor: '#F3F4F5',
                            width: 220,
                            height: 50,
                            borderColor: 'black',
                            borderRadius: 25,
                            borderWidth: 1,
                            marginTop: 10,
                            padding: 11,
                        }}
                    />
                );
            })}
            <RenderRemoteData
                remoteData={recordResponse}
                renderFailure={(error) => <Text>{JSON.stringify(error, undefined, 4)}</Text>}
                renderLoading={() => <Text>Loading</Text>}
            >
                {(records) => {
                    return (
                        <FlatList
                            ListHeaderComponent={
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        flex: 1,
                                        height: 48,
                                        marginTop: 20,
                                    }}
                                >
                                    {columns.map((column, index) =>
                                        <View
                                            key={column.key}
                                            style={{
                                                flex: 1,
                                                backgroundColor: '#E9ECEF',
                                                justifyContent: 'center',
                                                ...(index === 0 ? { borderTopLeftRadius: 16 } : {}),
                                                ...(index === (columns.length - 1) ? { borderTopRightRadius: 16 } : {}),
                                            }}
                                        >
                                            <Text
                                                style={{ paddingLeft: 16 }}
                                            >
                                                {column.title}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            }
                            data={records}
                            renderItem={({ item }) => (
                                <View key={item.resource.id} style={{ flexDirection: 'row', height: 48, flex: 1 }}>
                                    {initialTableColumns.map(column => {
                                        const value = column.render(item);
                                        const component = typeof value === 'string' ? <Text>{value}</Text> : value
                                        return (
                                            <View
                                                key={column.key}
                                                style={{
                                                    flex: 1,
                                                    backgroundColor: '#F3F4F5',
                                                    justifyContent: 'center'
                                                }}

                                            >
                                                <View
                                                    style={{ paddingLeft: 16 }}
                                                >
                                                    {component}
                                                </View>
                                            </View>
                                        );
                                    })}
                                    {getRecordActions ?
                                        (
                                            <View
                                                style={{
                                                    flex: 1,
                                                    backgroundColor: '#F3F4F5',
                                                    justifyContent: 'center'
                                                }}

                                            >
                                                <View
                                                    style={{ paddingLeft: 16 }}
                                                >
                                                    <RecordActions actions={getRecordActions(item, { reload })}/>
                                                </View>
                                            </View>
                                        ):null
                                    }
                                </View>
                            )
                            }
                        />
                    );
                }}
            </RenderRemoteData>
        </View>
    );
}

type PossibleRecordActions = QuestionnaireActionType | NavigationActionType | CustomActionType;


function RecordActions({actions}:{actions:Array<PossibleRecordActions>}){
    return <View>{actions.map(action => {
        if (isNavigationAction(action)){
            return <Link href={action.link}>{action.title}</Link>
        }
        return <Text>{JSON.stringify(action)}</Text>
    })}</View>
}
