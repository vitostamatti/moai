import { is } from "drizzle-orm";
import { z } from "zod";

export const setFormSchema = z
  .object({
    name: z.string().min(1, "Name is required").trim(),
    description: z.string().optional(),
    elementType: z.enum(["string", "number"]),
    elements: z.array(z.string()).min(1, "At least one element is required"),
    isDraft: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // Check for unique elements
      const uniqueElements = new Set(data.elements);
      if (uniqueElements.size !== data.elements.length) {
        return false;
      }

      // Check if all elements match the selected type
      if (data.elementType === "number") {
        // All elements should be valid numbers
        return data.elements.every(
          (element) =>
            !isNaN(parseFloat(element)) && isFinite(parseFloat(element))
        );
      } else {
        // For string type, we accept any non-empty string
        return data.elements.every((element) => element.trim().length > 0);
      }
    },
    {
      message: "Elements must be unique and match the selected element type",
      path: ["elements"],
    }
  );

export type SetFormData = z.infer<typeof setFormSchema>;
