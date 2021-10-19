import { computed, Ref, ref } from 'vue'
import cloneDeep from 'lodash/cloneDeep'
import { ZodObject, ZodTypeAny, ZodEffects } from 'zod'
import useToasted from './use-toasted'

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

type GetZodErrors = <
  Shape extends Record<string, ZodTypeAny>,
  Schema extends ZodEffectsUnion<ZodObject<Shape>>
>(
  schema: Schema,
  form: Record<string, unknown>
) => Partial<Record<keyof ReturnType<Schema['parse']>, string[]>>
export const getZodErrors: GetZodErrors = (schema, form) => {
  const validationResult = schema.safeParse(form)
  if (validationResult.success) return {}
  return validationResult.error.formErrors.fieldErrors as Record<
    keyof ReturnType<typeof schema['parse']>,
    string[]
  >
}

export const getZodListError = <
  Shape extends Record<string, ZodTypeAny>,
  Schema extends ZodEffectsUnion<ZodObject<Shape>>,
  ValidForm extends ReturnType<Schema['parse']>,
  ListKey extends keyof ValidForm,
  InnerKey extends keyof ValidForm[ListKey][number]
>(
  schema: Schema,
  form: Record<string, unknown>,
  listKey: ListKey,
  position: number,
  innerKey: InnerKey
): string | null => {
  const validationResult = schema.safeParse(form)
  if (validationResult.success) return null

  const foundError = validationResult.error.errors.find(
    ({ path }) => path[0] === listKey && path[1] === position && path[2] === innerKey
  )
  return foundError ? foundError.message : null
}

const useForm = <
  Shape extends Record<string, ZodTypeAny>,
  Schema extends ZodEffectsUnion<ZodObject<Shape>>,
  ValidForm extends ReturnType<Schema['parse']>,
  Form extends Nullable<ValidForm>
>(
  schema: Schema,
  defaultForm: Form,
  processing: Ref<boolean>,
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
