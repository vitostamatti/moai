import React from "react";
import { UseFormReturn } from "react-hook-form";
import { SetFormData } from "@/lib/editor/set/set-form-schema";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface DescriptionFieldProps {
  form: UseFormReturn<SetFormData>;
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
            placeholder="Optional description of what this set represents"
            rows={2}
            {...field}
          />
        </FormControl>
        <FormDescription>
          Optional description of what this set represents
        </FormDescription>
      </FormItem>
    )}
  />
);
