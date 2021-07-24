"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendErrors = (res, errors, statusCode = 400) => {
    res.status(statusCode);
    res.setHeader('Content-Type', 'application/json');
    let generatedErrors = [];
    if (!errors)
        generatedErrors.push('Something went wrong');
    if (Array.isArray(errors))
        generatedErrors = errors;
    if (typeof errors === 'string')
        generatedErrors.push(errors);
    res.end(JSON.stringify({
        Success: false,
        Errors: generatedErrors
    }));
};
exports.default = sendErrors;
