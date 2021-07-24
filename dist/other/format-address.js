"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatAddress = void 0;
const trim_1 = __importDefault(require("lodash/trim"));
const formatAddress = (address) => {
    var _a, _b, _c;
    return trim_1.default(`${(_a = address.street) !== null && _a !== void 0 ? _a : ''}
  ${(_b = address.city) !== null && _b !== void 0 ? _b : ''} ${address.state ? `, ${address.state}` : ''} ${(_c = address.zip) !== null && _c !== void 0 ? _c : ''}`);
};
exports.formatAddress = formatAddress;
