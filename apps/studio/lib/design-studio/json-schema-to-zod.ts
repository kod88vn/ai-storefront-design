import { z } from "zod";

export function jsonSchemaToZod(schema: unknown): z.ZodTypeAny {
  if (!schema || typeof schema !== "object") return z.unknown();
  const s = schema as Record<string, unknown>;

  if (Array.isArray(s.enum) && s.enum.length > 0) {
    const vals = s.enum as (string | number)[];
    if (typeof vals[0] === "string") {
      return z.enum(vals as [string, ...string[]]);
    }
    const literals = vals.map((value) => z.literal(value as number));
    return z.union(
      literals as unknown as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]],
    );
  }

  switch (s.type as string) {
    case "string":
      return z.string();
    case "number":
    case "integer": {
      let num = z.number();
      if (typeof s.minimum === "number") num = num.min(s.minimum as number);
      if (typeof s.maximum === "number") num = num.max(s.maximum as number);
      return num;
    }
    case "boolean":
      return z.boolean();
    case "array":
      return z.array(s.items ? jsonSchemaToZod(s.items) : z.unknown());
    case "object": {
      if (!s.properties || typeof s.properties !== "object") {
        return z.record(z.string(), z.unknown());
      }
      const required = new Set<string>(
        Array.isArray(s.required) ? (s.required as string[]) : [],
      );
      const shape = Object.fromEntries(
        Object.entries(s.properties as Record<string, unknown>).map(
          ([key, value]) => {
            const field = jsonSchemaToZod(value);
            return [key, required.has(key) ? field : field.optional()];
          },
        ),
      );
      return z.object(shape);
    }
    default:
      return z.unknown();
  }
}
