import { ref, Ref } from 'vue'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { ZodTypeAny } from 'zod'
import { getDefaultHeaders, getURLParams } from './use-immediate-request'

const cachedResults: Record<string, Record<string, any>> = {}

type DefaultData = Record<string, unknown>
type Params<Response extends ZodTypeAny> = {
  method?: AxiosRequestConfig['method']
  responseSchema: Response
  customAPIUrl?: string
  cacheKey?: string
  customHeaders?: Record<string, string>
}
type Request<Data extends DefaultData, Result> = {
  result: Ref<Result | null>
  loading: Ref<boolean>
  makeRequest: (data: Data, endpoint: string) => Promise<Result>
}

const useRequest = <D extends DefaultData, Schema extends ZodTypeAny>(
  params: Params<Schema>
): Request<D, ReturnType<Schema['parse']>> => {
  if (params.cacheKey && !cachedResults[params.cacheKey]) {
    cachedResults[params.cacheKey] = {}
  }
  const baseUrl: string = params.customAPIUrl ?? `${process.env.VUE_APP_API_URL}/`
  const result: Ref<ReturnType<Schema['parse']> | null> = ref(null)
  const loading = ref(false)

  const makeRequest = async (data: D, endpoint: string) => {
    const dataKey = JSON.stringify(data)
    if (params.cacheKey && cachedResults[params.cacheKey][dataKey]) {
      const cachedValue = cachedResults[params.cacheKey][dataKey]
      result.value = cachedValue
      return result.value
    }
    loading.value = true
    const axiosConfig: AxiosRequestConfig = {
      method: params.method,
      url: `${baseUrl}${endpoint.replace(/^\//g, '')}${getURLParams(data, params.method)}`,
      data: params.method === 'GET' ? undefined : data,
      responseType: 'json',
      headers: {
        ...getDefaultHeaders(),
        ...(params.customHeaders ?? {})
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
    if (params.cacheKey) {
      cachedResults[params.cacheKey][dataKey] = parsedResult
    }
    result.value = parsedResult
    loading.value = false
    return parsedResult
  }

  return { result, loading, makeRequest }
}

export default useRequest
