import React, { useMemo, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import type { VariableFormData } from "../types";
import type { SetSelect } from "@/db/schema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, AlertTriangle, CheckCircle } from "lucide-react";

interface IndexSetsFieldProps {
  form: UseFormReturn<VariableFormData>;
  sets: SetSelect[];
}

// Generate all possible index combinations for the selected sets
const generateIndexCombinations = (selectedSets: SetSelect[]): string[] => {
  if (selectedSets.length === 0) return [];

  // Start with first set's elements, convert to strings
  let combinations = selectedSets[0].elements.map((el) => [String(el)]);

  // For each additional set, create cartesian product
  for (let i = 1; i < selectedSets.length; i++) {
    const newCombinations: string[][] = [];
    for (const combination of combinations) {
      for (const element of selectedSets[i].elements) {
        newCombinations.push([...combination, String(element)]);
      }
    }
    combinations = newCombinations;
  }

  // Convert to string representations
  return combinations.map((combo) => combo.join(","));
};

export const IndexSetsField = ({ form, sets }: IndexSetsFieldProps) => {
  // Watch indices changes from the form
  const watchedIndices = useMemo(() => form.watch("indices") || [], [form]);

  // Get sets that are currently selected for indices
  const selectedSets = useMemo(() => {
    return sets.filter((set) => watchedIndices.includes(set.name));
  }, [sets, watchedIndices]);

  // Get available sets (not yet selected)
  const availableSets = useMemo(() => {
    return sets.filter((set) => !watchedIndices.includes(set.name));
  }, [sets, watchedIndices]);

  // Generate all possible combinations for the selected sets
  const indexCombinations = useMemo(() => {
    return generateIndexCombinations(selectedSets);
  }, [selectedSets]);

  const handleAddIndex = useCallback(
    (setName: string) => {
      const currentIndices = form.getValues("indices") || [];
      if (!currentIndices.includes(setName)) {
        const newIndices = [...currentIndices, setName];
        form.setValue("indices", newIndices, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    },
    [form]
  );

  const handleRemoveIndex = useCallback(
    (index: number) => {
      const currentIndices = form.getValues("indices") || [];
      const newIndices = currentIndices.filter((_, i) => i !== index);
      form.setValue("indices", newIndices, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    },
    [form]
  );

  return (
    <FormField
      control={form.control}
      name="indices"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Index Sets</FormLabel>
          <FormDescription>
            Select sets to index this variable. Multiple sets will create all
            combinations.
          </FormDescription>

          {/* Available sets to add as indices */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Available Sets:</div>
            <div className="flex flex-wrap gap-2">
              {availableSets.map((set) => (
                <Button
                  key={set.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddIndex(set.name)}
                  disabled={field.value?.includes(set.name)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {set.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Current indices */}
          {field.value && field.value.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Selected Sets:</div>
              <div className="flex flex-wrap gap-2">
                {field.value.map((setName: string, i: number) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {setName}
                    <button
                      type="button"
                      onClick={() => handleRemoveIndex(i)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Show index combinations preview */}
          {indexCombinations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">
                  Variable Indices Preview ({indexCombinations.length}{" "}
                  combinations):
                </span>
              </div>

              {indexCombinations.length <= 20 ? (
                <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                  {indexCombinations.map((combination, index) => (
                    <div
                      key={index}
                      className="text-xs font-mono bg-muted px-2 py-1 rounded"
                    >
                      x[{combination}]
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Too many combinations to display ({indexCombinations.length}{" "}
                    total)
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-mono bg-muted px-2 py-1 rounded">
                      x[{indexCombinations[0]}]
                    </div>
                    <div className="text-center text-muted-foreground">...</div>
                    <div className="font-mono bg-muted px-2 py-1 rounded">
                      x[
                      {indexCombinations[indexCombinations.length - 1]}]
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {sets.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="w-4 h-4" />
              No sets available. Create sets first to use indexed variables.
            </div>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
};
