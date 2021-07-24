"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const send_errors_1 = __importDefault(require("./send-errors"));
const parseJsonParameters = (req, res, schema) => {
    try {
        return schema.parse(req.body);
    }
    catch (err) {
        send_errors_1.default(res, err.errors);
        return null;
    }
};
exports.default = parseJsonParameters;
