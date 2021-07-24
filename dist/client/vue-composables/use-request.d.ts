import { Ref } from 'vue';
import { AxiosRequestConfig } from 'axios';
import { ZodTypeAny } from 'zod';
declare type DefaultData = Record<string, unknown>;
declare type Params<Response extends ZodTypeAny> = {
    method?: AxiosRequestConfig['method'];
    responseSchema: Response;
    customAPIUrl?: string;
    cacheKey?: string;
    customHeaders?: Record<string, string>;
};
declare type Request<Data extends DefaultData, Result> = {
    result: Ref<Result | null>;
    loading: Ref<boolean>;
    makeRequest: (data: Data, endpoint: string) => Promise<Result>;
};
declare const useRequest: <D extends DefaultData, Schema extends ZodTypeAny>(params: Params<Schema>) => Request<D, ReturnType<Schema["parse"]>>;
export default useRequest;
