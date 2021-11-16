import { computed, Ref, ref, ComputedRef } from 'vue'
import cloneDeep from 'lodash/cloneDeep'
import { ZodObject, ZodTypeAny, ZodEffects } from 'zod'
import useToasted from './use-toasted'

// this error type doesn't support anything deeper than 2 levels
// so if a form has a field of arrays with objects and those objects can have array fields of its own - the type won't go as deep
// errors will not be places in the {errors} object in the actual function implementation as well
// an example of type with a schema is below:
// type YourCustomForm = { // this shape is returned from yourCustomZodSchema.parse()
//   semesters: {
//       id: string;
//       label: string;
//   }[];
//   dates: string[];
//   semesterID: string;
// }
// type ErrorsForThisForm = {
//   semesters?: {
//       innerErrors: Partial<{ // each array element corresponsds to an actual array value from the form. So if erroneous object is with index 3, its error will be with index 3 as well
//           id: string[];
//           label: string[];
//       } | undefined>[]; // undefined is used here because an array value might not be present when accessed via square brackets
//       outerErrors: string[]; // those are regular array errors (for example, array min length or a custom refined error, that is supposed to be shown for the whole array field)
//   } | undefined;
//   dates?: string[] | undefined; // there is no need to store other array errors in some kind of elaborate structure
//   semesterID?: string[] | undefined;
// }
export type Errors<Form extends Record<string, unknown>> = Partial<
  {
    [key in keyof Form]: Form[key] extends Array<infer InnerValue>
      ? InnerValue extends Record<string, unknown>
        ? {
            innerErrors: Array<Partial<{ [key in keyof InnerValue]: string[] } | undefined>>
            outerErrors: string[]
          }
        : string[]
      : string[]
  }
>

type ZodEffectsUnion<T extends ZodTypeAny> =
  | T
  | ZodEffects<T>
  | ZodEffects<ZodEffects<T>>
  | ZodEffects<ZodEffects<ZodEffects<T>>>
  | ZodEffects<ZodEffects<ZodEffects<ZodEffects<T>>>>
  | ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<T>>>>>
  | ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<T>>>>>>
  | ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<T>>>>>>>

export type Nullable<T> = {
  [key in keyof T]: T[key] extends Array<infer val> ? Nullable<val>[] : T[key] | null
}

type FieldType =
  | 'string'
  | 'object'
  | 'number'
  | 'boolean'
  | 'date'
  | 'enum'
  | 'stringArray'
  | 'objectArray'
  | 'numberArray'
  | 'booleanArray'
  | 'dateArray'
  | 'enumArray'

const getFieldType = <T extends ZodTypeAny>(type: T): FieldType => {
  if (type._def.typeName === 'ZodAny') {
    throw new Error('There is no support for `any` types')
  }
  if (type._def.typeName === 'ZodString') return 'string'
  if (type._def.typeName === 'ZodDate') return 'date'
  if (type._def.typeName === 'ZodObject') return 'object'
  if (type._def.typeName === 'ZodNumber') return 'number'
  if (type._def.typeName === 'ZodBoolean') return 'boolean'
  if (type._def.typeName === 'ZodNativeEnum') return 'enum'
  if (type._def.typeName === 'ZodNullable' || type._def.typeName === 'ZodOptional') {
    return getFieldType(type._def.innerType)
  }
  if (type._def.typeName === 'ZodEffects') {
    return getFieldType(type._def.schema)
  }
  if (type._def.typeName === 'ZodArray') {
    const innerArrayType = getFieldType(type._def.type)
    if (innerArrayType === 'number') return 'numberArray'
    if (innerArrayType === 'string') return 'stringArray'
    if (innerArrayType === 'object') return 'objectArray'
    if (innerArrayType === 'boolean') return 'booleanArray'
    if (innerArrayType === 'date') return 'dateArray'
    if (innerArrayType === 'enum') return 'enumArray'
    throw new Error(
      `Use-form doesn't work with complex nested array. Found array inner type: ${innerArrayType}`
    )
  }
  throw new Error(`Cannot parse this type: ${JSON.stringify(type)}`)
}

const findSchemaObject = <T extends ZodTypeAny>(
  schema: T
): ZodObject<Record<string, ZodTypeAny>> => {
  if (schema._def.typeName === 'ZodObject') {
    return schema as unknown as ZodObject<Record<string, ZodTypeAny>>
  }
  if (schema._def.typeName === 'ZodEffects') {
    return findSchemaObject(schema._def.schema)
  }
  throw new Error('Cannot find top level object schema')
}

export const getZodErrors = <
  Shape extends Record<string, ZodTypeAny>,
  Schema extends ZodEffectsUnion<ZodObject<Shape>>,
  ErrorsResult extends Errors<ReturnType<Schema['parse']>>
>(
  schema: Schema,
  form: Record<string, unknown>
): ErrorsResult => {
  const validationResult = schema.safeParse(form)
  const fieldErrors = {} as ErrorsResult
  if (validationResult.success) return fieldErrors

  const schemaObject = findSchemaObject(schema)
  const fieldsWithNestedObjects: string[] = Object.entries(schemaObject.shape)
    .filter(([_key, info]) => {
      const type = getFieldType(info)
      return type === 'objectArray'
    })
    .map(([key]) => key)

  validationResult.error.issues.forEach((issue) => {
    const realPath: Array<string | number | undefined> = issue.path // values might get undefined if accessed via square brackets
    if (realPath.length > 3) {
      throw new Error('Error handling for deeply nested entities is not implemented')
    }
    const [topLevelFieldRaw, possibleArrayIndex, possibleInnerKey] = realPath
    if (
      typeof topLevelFieldRaw === 'string' &&
      possibleArrayIndex === undefined &&
      possibleInnerKey === undefined
    ) {
      const topLevelField = topLevelFieldRaw as keyof ReturnType<Schema['parse']>
      // top level error
      if (fieldsWithNestedObjects.includes(topLevelFieldRaw)) {
        // place the error in the 'outerErrors' field properly
        if (!fieldErrors[topLevelField]) {
          fieldErrors[topLevelField] = {
            innerErrors: [],
            outerErrors: []
          } as unknown as ErrorsResult[keyof ReturnType<Schema['parse']>]
        }
        // @ts-expect-error ts thinks this can only be an array of strings, but it can actually be an object with inner/outer errrors
        fieldErrors[topLevelField]?.outerErrors.push(issue.message)
        return
      }
      // regular error. Push it into errors array
      if (!fieldErrors[topLevelField]) {
        fieldErrors[topLevelField] = [] as unknown as ErrorsResult[keyof ReturnType<
          Schema['parse']
        >]
      }
      fieldErrors[topLevelField]?.push(issue.message)
      return
    }
    if (
      typeof topLevelFieldRaw === 'string' &&
      typeof possibleArrayIndex === 'number' &&
      typeof possibleInnerKey === 'string'
    ) {
      // an error has occured inside of an inner object for the array
      const topLevelField = topLevelFieldRaw as keyof ReturnType<Schema['parse']>
      if (!fieldErrors[topLevelField]) {
        fieldErrors[topLevelField] = {
          innerErrors: [],
          outerErrors: []
        } as unknown as ErrorsResult[keyof ReturnType<Schema['parse']>]
      }
      // @ts-expect-error hard to check whether innerErrors object is present (instead of string[])
      if (!fieldErrors[topLevelField]?.innerErrors[possibleArrayIndex]) {
        // @ts-expect-error hard to check whether innerErrors object is present (instead of string[])
        fieldErrors[topLevelField].innerErrors[possibleArrayIndex] = {
          [possibleInnerKey]: []
        }
      }
      // @ts-expect-error ts thinks this can only be an array of strings, but it can actually be an object with inner/outer errrors
      fieldErrors[topLevelField].innerErrors[possibleArrayIndex][possibleInnerKey].push(
        issue.message
      )
      return
    }
    throw new Error(
      `Current errors combination is not supported. Error path: ${realPath.toString()}`
    )
  })
  return fieldErrors
}

const useForm = <
  Shape extends Record<string, ZodTypeAny>,
  Schema extends ZodEffectsUnion<ZodObject<Shape>>,
  ValidForm extends ReturnType<Schema['parse']>,
  Form extends Nullable<ValidForm>
>(
  schema: Schema,
  defaultForm: Form,
  processing: Ref<boolean> | ComputedRef<boolean>,
  onSubmit: (form: ValidForm) => Promise<void>,
  clearAfterSubmit = false
) => {
  const defaultFormCopy = cloneDeep(defaultForm)
  const { showError } = useToasted()
  const form = ref(defaultForm)
  const errors = computed(() => getZodErrors(schema, form.value))
  const validationResult = computed(() => {
    try {
      const validForm = schema.parse(form.value) as ValidForm
      return { success: true as const, data: validForm }
    } catch (error) {
      return { success: false as const, error }
    }
  })
  const isTouched = ref(false)

  const isSubmitDisabled = computed(() => {
    if (!isTouched.value) return false
    if (processing.value) return true
    return !validationResult.value.success
  })

  const clickSubmitButton = async () => {
    isTouched.value = true
    if (!validationResult.value.success) {
      showError('Please, fix all errors in the form before proceeding')
      return
    }
    if (isSubmitDisabled.value) return
    await onSubmit(validationResult.value.data)
    if (clearAfterSubmit) {
      form.value = defaultFormCopy
      isTouched.value = false
    }
  }

  return { form, errors, isTouched, clickSubmitButton, isSubmitDisabled }
}

export default useForm
