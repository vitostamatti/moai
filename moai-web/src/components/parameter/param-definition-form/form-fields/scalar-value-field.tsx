import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ParamDefinitionFormSchema } from "@/lib/editor/param/param-form-schema";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ScalarValueFieldProps {
  form: UseFormReturn<ParamDefinitionFormSchema>;
}

export const ScalarValueField = ({ form }: ScalarValueFieldProps) => (
  <FormField
    control={form.control}
    name="scalarValue"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Value *</FormLabel>
        <FormControl>
          <Input placeholder="e.g., 100, 1.5, 'high'" {...field} />
        </FormControl>
        <FormDescription>Enter a numeric value or text</FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
);
