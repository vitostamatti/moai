import React from "react";
import { UseFormReturn } from "react-hook-form";
import type { VariableFormData } from "../types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface BoundsFieldsProps {
  form: UseFormReturn<VariableFormData>;
}

export const BoundsFields = ({ form }: BoundsFieldsProps) => (
  <div className="grid grid-cols-2 gap-4">
    <FormField
      control={form.control}
      name="lowerBound"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Lower Bound</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder="Optional minimum value"
              {...field}
            />
          </FormControl>
          <FormDescription>
            Minimum allowed value for this variable
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="upperBound"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Upper Bound</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder="Optional maximum value"
              {...field}
            />
          </FormControl>
          <FormDescription>
            Maximum allowed value for this variable
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);
