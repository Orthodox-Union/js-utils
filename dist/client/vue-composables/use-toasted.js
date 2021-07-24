"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vue_toastification_1 = require("vue-toastification");
const { success, error } = vue_toastification_1.useToast();
const defaultOptions = { timeout: 5000 };
const useToasted = () => {
    const showSuccess = (message, options = {}) => {
        success(message, { ...defaultOptions, ...options });
    };
    const showError = (message, options = {}) => {
        error(message, { ...defaultOptions, ...options });
    };
    return { showSuccess, showError };
};
exports.default = useToasted;
