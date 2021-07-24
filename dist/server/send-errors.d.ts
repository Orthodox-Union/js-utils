import { Response } from 'express';
declare const sendErrors: (res: Response, errors?: string | unknown[] | undefined, statusCode?: number) => void;
export default sendErrors;
