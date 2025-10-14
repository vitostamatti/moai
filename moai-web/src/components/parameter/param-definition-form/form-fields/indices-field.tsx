import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ParamDefinitionFormSchema } from "@/lib/editor/param/param-form-schema";
import type { SetSelect } from "@/db/schema";
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface IndicesFieldProps {
  form: UseFormReturn<ParamDefinitionFormSchema>;
  sets: SetSelect[];
  indices: string[];
  onAddIndex: (setName: string) => void;
  onRemoveIndex: (index: number) => void;
}

export const IndicesField = ({
  form,
  sets,
  indices,
  onAddIndex,
  onRemoveIndex,
}: IndicesFieldProps) => (
  <FormField
    control={form.control}
    name="indices"
    render={() => (
      <FormItem>
        <FormLabel>Indices</FormLabel>
        <FormDescription>
          Select which sets this parameter is indexed over
        </FormDescription>

        {/* Available sets to add as indices */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Available Sets:</div>
          <div className="flex flex-wrap gap-2">
            {sets.map((set) => (
              <Button
                key={set.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAddIndex(set.name)}
                disabled={indices?.includes(set.name)}
              >
                <Plus className="w-3 h-3 mr-1" />
                {set.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Current indices */}
        {indices && indices.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Selected Indices:</div>
            <div className="flex flex-wrap gap-2">
              {indices.map((index, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {index}
                  <button
                    type="button"
                    onClick={() => onRemoveIndex(i)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <FormMessage />
      </FormItem>
    )}
  />
);
