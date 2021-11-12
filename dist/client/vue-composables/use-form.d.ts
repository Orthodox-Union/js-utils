import { Ref, ComputedRef } from 'vue';
import { ZodObject, ZodTypeAny, ZodEffects } from 'zod';
declare type ZodEffectsUnion<T extends ZodTypeAny> = T | ZodEffects<T> | ZodEffects<ZodEffects<T>> | ZodEffects<ZodEffects<ZodEffects<T>>> | ZodEffects<ZodEffects<ZodEffects<ZodEffects<T>>>> | ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<T>>>>> | ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<T>>>>>> | ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<T>>>>>>>;
export declare type Nullable<T> = {
    [key in keyof T]: T[key] extends Array<infer val> ? Nullable<val>[] : T[key] | null;
};
export declare const getZodErrors: <Shape extends Record<string, ZodTypeAny>, Schema extends ZodEffectsUnion<ZodObject<Shape, "strip", ZodTypeAny, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>[k_1]; }, { [k_3 in keyof import("zod").objectUtil.addQuestionMarks<{ [k_2 in keyof Shape]: Shape[k_2]["_input"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k_2 in keyof Shape]: Shape[k_2]["_input"]; }>[k_3]; }>>, ErrorsResult extends Partial<{ [key in keyof ReturnType<Schema["parse"]>]: ReturnType<Schema["parse"]>[key] extends (infer InnerValue)[] ? InnerValue extends Record<string, unknown> ? {
    innerErrors: Partial<{ [key_1 in keyof InnerValue]: string[]; } | undefined>[];
    outerErrors: string[];
} : string[] : string[]; }>>(schema: Schema, form: Record<string, unknown>) => ErrorsResult;
declare const useForm: <Shape extends Record<string, ZodTypeAny>, Schema extends ZodEffectsUnion<ZodObject<Shape, "strip", ZodTypeAny, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>[k_1]; }, { [k_3 in keyof import("zod").objectUtil.addQuestionMarks<{ [k_2 in keyof Shape]: Shape[k_2]["_input"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k_2 in keyof Shape]: Shape[k_2]["_input"]; }>[k_3]; }>>, ValidForm extends ReturnType<Schema["parse"]>, Form extends Nullable<ValidForm>>(schema: Schema, defaultForm: Form, processing: Ref<boolean> | ComputedRef<boolean>, onSubmit: (form: ValidForm) => Promise<void>, clearAfterSubmit?: boolean) => {
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
