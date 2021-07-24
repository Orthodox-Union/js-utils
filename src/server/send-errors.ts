import { Response } from 'express'

const sendErrors = (res: Response, errors?: string | unknown[], statusCode = 400): void => {
  res.status(statusCode)
  res.setHeader('Content-Type', 'application/json')
  let generatedErrors: unknown[] = []
  if (!errors) generatedErrors.push('Something went wrong')
  if (Array.isArray(errors)) generatedErrors = errors
  if (typeof errors === 'string') generatedErrors.push(errors)
  res.end(
    JSON.stringify({
      Success: false,
      Errors: generatedErrors
    })
  )
}

export default sendErrors
