"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getZodErrors = void 0;
const vue_1 = require("vue");
const cloneDeep_1 = __importDefault(require("lodash/cloneDeep"));
const uniq_1 = __importDefault(require("lodash/uniq"));
const use_toasted_1 = __importDefault(require("./use-toasted"));
const getFieldType = (type) => {
    if (type._def.typeName === 'ZodAny') {
        throw new Error('There is no support for `any` types');
    }
    if (type._def.typeName === 'ZodNull')
        return 'null';
    if (type._def.typeName === 'ZodUndefined')
        return 'undefined';
    if (type._def.typeName === 'ZodString' || type._def.typeName === 'ZodLiteral')
        return 'string';
    if (type._def.typeName === 'ZodDate')
        return 'date';
    if (type._def.typeName === 'ZodObject')
        return 'object';
    if (type._def.typeName === 'ZodNumber')
        return 'number';
    if (type._def.typeName === 'ZodBoolean')
        return 'boolean';
    if (type._def.typeName === 'ZodNativeEnum')
        return 'enum';
    if (type._def.typeName === 'ZodUnion') {
        const options = type._def.options;
        const innerTypes = options.map((option) => getFieldType(option));
        const uniqueInnerTypes = uniq_1.default(innerTypes);
        return uniqueInnerTypes.length === 1 ? uniqueInnerTypes[0] : 'complexUnion';
    }
    if (type._def.typeName === 'ZodNullable' || type._def.typeName === 'ZodOptional') {
        return getFieldType(type._def.innerType);
    }
    if (type._def.typeName === 'ZodEffects') {
        return getFieldType(type._def.schema);
    }
    if (type._def.typeName === 'ZodArray') {
        const innerArrayType = getFieldType(type._def.type);
        if (innerArrayType === 'number')
            return 'numberArray';
        if (innerArrayType === 'string')
            return 'stringArray';
        if (innerArrayType === 'object')
            return 'objectArray';
        if (innerArrayType === 'boolean')
            return 'booleanArray';
        if (innerArrayType === 'date')
            return 'dateArray';
        if (innerArrayType === 'enum')
            return 'enumArray';
        if (innerArrayType === 'null')
            return 'nullArray';
        if (innerArrayType === 'undefined')
            return 'undefinedArray';
        if (innerArrayType === 'complexUnion')
            return 'complexUnionArray';
        throw new Error(`Use-form doesn't work with complex nested array. Found array inner type: ${innerArrayType}`);
    }
    throw new Error(`Cannot parse this type: ${JSON.stringify(type)}`);
};
const findSchemaObject = (schema) => {
    if (schema._def.typeName === 'ZodObject') {
        return schema;
    }
    if (schema._def.typeName === 'ZodEffects') {
        return findSchemaObject(schema._def.schema);
    }
    throw new Error('Cannot find top level object schema');
};
const getZodErrors = (schema, form) => {
    const validationResult = schema.safeParse(form);
    const fieldErrors = {};
    if (validationResult.success)
        return fieldErrors;
    const schemaObject = findSchemaObject(schema);
    const fieldsWithNestedObjects = Object.entries(schemaObject.shape)
        .filter(([_key, info]) => {
        const type = getFieldType(info);
        return type === 'objectArray';
    })
        .map(([key]) => key);
    validationResult.error.issues.forEach((issue) => {
        var _a, _b, _c, _d;
        const realPath = issue.path; // values might get undefined if accessed via square brackets
        if (realPath.length > 3) {
            throw new Error('Error handling for deeply nested entities is not implemented');
        }
        const [topLevelFieldRaw, possibleArrayIndex, possibleInnerKey] = realPath;
        if (typeof topLevelFieldRaw === 'string' &&
            possibleArrayIndex === undefined &&
            possibleInnerKey === undefined) {
            const topLevelField = topLevelFieldRaw;
            // top level error
            if (fieldsWithNestedObjects.includes(topLevelFieldRaw)) {
                // place the error in the 'outerErrors' field properly
                if (!fieldErrors[topLevelField]) {
                    fieldErrors[topLevelField] = {
                        innerErrors: [],
                        outerErrors: []
                    };
                }
                // @ts-expect-error ts thinks this can only be an array of strings, but it can actually be an object with inner/outer errrors
                (_a = fieldErrors[topLevelField]) === null || _a === void 0 ? void 0 : _a.outerErrors.push(issue.message);
                return;
            }
            // regular error. Push it into errors array
            if (!fieldErrors[topLevelField]) {
                fieldErrors[topLevelField] = [];
            }
            (_b = fieldErrors[topLevelField]) === null || _b === void 0 ? void 0 : _b.push(issue.message);
            return;
        }
        if (typeof topLevelFieldRaw === 'string' &&
            typeof possibleArrayIndex === 'number' &&
            typeof possibleInnerKey === 'string') {
            // an error has occured inside of an inner object for the array
            const topLevelField = topLevelFieldRaw;
            if (!fieldErrors[topLevelField]) {
                fieldErrors[topLevelField] = {
                    innerErrors: [],
                    outerErrors: []
                };
            }
            // @ts-expect-error hard to check whether innerErrors object is present (instead of string[])
            if (!((_c = fieldErrors[topLevelField]) === null || _c === void 0 ? void 0 : _c.innerErrors[possibleArrayIndex])) {
                // @ts-expect-error hard to check whether innerErrors object is present (instead of string[])
                fieldErrors[topLevelField].innerErrors[possibleArrayIndex] = {};
            }
            if (
            // @ts-expect-error hard to check whether innerErrors object is present (instead of string[])
            !((_d = fieldErrors[topLevelField]) === null || _d === void 0 ? void 0 : _d.innerErrors[possibleArrayIndex][possibleInnerKey])) {
                // @ts-expect-error hard to check whether innerErrors object is present (instead of string[])
                fieldErrors[topLevelField].innerErrors[possibleArrayIndex][possibleInnerKey] = [];
            }
            // @ts-expect-error ts thinks this can only be an array of strings, but it can actually be an object with inner/outer errrors
            fieldErrors[topLevelField].innerErrors[possibleArrayIndex][possibleInnerKey].push(issue.message);
            return;
        }
        throw new Error(`Current errors combination is not supported. Error path: ${realPath.toString()}`);
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
