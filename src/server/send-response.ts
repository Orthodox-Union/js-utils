import { Response } from 'express'

const sendResponse = <Data extends unknown>(res: Response, data: Data): void => {
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

export default sendResponse
