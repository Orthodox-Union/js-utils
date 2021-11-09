"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getZodErrors = void 0;
const vue_1 = require("vue");
const cloneDeep_1 = __importDefault(require("lodash/cloneDeep"));
const use_toasted_1 = __importDefault(require("./use-toasted"));
const getZodErrors = (schema, form) => {
    const validationResult = schema.safeParse(form);
    if (validationResult.success)
        return {};
    const fieldErrors = validationResult.error.formErrors.fieldErrors;
    if (!('shape' in schema))
        return fieldErrors;
    Object.entries(schema.shape).forEach(([rawKey, info]) => {
        const key = rawKey;
        if (!fieldErrors[key]) {
            // this field (whether it's array or not) doesn't have any errors
            // So there is no need to generate array of the potential errors
            return;
        }
        const isArray = info._def.typeName === 'ZodArray';
        if (!isArray)
            return;
        const value = form[rawKey];
        if (Array.isArray(value)) {
            fieldErrors[key] = Array(value.length).fill({});
        }
    });
    validationResult.error.issues.forEach((issue) => {
        const [field, index, innerKey] = issue.path;
        if (typeof field === 'string' && typeof index === 'number' && typeof innerKey === 'string') {
            const otherErrors = 
            // @ts-expect-error really difficult to specify all the proper keys here
            fieldErrors[field][index][innerKey];
            // @ts-expect-error really difficult to specify all the proper keys here
            fieldErrors[field][index][innerKey] = Array.isArray(otherErrors)
                ? [...otherErrors, issue.message]
                : [issue.message];
        }
    });
    return fieldErrors;
};
exports.getZodErrors = getZodErrors;
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
