import React from "react";
import { UseFormReturn } from "react-hook-form";
import { SetFormData } from "@/lib/editor/set/set-form-schema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface NameFieldProps {
  form: UseFormReturn<SetFormData>;
}

export const NameField = ({ form }: NameFieldProps) => (
  <FormField
    control={form.control}
    name="name"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Name *</FormLabel>
        <FormControl>
          <Input placeholder="e.g., Plants, Markets, Products" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);
