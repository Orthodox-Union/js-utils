import { Response } from 'express'

const sendResponse = (res: Response, data: unknown): void => {
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

export default sendResponse
