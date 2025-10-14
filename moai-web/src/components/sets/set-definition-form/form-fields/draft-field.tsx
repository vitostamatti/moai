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
import { Switch } from "@/components/ui/switch";

interface DraftFieldProps {
  form: UseFormReturn<SetFormData>;
}
export const DraftField = ({ form }: DraftFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="isDraft"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
          <FormLabel>Save as Draft</FormLabel>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              aria-readonly
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
