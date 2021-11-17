import { ref, Ref, watch } from 'vue'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { ZodTypeAny } from 'zod'
import useAuthentication from './use-authentication'

export const getURLParams = (
  variables: Record<string, unknown>,
  method: AxiosRequestConfig['method']
): string => {
  if (!method || method === 'get' || method === 'GET') {
    const paramsList = Object.entries(variables)
      .filter((entry) => entry[1] !== undefined && entry[1] !== null)
      .map(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') {
          return `${key}=${encodeURIComponent(value)}`
        }
        throw new Error('Cannot use anything but number, string, boolean in the url params')
      })
      .join('&')
    return paramsList === '' ? '' : `?${paramsList}`
  }
  return ''
}

type DefaultData = Record<string, unknown>
type Params<Data extends DefaultData, Response extends ZodTypeAny> = {
  endpoint: string
  method?: AxiosRequestConfig['method']
  responseSchema: Response
  data: Data
  customAPIUrl?: string
  requireAuthentication: boolean
}
type Request<Data extends DefaultData, Result> = {
  result: Ref<Result | null>
  loading: Ref<boolean>
  makeRequest: (data?: Data, endpoint?: string) => Promise<Result>
  variables: Ref<Data>
}

export const getDefaultHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  return headers
}

export const getAuthenticationHeader = (): Record<string, string> => {
  const { oktaUser } = useAuthentication()
  const oktaToken = oktaUser.value?.access_token ?? ''
  const headers: Record<string, string> = {}
  if (oktaToken) headers.Authorization = `Bearer ${oktaToken}`
  return headers
}

const useImmediateRequest = <D extends DefaultData, Schema extends ZodTypeAny>(
  params: Params<D, Schema>
): Request<D, ReturnType<Schema['parse']>> => {
  // @ts-expect-error it has something to do with unwrapping refs, that breaks ts here
  const variables: Ref<D> = ref(params.data)
  const baseUrl: string = params.customAPIUrl ?? `${process.env.VUE_APP_API_URL}/`
  if (!baseUrl) {
    throw new Error('API URL must be provided in .env  as `VUE_APP_API_URL`')
  }
  const result: Ref<ReturnType<Schema['parse']> | null> = ref(null)
  const loading = ref(false)

  const makeRequest = async (modifiedData?: D) => {
    loading.value = true
    const data = modifiedData ?? params.data
    const axiosConfig: AxiosRequestConfig = {
      method: params.method,
      url: `${baseUrl}${params.endpoint.replace(/^\//g, '')}${getURLParams(data, params.method)}`,
      data,
      responseType: 'json',
      headers: {
        ...getDefaultHeaders(),
        ...(params.requireAuthentication ? getAuthenticationHeader() : {})
      }
    }
    let response: AxiosResponse<unknown>
    try {
      response = await axios(axiosConfig)
    } catch (err) {
      loading.value = false
      throw err
    }
    const parsedResult = params.responseSchema.parse(response.data)
    result.value = parsedResult
    loading.value = false
    return parsedResult
  }

  makeRequest()

  watch(
    variables,
    (newVariables) => {
      makeRequest(newVariables)
    },
    { deep: true }
  )

  return { result, loading, makeRequest, variables }
}

export default useImmediateRequest
