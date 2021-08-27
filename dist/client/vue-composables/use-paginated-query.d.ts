import { DocumentNode } from 'graphql';
import { UseQueryOptions } from '@vue/apollo-composable';
import { ComputedRef, Ref } from 'vue';
declare type SortOrder = 'Asc' | 'Desc';
declare type NonUndefinedDeep<T> = T extends Record<string, unknown> ? {
    [key in keyof T]-?: NonUndefinedDeep<T[key]>;
} : T extends undefined ? never : T;
declare type WithoutTypename<T> = T extends Array<infer V> ? Array<WithoutTypename<V>> : T extends Record<string, any> ? {
    [key in Exclude<keyof T, '__typename'>]: WithoutTypename<T[key]>;
} : T;
declare type EntityFromQuery<Query> = WithoutTypename<Query> extends Record<string, {
    records: Array<infer T>;
    total: number;
}> ? T : never;
export declare type PartialDeep<T> = T extends Array<unknown> ? T : T extends Record<string, any> ? {
    [key in keyof T]?: PartialDeep<T[key]>;
} : T;
export declare type DefaultVariables<Query, Variables extends {
    filters: Record<string, any>;
}> = {
    limit: number;
    offset: number;
    sort: {
        field: keyof EntityFromQuery<Query>;
        order: SortOrder | null;
    };
    filters: NonUndefinedDeep<Variables['filters']>;
};
declare const usePaginatedQuery: <Query, Variables extends {
    limit: number;
    sort: {
        field: string;
        order?: SortOrder | null | undefined;
    };
    offset: number;
    filters: Record<string, any>;
}, Entity = EntityFromQuery<Query>>(queryDocument: DocumentNode, defaultVariables: DefaultVariables<Query, Variables>, options?: (() => UseQueryOptions<Query, Variables>) | undefined) => {
    variables: Ref<Variables>;
    loading: Ref<boolean>;
    records: ComputedRef<Entity[]>;
    total: ComputedRef<number>;
    pageTo: (direction: -1 | 1) => void;
};
export default usePaginatedQuery;
