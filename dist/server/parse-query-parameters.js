"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const send_errors_1 = __importDefault(require("./send-errors"));
const parseNumber = (value) => {
    const isNumber = value === parseFloat(value).toString();
    return isNumber ? parseFloat(value) : value;
};
const parseQueryParameters = (request, res, schema) => {
    const query = { ...request.query, ...request.params };
    if (Object.keys(request.query).length + Object.keys(request.params).length !==
        Object.keys(query).length) {
        const paramNames = Object.keys(request.params).join(', ');
        const queryNames = Object.keys(request.query).join(', ');
        const errorText = `Some express and query parameters have colliding names => express: [${paramNames}], query: [${queryNames}]`;
        res.end(errorText);
        throw new Error(errorText);
    }
    const result = {};
    Object.entries(query).forEach(([key, value]) => {
        if (value === undefined)
            return;
        if (typeof value === 'string') {
            result[key] = parseNumber(value);
        }
        if (Array.isArray(value)) {
            result[key] = value
                .map((elem) => {
                if (typeof elem === 'string')
                    return parseNumber(elem);
                return null;
            })
                .filter((elem) => {
                return typeof elem === 'string' || typeof elem === 'number';
            });
        }
    });
    try {
        return schema.parse(result);
    }
    catch (err) {
        send_errors_1.default(res, err.errors);
        return null;
    }
};
exports.default = parseQueryParameters;
