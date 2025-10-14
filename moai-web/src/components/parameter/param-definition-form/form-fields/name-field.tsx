import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ParamDefinitionFormSchema } from "@/lib/editor/param/param-form-schema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface NameFieldProps {
  form: UseFormReturn<ParamDefinitionFormSchema>;
}

export const NameField = ({ form }: NameFieldProps) => (
  <FormField
    control={form.control}
    name="name"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Name *</FormLabel>
        <FormControl>
          <Input placeholder="e.g., cost, capacity, demand" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);
