"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { ExpressionTreeView } from "@/components/expression/expression-tree";
import type { UseFormReturn } from "react-hook-form";
import type { ConstraintDefinition } from "@/lib/editor/constraint/constraint-schema";
import { createNode } from "@/lib/editor/expression/utils";
import { ExpressionSelectionEditor } from "@/components/expression/expression-selection-editor";
import {
  expressionTypeHasChildren,
  useExpressionTreeState,
} from "@/components/expression/hooks/useExpressionTreeState";

export type QuantifierBlock = NonNullable<ConstraintDefinition["quantifiers"]>;

type FormValues = {
  constraint: ConstraintDefinition;
};

interface QuantifierEditorProps {
  value?: QuantifierBlock;
  onChange: (val: QuantifierBlock | undefined) => void;
  rootPath: string; // e.g. "constraint.quantifiers"
  form: UseFormReturn<FormValues>;
}

export const QuantifierEditor = ({
  value,
  onChange,
  rootPath,
  form,
}: QuantifierEditorProps) => {
  // Tree view helper functions
  // Tree view state management
  const { watch, control } = form;
  const watchedConstraint = watch("constraint");

  const {
    selectedPath,
    expandedPaths,
    selectPath: handleNodeSelect,
    toggleExpand: handleToggleExpand,
    getSelectedExpression,
    setExpandedPaths,
    setSelectedPath,
  } = useExpressionTreeState({
    rootObject: watchedConstraint,
    rootKey: "constraint",
    initialSelectedPath: `${rootPath}.condition`,
    initialExpandedPaths: [`${rootPath}.condition`],
  });
  const addBinding = () => {
    if (!value) {
      onChange({ bindings: [{ index: "", over: "" }] });
      return;
    }
    onChange({
      bindings: [...value.bindings, { index: "", over: "" }],
      ...(value.condition ? { condition: value.condition } : {}),
    });
  };

  const updateBinding = (
    i: number,
    field: "index" | "over",
    newVal: string
  ) => {
    if (!value) return;
    const copy = value.bindings.slice();
    copy[i] = { ...copy[i], [field]: newVal };
    onChange({
      bindings: copy,
      ...(value.condition ? { condition: value.condition } : {}),
    });
  };

  const removeBinding = (i: number) => {
    if (!value) return;
    const remaining = value.bindings.filter((_, idx) => idx !== i);
    if (remaining.length === 0) {
      onChange(undefined);
    } else {
      onChange({
        bindings: remaining,
        ...(value.condition ? { condition: value.condition } : {}),
      });
    }
  };

  const addCondition = () => {
    if (!value || value.condition) return;
    onChange({
      bindings: value.bindings,
      condition: createNode("comparison"),
    });
    // Focus the newly created condition root in the editor
    const conditionPath = `${rootPath}.condition`;
    setSelectedPath(conditionPath);
    setExpandedPaths((prev) => new Set([...prev, conditionPath]));
  };

  const removeCondition = () => {
    if (!value?.condition) return;
    onChange({ bindings: value.bindings });
  };

  // getSelectedExpression & toggle handled by hook

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Quantifiers (Optional)</h3>
        <Button type="button" variant="outline" size="sm" onClick={addBinding}>
          <Plus className="h-4 w-4 mr-1" /> Add Binding
        </Button>
      </div>
      {value && value.bindings.length > 0 ? (
        <div className="space-y-4">
          {value.bindings.map((b, i) => (
            <div key={i} className="border rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Binding {i + 1}</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeBinding(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Index Variable</Label>
                  <Input
                    value={b.index}
                    placeholder="e.g., i"
                    onChange={(e) => updateBinding(i, "index", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Set</Label>
                  <Input
                    value={b.over}
                    placeholder="e.g., Products"
                    onChange={(e) => updateBinding(i, "over", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label>Condition (Optional)</Label>
              {!value.condition && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCondition}
                  disabled={!value.bindings.length}
                >
                  Add Condition
                </Button>
              )}
              {value.condition && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeCondition}
                >
                  Remove Condition
                </Button>
              )}
            </div>
            {value.condition && (
              <div className="border rounded-lg p-3 bg-muted/30">
                <ExpressionTreeView
                  expression={value.condition}
                  basePath="constraint.quantifiers.condition"
                  selectedPath={selectedPath}
                  expandedPaths={expandedPaths}
                  onSelect={handleNodeSelect}
                  onToggleExpand={handleToggleExpand}
                  // errors={errors.constraint?.condition as FieldError}
                />
                {selectedPath?.startsWith("constraint.quantifiers.condition") &&
                getSelectedExpression() ? (
                  <ExpressionSelectionEditor<FormValues>
                    rootExpression={value.condition}
                    rootPath="constraint.quantifiers.condition"
                    selectedPath={selectedPath}
                    control={control}
                    onAfterTypeChange={(newType) => {
                      const path = selectedPath;
                      if (path && expressionTypeHasChildren(newType)) {
                        setExpandedPaths((prev) => new Set([...prev, path]));
                      }
                    }}
                  />
                ) : (
                  <div className="text-center text-muted-foreground py-6">
                    Select a node from the expression tree to edit its
                    properties
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-3">
          <p className="text-muted-foreground text-sm text-center py-3">
            No bindings defined. Add bindings to create indexed constraints.
          </p>
        </div>
      )}
    </div>
  );
};
