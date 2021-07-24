import { Request, Response } from 'express'
import { ZodEffects, ZodObject, ZodTypeAny } from 'zod'
import sendErrors from './send-errors'

const parseJsonParameters = <
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
  req: Request,
  res: Response,
  schema: Schema
): ValidParams | null => {
  try {
    return schema.parse(req.body) as ValidParams
  } catch (err) {
    sendErrors(res, err.errors)
    return null
  }
}

export default parseJsonParameters
