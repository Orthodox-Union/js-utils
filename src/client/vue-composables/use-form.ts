import { computed, Ref, ref, ComputedRef } from 'vue'
import cloneDeep from 'lodash/cloneDeep'
import { ZodObject, ZodTypeAny, ZodEffects } from 'zod'
import useToasted from './use-toasted'

type Errors<Form extends Record<string, unknown>> = Partial<
  {
    [key in keyof Form]: Form[key] extends Array<infer val>
      ? val extends Record<string, unknown>
        ? Array<Errors<val>>
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

export const getZodErrors = <
  Shape extends Record<string, ZodTypeAny>,
  Schema extends ZodEffectsUnion<ZodObject<Shape>>,
  ErrorsResult extends Errors<ReturnType<Schema['parse']>>
>(
  schema: Schema,
  form: Record<string, unknown>
): ErrorsResult => {
  const validationResult = schema.safeParse(form)
  if (validationResult.success) return {} as ErrorsResult
  const fieldErrors = validationResult.error.formErrors.fieldErrors as ErrorsResult
  if (!('shape' in schema)) return fieldErrors
  Object.entries(schema.shape).forEach(([rawKey, info]) => {
    const key = rawKey as keyof ReturnType<Schema['parse']>
    if (!fieldErrors[key]) {
      // this field (whether it's array or not) doesn't have any errors
      // So there is no need to generate array of the potential errors
      return
    }
    const isArray = info._def.typeName === 'ZodArray'
    if (!isArray) return
    const value = form[rawKey]
    if (Array.isArray(value)) {
      fieldErrors[key] = Array(value.length).fill({}) as ErrorsResult[keyof ReturnType<
        Schema['parse']
      >]
    }
  })
  validationResult.error.issues.forEach((issue) => {
    const [field, index, innerKey] = issue.path
    if (typeof field === 'string' && typeof index === 'number' && typeof innerKey === 'string') {
      const otherErrors: string[] | undefined =
        // @ts-expect-error really difficult to specify all the proper keys here
        fieldErrors[field][index][innerKey]
      // @ts-expect-error really difficult to specify all the proper keys here
      fieldErrors[field][index][innerKey] = Array.isArray(otherErrors)
        ? [...otherErrors, issue.message]
        : [issue.message]
    }
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
