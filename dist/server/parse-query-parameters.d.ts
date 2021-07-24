import { Request, Response } from 'express';
import { ZodEffects, ZodObject, ZodTypeAny } from 'zod';
declare const parseQueryParameters: <Shape extends Record<string, ZodTypeAny>, Schema extends ZodObject<Shape, "strip", ZodTypeAny, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>[k_1]; }, { [k_3 in keyof import("zod").objectUtil.addQuestionMarks<{ [k_2 in keyof Shape]: Shape[k_2]["_input"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k_2 in keyof Shape]: Shape[k_2]["_input"]; }>[k_3]; }> | ZodEffects<ZodObject<Shape, "strip", ZodTypeAny, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>[k_1]; }, { [k_3 in keyof import("zod").objectUtil.addQuestionMarks<{ [k_2 in keyof Shape]: Shape[k_2]["_input"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k_2 in keyof Shape]: Shape[k_2]["_input"]; }>[k_3]; }>, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>[k_1]; }> | ZodEffects<ZodEffects<ZodObject<Shape, "strip", ZodTypeAny, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>[k_1]; }, { [k_3 in keyof import("zod").objectUtil.addQuestionMarks<{ [k_2 in keyof Shape]: Shape[k_2]["_input"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k_2 in keyof Shape]: Shape[k_2]["_input"]; }>[k_3]; }>, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>[k_1]; }>, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>[k_1]; }> | ZodEffects<ZodEffects<ZodEffects<ZodObject<Shape, "strip", ZodTypeAny, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>[k_1]; }, { [k_3 in keyof import("zod").objectUtil.addQuestionMarks<{ [k_2 in keyof Shape]: Shape[k_2]["_input"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k_2 in keyof Shape]: Shape[k_2]["_input"]; }>[k_3]; }>, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>[k_1]; }>, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>[k_1]; }>, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>[k_1]; }> | ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodObject<Shape, "strip", ZodTypeAny, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>[k_1]; }, { [k_3 in keyof import("zod").objectUtil.addQuestionMarks<{ [k_2 in keyof Shape]: Shape[k_2]["_input"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k_2 in keyof Shape]: Shape[k_2]["_input"]; }>[k_3]; }>, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>[k_1]; }>, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>[k_1]; }>, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>[k_1]; }>, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>[k_1]; }> | ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodObject<Shape, "strip", ZodTypeAny, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>[k_1]; }, { [k_3 in keyof import("zod").objectUtil.addQuestionMarks<{ [k_2 in keyof Shape]: Shape[k_2]["_input"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k_2 in keyof Shape]: Shape[k_2]["_input"]; }>[k_3]; }>, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>[k_1]; }>, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>[k_1]; }>, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>[k_1]; }>, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>[k_1]; }>, { [k_1 in keyof import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>]: import("zod").objectUtil.addQuestionMarks<{ [k in keyof Shape]: Shape[k]["_output"]; }>[k_1]; }>, ValidParams extends ReturnType<Schema["parse"]>>(request: Request, res: Response, schema: Schema) => ValidParams | null;
export default parseQueryParameters;
