import { z, ZodError, ZodSchema } from "zod";

type Result<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      fields: Record<string, string>;
      fieldErrors: Record<string, string>;
    };

export const zodAction = <T extends ZodSchema>(
  schema: T,
  form: FormData,
): Result<z.infer<typeof schema>> => {
  const fields: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") {
      fields[key] = value;
    }
  }

  const result = schema.safeParse(fields);
  if (!result.success) {
    return {
      success: false,
      fields,
      fieldErrors: parseZodErrors(result.error),
    };
  }

  return {
    success: true,
    data: result.data,
  };
};

const parseZodErrors = (errors: ZodError): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(errors.flatten().fieldErrors)) {
    if (value) {
      result[key] = Array.isArray(value) ? value.join(", ") : value;
    }
  }
  return result;
};
