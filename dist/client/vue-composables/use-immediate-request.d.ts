import { Ref } from 'vue';
import { AxiosRequestConfig } from 'axios';
import { ZodTypeAny } from 'zod';
export declare const getURLParams: (variables: Record<string, unknown>, method: AxiosRequestConfig['method']) => string;
declare type DefaultData = Record<string, unknown>;
declare type Params<Data extends DefaultData, Response extends ZodTypeAny> = {
    endpoint: string;
    method?: AxiosRequestConfig['method'];
    responseSchema: Response;
    data: Data;
};
declare type Request<Data extends DefaultData, Result> = {
    result: Ref<Result | null>;
    loading: Ref<boolean>;
    makeRequest: (data?: Data, endpoint?: string) => Promise<Result>;
    variables: Ref<Data>;
};
export declare const getDefaultHeaders: () => Record<string, string>;
declare const useImmediateRequest: <D extends DefaultData, Schema extends ZodTypeAny>(params: Params<D, Schema>) => Request<D, ReturnType<Schema["parse"]>>;
export default useImmediateRequest;
