"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getZodListError = exports.getZodErrors = void 0;
const vue_1 = require("vue");
const cloneDeep_1 = __importDefault(require("lodash/cloneDeep"));
const use_toasted_1 = __importDefault(require("./use-toasted"));
const getZodErrors = (schema, form) => {
    const validationResult = schema.safeParse(form);
    if (validationResult.success)
        return {};
    return validationResult.error.formErrors.fieldErrors;
};
exports.getZodErrors = getZodErrors;
const getZodListError = (schema, form, listKey, position, innerKey) => {
    const validationResult = schema.safeParse(form);
    if (validationResult.success)
        return null;
    const foundError = validationResult.error.errors.find(({ path }) => path[0] === listKey && path[1] === position && path[2] === innerKey);
    return foundError ? foundError.message : null;
};
exports.getZodListError = getZodListError;
const useForm = (schema, defaultForm, processing, onSubmit, clearAfterSubmit = false) => {
    const defaultFormCopy = cloneDeep_1.default(defaultForm);
    const { showError } = use_toasted_1.default();
    const form = vue_1.ref(defaultForm);
    const errors = vue_1.computed(() => exports.getZodErrors(schema, form.value));
    const validationResult = vue_1.computed(() => {
        try {
            const validForm = schema.parse(form.value);
            return { success: true, data: validForm };
        }
        catch (error) {
            return { success: false, error };
        }
    });
    const isTouched = vue_1.ref(false);
    const isSubmitDisabled = vue_1.computed(() => {
        if (!isTouched.value)
            return false;
        if (processing.value)
            return true;
        return !validationResult.value.success;
    });
    const clickSubmitButton = async () => {
        isTouched.value = true;
        if (!validationResult.value.success) {
            showError('Please, fix all errors in the form before proceeding');
            return;
        }
        if (isSubmitDisabled.value)
            return;
        await onSubmit(validationResult.value.data);
        if (clearAfterSubmit) {
            form.value = defaultFormCopy;
            isTouched.value = false;
        }
    };
    return { form, errors, isTouched, clickSubmitButton, isSubmitDisabled };
};
exports.default = useForm;
