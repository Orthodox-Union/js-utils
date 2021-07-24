import { Request, Response } from 'express'
import { ZodEffects, ZodObject, ZodTypeAny } from 'zod'
import sendErrors from './send-errors'

type ParsedParameters = Record<string, string | number | Array<string | number>>

const parseNumber = (value: string): string | number => {
  const isNumber = /^\d+$/.test(value)
  return isNumber ? parseInt(value) : value
}

const parseQueryParameters = <
  Shape extends Record<string, ZodTypeAny>,
  Schema extends
    | ZodObject<Shape>
    | ZodEffects<ZodObject<Shape>>
    | ZodEffects<ZodEffects<ZodObject<Shape>>>
    | ZodEffects<ZodEffects<ZodEffects<ZodObject<Shape>>>>
    | ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodObject<Shape>>>>>
    | ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodObject<Shape>>>>>>,
  ValidParams extends ReturnType<Schema['parse']>
>(
  request: Request,
  res: Response,
  schema: Schema
): ValidParams | null => {
  const query = { ...request.query, ...request.params }
  if (
    Object.keys(request.query).length + Object.keys(request.params).length !==
    Object.keys(query).length
  ) {
    const paramNames = Object.keys(request.params).join(', ')
    const queryNames = Object.keys(request.query).join(', ')
    const errorText = `Some express and query parameters have colliding names => express: [${paramNames}], query: [${queryNames}]`
    res.end(errorText)
    throw new Error(errorText)
  }
  const result: ParsedParameters = {}
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined) return
    if (typeof value === 'string') {
      result[key] = parseNumber(value)
    }
    if (Array.isArray(value)) {
      result[key] = value
        .map((elem) => {
          if (typeof elem === 'string') return parseNumber(elem)
          return null
        })
        .filter((elem): elem is string | number => {
          return typeof elem === 'string' || typeof elem === 'number'
        })
    }
  })
  try {
    return schema.parse(result) as ValidParams
  } catch (err) {
    sendErrors(res, err.errors)
    return null
  }
}

export default parseQueryParameters
