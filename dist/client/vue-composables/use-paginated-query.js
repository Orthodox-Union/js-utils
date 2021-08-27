"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_composable_1 = require("@vue/apollo-composable");
const vue_1 = require("vue");
const isEqual_1 = __importDefault(require("lodash/isEqual"));
const usePaginatedQuery = (queryDocument, defaultVariables, options) => {
    const defaultOptions = {
        fetchPolicy: 'network-only'
    };
    const variables = vue_1.ref(defaultVariables);
    const { result, loading } = apollo_composable_1.useQuery(queryDocument, variables, options ? () => ({ ...defaultOptions, ...options() }) : defaultOptions);
    // For some odd reason watcher can be set on variables, but it doesn't let you access variables state before change
    // (both arguments in the callback hold current variables value)
    // So in order to reset offset, when filters change, this custom tracking of filters is required
    let filtersBefore = { ...defaultVariables.filters };
    vue_1.watch(variables, (currentVariables) => {
        const filtersNow = currentVariables.filters;
        if (!isEqual_1.default(filtersBefore, filtersNow)) {
            variables.value.offset = 0;
        }
        filtersBefore = { ...currentVariables.filters };
    }, { deep: true });
    const parsedQueryResult = vue_1.computed(() => {
        if (!result.value)
            return { total: 0, records: [] };
        const keys = Object.keys(result.value);
        const pageKey = keys.find((key) => key !== '__typename');
        if (!pageKey)
            throw new Error(`Cannot find page in the query result`);
        const page = result.value[pageKey];
        return {
            total: page.total,
            records: page.records
        };
    });
    const total = vue_1.computed(() => parsedQueryResult.value.total);
    const records = vue_1.computed(() => parsedQueryResult.value.records);
    const pageTo = (direction) => {
        if (direction === 1) {
            variables.value.offset += variables.value.limit;
        }
        else {
            variables.value.offset -= variables.value.limit;
        }
    };
    return { variables, loading, records, total, pageTo };
};
exports.default = usePaginatedQuery;
