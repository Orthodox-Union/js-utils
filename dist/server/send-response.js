"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendResponse = (res, data) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
};
exports.default = sendResponse;
