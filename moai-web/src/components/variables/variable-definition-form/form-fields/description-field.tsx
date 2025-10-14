import React from "react";
import { UseFormReturn } from "react-hook-form";
import type { VariableFormData } from "../types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface DescriptionFieldProps {
  form: UseFormReturn<VariableFormData>;
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
            placeholder="Optional description of what this variable represents..."
            className="resize-none"
            {...field}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);
