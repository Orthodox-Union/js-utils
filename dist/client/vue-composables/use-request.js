"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vue_1 = require("vue");
const axios_1 = __importDefault(require("axios"));
const use_immediate_request_1 = require("./use-immediate-request");
const cachedResults = {};
const useRequest = (params) => {
    var _a;
    if (params.cacheKey && !cachedResults[params.cacheKey]) {
        cachedResults[params.cacheKey] = {};
    }
    const baseUrl = (_a = params.customAPIUrl) !== null && _a !== void 0 ? _a : `${process.env.VUE_APP_API_URL}/`;
    const result = vue_1.ref(null);
    const loading = vue_1.ref(false);
    const makeRequest = async (data, endpoint) => {
        var _a;
        const dataKey = JSON.stringify(data);
        if (params.cacheKey && cachedResults[params.cacheKey][dataKey]) {
            const cachedValue = cachedResults[params.cacheKey][dataKey];
            result.value = cachedValue;
            return result.value;
        }
        loading.value = true;
        const axiosConfig = {
            method: params.method,
            url: `${baseUrl}${endpoint.replace(/^\//g, '')}${use_immediate_request_1.getURLParams(data, params.method)}`,
            data: params.method === 'GET' ? undefined : data,
            responseType: 'json',
            headers: {
                ...use_immediate_request_1.getDefaultHeaders(),
                ...((_a = params.customHeaders) !== null && _a !== void 0 ? _a : {})
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
        if (params.cacheKey) {
            cachedResults[params.cacheKey][dataKey] = parsedResult;
        }
        result.value = parsedResult;
        loading.value = false;
        return parsedResult;
    };
    return { result, loading, makeRequest };
};
exports.default = useRequest;
