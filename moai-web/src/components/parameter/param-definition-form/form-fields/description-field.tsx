import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ParamDefinitionFormSchema } from "@/lib/editor/param/param-form-schema";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface DescriptionFieldProps {
  form: UseFormReturn<ParamDefinitionFormSchema>;
}

export const DescriptionField = ({ form }: DescriptionFieldProps) => (
  <FormField
    control={form.control}
    name="description"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Description</FormLabel>
        <FormControl>
          <Textarea
            placeholder="Optional description of what this parameter represents"
            rows={2}
            {...field}
          />
        </FormControl>
        <FormDescription>
          Optional description of what this parameter represents
        </FormDescription>
      </FormItem>
    )}
  />
);
