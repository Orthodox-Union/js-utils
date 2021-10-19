import { Ref } from 'vue';
import { ZodObject, ZodTypeAny, ZodEffects } from 'zod';
declare type ZodEffectsUnion<T extends ZodTypeAny> = T | ZodEffects<T> | ZodEffects<ZodEffects<T>> | ZodEffects<ZodEffects<ZodEffects<T>>> | ZodEffects<ZodEffects<ZodEffects<ZodEffects<T>>>> | ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<T>>>>> | ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<T>>>>>> | ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<T>>>>>>>;
export declare type Nullable<T> = {
    [key in keyof T]: T[key] extends Array<infer val> ? Nullable<val>[] : T[key] | null;
};
declare type GetZodErrors = <Shape extends Record<string, ZodTypeAny>, Schema extends ZodEffectsUnion<ZodObject<Shape>>>(schema: Schema, form: Record<string, unknown>) => Partial<Record<keyof ReturnType<Schema['parse']>, string[]>>;
export declare const getZodErrors: GetZodErrors;
export declare const getZodListError: <Shape extends Record<string, ZodTypeAny>, Schema extends ZodEffectsUnion<ZodObject<Shape, "strip", ZodTypeAny, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>[k_1]; }, { [k_3 in keyof import("zod").objectUtil.addQuestionMarks<{ [k_2 in keyof Shape]: Shape[k_2]["_input"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k_2 in keyof Shape]: Shape[k_2]["_input"]; }>[k_3]; }>>, ValidForm extends ReturnType<Schema["parse"]>, ListKey extends keyof ValidForm, InnerKey extends keyof ValidForm[ListKey][number]>(schema: Schema, form: Record<string, unknown>, listKey: ListKey, position: number, innerKey: InnerKey) => string | null;
declare const useForm: <Shape extends Record<string, ZodTypeAny>, Schema extends ZodEffectsUnion<ZodObject<Shape, "strip", ZodTypeAny, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>[k_1]; }, { [k_3 in keyof import("zod").objectUtil.addQuestionMarks<{ [k_2 in keyof Shape]: Shape[k_2]["_input"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k_2 in keyof Shape]: Shape[k_2]["_input"]; }>[k_3]; }>>, ValidForm extends ReturnType<Schema["parse"]>, Form extends Nullable<ValidForm>>(schema: Schema, defaultForm: Form, processing: Ref<boolean>, onSubmit: (form: ValidForm) => Promise<void>, clearAfterSubmit?: boolean) => {
    form: [Form] extends [Ref<any>] ? Form : Ref<import("vue").UnwrapRef<Form>>;
    errors: import("vue").ComputedRef<Partial<Record<keyof ReturnType<Schema["parse"]>, string[]>>>;
    isTouched: Ref<boolean>;
    clickSubmitButton: () => Promise<void>;
    isSubmitDisabled: import("vue").ComputedRef<boolean>;
};
export default useForm;
