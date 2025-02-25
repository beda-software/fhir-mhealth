import React  from 'react';

import { RenderRemoteData } from '@beda.software/fhir-react';
import { Resource } from 'fhir/r4b';
import { View, Text, FlatList, TextInput } from 'react-native';
import { useSearchBar } from 'src/components/SearchBar/hooks';
import { useResourceListPage } from 'src/uberComponents/ResourceListPage/hooks';
import { ResourceListPageProps } from 'src/uberComponents/ResourceListPage';
import { RecordType } from 'src/components/Table/utils';

interface Column<R extends Resource>{
    title: string,
    dataIndex?: string,
    key?: string,
    render: (text: undefined, record: RecordType<R>) => string,
    width: number,
}


interface TableManager {
    reload: () => void;
}

type ResourceListProps<R extends Resource> = Omit<ResourceListPageProps<R>, 'getTableColumns'> & {
    getTableColumns: (manager: TableManager) => Array<Column<R>>;
}

export function ResourceList<R extends Resource>({
    resourceType,
    extractPrimaryResources,
    getFilters,
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
                                    {initialTableColumns.map((column, index) =>
                                        <View
                                            key={column.key}
                                            style={{
                                                flex: 1,
                                                backgroundColor: '#E9ECEF',
                                                justifyContent: 'center',
                                                ...(index === 0 ? { borderTopLeftRadius: 16 } : {}),
                                                ...(index === (initialTableColumns.length - 1) ? { borderTopRightRadius: 16 } : {}),
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
                                        return (
                                            <View
                                                key={column.key}
                                                style={{
                                                    flex: 1,
                                                    backgroundColor: '#F3F4F5',
                                                    justifyContent: 'center'
                                                }}

                                            >
                                                <Text
                                                    style={{ paddingLeft: 16 }}
                                                >
                                                    {column.render(undefined, item)}
                                                </Text>
                                            </View>
                                        );
                                    })}
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
