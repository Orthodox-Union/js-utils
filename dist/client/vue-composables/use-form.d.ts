import { Ref, ComputedRef } from 'vue';
import { ZodObject, ZodTypeAny, ZodEffects } from 'zod';
export declare type Errors<Form extends Record<string, unknown>> = Partial<{
    [key in keyof Form]: Form[key] extends Array<infer InnerValue> ? InnerValue extends Record<string, unknown> ? {
        innerErrors: Array<Partial<{
            [key in keyof InnerValue]: string[];
        } | undefined>>;
        outerErrors: string[];
    } : string[] : string[];
}>;
declare type ZodEffectsUnion<T extends ZodTypeAny> = T | ZodEffects<T> | ZodEffects<ZodEffects<T>> | ZodEffects<ZodEffects<ZodEffects<T>>> | ZodEffects<ZodEffects<ZodEffects<ZodEffects<T>>>> | ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<T>>>>> | ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<T>>>>>> | ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<T>>>>>>>;
export declare type Nullable<T> = {
    [key in keyof T]: T[key] extends Array<infer val> ? Nullable<val>[] : T[key] | null;
};
export declare const getZodErrors: <Shape extends Record<string, ZodTypeAny>, Schema extends ZodEffectsUnion<ZodObject<Shape, import("zod").UnknownKeysParam, ZodTypeAny, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<import("zod").baseObjectOutputType<Shape>, { [k in keyof import("zod").baseObjectOutputType<Shape>]: undefined extends import("zod").baseObjectOutputType<Shape>[k] ? never : k; }[keyof Shape]>]: import("zod").objectUtil.addQuestionMarks<import("zod").baseObjectOutputType<Shape>, { [k in keyof import("zod").baseObjectOutputType<Shape>]: undefined extends import("zod").baseObjectOutputType<Shape>[k] ? never : k; }[keyof Shape]>[k_1]; }, { [k_2 in keyof import("zod").baseObjectInputType<Shape>]: import("zod").baseObjectInputType<Shape>[k_2]; }>>, ErrorsResult extends Partial<{ [key in keyof ReturnType<Schema["parse"]>]: ReturnType<Schema["parse"]>[key] extends (infer InnerValue)[] ? InnerValue extends Record<string, unknown> ? {
    innerErrors: Partial<{ [key_1 in keyof InnerValue]: string[]; } | undefined>[];
    outerErrors: string[];
} : string[] : string[]; }>>(schema: Schema, form: Record<string, unknown>) => ErrorsResult;
declare const useForm: <Shape extends Record<string, ZodTypeAny>, Schema extends ZodEffectsUnion<ZodObject<Shape, import("zod").UnknownKeysParam, ZodTypeAny, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<import("zod").baseObjectOutputType<Shape>, { [k in keyof import("zod").baseObjectOutputType<Shape>]: undefined extends import("zod").baseObjectOutputType<Shape>[k] ? never : k; }[keyof Shape]>]: import("zod").objectUtil.addQuestionMarks<import("zod").baseObjectOutputType<Shape>, { [k in keyof import("zod").baseObjectOutputType<Shape>]: undefined extends import("zod").baseObjectOutputType<Shape>[k] ? never : k; }[keyof Shape]>[k_1]; }, { [k_2 in keyof import("zod").baseObjectInputType<Shape>]: import("zod").baseObjectInputType<Shape>[k_2]; }>>, ValidForm extends ReturnType<Schema["parse"]>, Form extends Nullable<ValidForm>>(schema: Schema, defaultForm: Form, processing: Ref<boolean> | ComputedRef<boolean>, onSubmit: (form: ValidForm) => Promise<void>, clearAfterSubmit?: boolean) => {
    form: [Form] extends [Ref<any>] ? Form : Ref<import("vue").UnwrapRef<Form>>;
    errors: ComputedRef<Partial<{ [key in keyof ReturnType<Schema["parse"]>]: ReturnType<Schema["parse"]>[key] extends (infer InnerValue)[] ? InnerValue extends Record<string, unknown> ? {
        innerErrors: Partial<{ [key_1 in keyof InnerValue]: string[]; } | undefined>[];
        outerErrors: string[];
    } : string[] : string[]; }>>;
    isTouched: Ref<boolean>;
    clickSubmitButton: () => Promise<void>;
    isSubmitDisabled: ComputedRef<boolean>;
};
export default useForm;
