"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthenticationHeader = exports.getDefaultHeaders = exports.getURLParams = void 0;
const vue_1 = require("vue");
const axios_1 = __importDefault(require("axios"));
const use_authentication_1 = __importDefault(require("./use-authentication"));
const getURLParams = (variables, method) => {
    if (!method || method === 'get' || method === 'GET') {
        const paramsList = Object.entries(variables)
            .filter((entry) => entry[1] !== undefined && entry[1] !== null)
            .map((entry) => `${entry[0]}=${entry[1]}`)
            .join('&');
        return paramsList === '' ? '' : `?${paramsList}`;
    }
    return '';
};
exports.getURLParams = getURLParams;
const getDefaultHeaders = () => {
    const headers = {
        'Content-Type': 'application/json'
    };
    return headers;
};
exports.getDefaultHeaders = getDefaultHeaders;
const getAuthenticationHeader = () => {
    var _a, _b;
    const { oktaUser } = use_authentication_1.default();
    const oktaToken = (_b = (_a = oktaUser.value) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : '';
    const headers = {};
    if (oktaToken)
        headers.Authorization = `Bearer ${oktaToken}`;
    return headers;
};
exports.getAuthenticationHeader = getAuthenticationHeader;
const useImmediateRequest = (params) => {
    var _a;
    // @ts-expect-error it has something to do with unwrapping refs, that breaks ts here
    const variables = vue_1.ref(params.data);
    const baseUrl = (_a = params.customAPIUrl) !== null && _a !== void 0 ? _a : `${process.env.VUE_APP_API_URL}/`;
    if (!baseUrl) {
        throw new Error('API URL must be provided in .env  as `VUE_APP_API_URL`');
    }
    const result = vue_1.ref(null);
    const loading = vue_1.ref(false);
    const makeRequest = async (modifiedData) => {
        loading.value = true;
        const data = modifiedData !== null && modifiedData !== void 0 ? modifiedData : params.data;
        const axiosConfig = {
            method: params.method,
            url: `${baseUrl}${params.endpoint.replace(/^\//g, '')}${exports.getURLParams(data, params.method)}`,
            data,
            responseType: 'json',
            headers: {
                ...exports.getDefaultHeaders(),
                ...(params.requireAuthentication ? exports.getAuthenticationHeader() : {}),
            }
        };
        let response;
        try {
            response = await axios_1.default(axiosConfig);
        }
        catch (err) {
            loading.value = false;
            throw err;
        }
        const parsedResult = params.responseSchema.parse(response.data);
        result.value = parsedResult;
        loading.value = false;
        return parsedResult;
    };
    makeRequest();
    vue_1.watch(variables, (newVariables) => {
        makeRequest(newVariables);
    }, { deep: true });
    return { result, loading, makeRequest, variables };
};
exports.default = useImmediateRequest;
