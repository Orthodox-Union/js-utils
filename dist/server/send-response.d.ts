import { Response } from 'express';
declare const sendResponse: <Data extends unknown>(res: Response, data: Data) => void;
export default sendResponse;
