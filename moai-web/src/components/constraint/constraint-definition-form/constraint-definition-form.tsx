"use client";

import React from "react";
import { useForm, FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
// Removed inline quantifier editing icons (Plus, Trash2) now handled inside QuantifierEditor

import {
  constraintDefinitionSchema,
  type ConstraintDefinition,
} from "@/lib/editor/constraint/constraint-schema";
// Expression handling moved to shared hook
import { createNode } from "@/lib/editor/expression/utils";
import { getConstraintPreview } from "@/lib/editor/constraint/constraint-utils";
// (ExpressionPath no longer directly used here after refactor)
import { ExpressionSelectionEditor } from "@/components/expression/expression-selection-editor";

import { ExpressionTreeView } from "@/components/expression/expression-tree";
import {
  expressionTypeHasChildren,
  useExpressionTreeState,
} from "@/components/expression/hooks/useExpressionTreeState";
import { QuantifierEditor } from "@/components/constraint/quantifier-editor";
import type { ConstraintSelect, SetSelect, VariableSelect } from "@/db/schema";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type FormValues = { constraint: ConstraintDefinition };
const formSchema: z.ZodType<FormValues, FormValues> = z.object({
  constraint: constraintDefinitionSchema,
});
type Props = {
  modelId: string;
  sets?: SetSelect[];
  variables?: VariableSelect[];
  constraint?: ConstraintSelect;
};
export default function ConstraintDefinitionForm(props: Props) {
  const { modelId, constraint } = props;
  // TODO: add model vars and sets to the form context
  const defaultConstraint: ConstraintDefinition = constraint
    ? {
        id: constraint.id,
        name: constraint.name,
        description: constraint.description ?? undefined,
        enabled: constraint.enabled ?? true,
        type: constraint.type,
        leftSide: constraint.leftSide,
        rightSide: constraint.rightSide,
        quantifiers: constraint.quantifiers ?? undefined,
      }
    : {
        id: `constraint-${Date.now()}`,
        name: "",
        description: "",
        enabled: true,
        type: "eq",
        leftSide: createNode("var"),
        rightSide: createNode("number"),
      };
  const isEditing = !!constraint;
  const trpc = useTRPC();
  const qc = useQueryClient();

  const invalidateModelCaches = async () => {
    await Promise.all([
      qc.invalidateQueries(trpc.models.detail.queryFilter({ id: modelId })),
      qc.invalidateQueries(trpc.models.list.queryFilter()),
    ]);
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "all",
    defaultValues: {
      constraint: defaultConstraint,
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = form;

  // Watch constraint values for preview
  const watchedConstraint = watch("constraint");

  const quantifierBlock = watchedConstraint.quantifiers;

  // Use shared tree state logic
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
    initialSelectedPath: "constraint.leftSide",
    initialExpandedPaths: ["constraint.leftSide", "constraint.rightSide"],
  });

  // Form submission
  const createMutation = useMutation(
    trpc.constraints.create.mutationOptions({
      onSuccess: async () => {
        toast.success("Constraint created");
        await invalidateModelCaches();
      },
      onError: (e) =>
        toast.error(
          (e as { message?: string })?.message ?? "Failed to create constraint"
        ),
    })
  );

  const updateMutation = useMutation(
    trpc.constraints.update.mutationOptions({
      onSuccess: async () => {
        toast.success("Constraint updated");
        await invalidateModelCaches();
      },
      onError: (e) =>
        toast.error(
          (e as { message?: string })?.message ?? "Failed to update constraint"
        ),
    })
  );

  const onSubmit = handleSubmit((data: FormValues) => {
    const c = data.constraint;
    if (isEditing && constraint) {
      updateMutation.mutate({
        id: constraint.id,
        name: c.name,
        description: c.description,
        enabled: c.enabled,
        type: c.type,
        leftSide: c.leftSide,
        rightSide: c.rightSide,
        quantifiers: c.quantifiers,
      });
    } else {
      createMutation.mutate({
        modelId,
        name: c.name,
        description: c.description,
        enabled: c.enabled,
        type: c.type,
        leftSide: c.leftSide,
        rightSide: c.rightSide,
        quantifiers: c.quantifiers,
      });
    }
  });

  return (
    <Card className="h-full flex flex-col">
      <Form {...form}>
        <form onSubmit={onSubmit} className="h-full flex flex-col space-y-4">
          {/* Basic Information */}
          <CardHeader className="shrink-0">
            <CardTitle>Constraint Editor</CardTitle>
            <CardDescription>
              {constraint
                ? "Update the constraint definition below."
                : "Define a new constraint for your model."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-6">
            <FormField
              control={control}
              name="constraint.enabled"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  </FormControl>
                  <FormLabel>Enabled</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="constraint.name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Constraint Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter constraint name"
                      className={fieldState.error ? "border-red-300" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="constraint.description"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe what this constraint represents"
                      className={fieldState.error ? "border-red-300" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="constraint.type"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Constraint Type</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className={fieldState.error ? "border-red-300" : ""}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eq">Equals (=)</SelectItem>
                        <SelectItem value="leq">
                          Less than or equal (≤)
                        </SelectItem>
                        <SelectItem value="geq">
                          Greater than or equal (≥)
                        </SelectItem>
                        <SelectItem value="lt">Less than ({"<"})</SelectItem>
                        <SelectItem value="gt">
                          Greater than ({">"}){" "}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <QuantifierEditor
              value={quantifierBlock}
              onChange={(val) => setValue("constraint.quantifiers", val)}
              rootPath="constraint.quantifiers"
              form={form}
            />

            {/* Expression Tree Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left Side Expression Tree */}
              <Card className="border gap-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Left Side Expression Tree
                    </CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setValue("constraint.leftSide", createNode("binary"));
                        setSelectedPath("constraint.leftSide");
                        setExpandedPaths(
                          (prev) => new Set([...prev, "constraint.leftSide"])
                        );
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 max-h-80 overflow-y-auto group">
                    <ExpressionTreeView
                      expression={watchedConstraint.leftSide}
                      basePath="constraint.leftSide"
                      selectedPath={selectedPath}
                      expandedPaths={expandedPaths}
                      onSelect={handleNodeSelect}
                      onToggleExpand={handleToggleExpand}
                      errors={errors.constraint?.leftSide as FieldError}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Right Side Expression Tree */}
              <Card className="gap-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Right Side Expression Tree
                    </CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setValue("constraint.rightSide", createNode("binary"));
                        setSelectedPath("constraint.rightSide");
                        setExpandedPaths(
                          (prev) => new Set([...prev, "constraint.rightSide"])
                        );
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1 max-h-80 overflow-y-auto group">
                    <ExpressionTreeView
                      expression={watchedConstraint.rightSide}
                      basePath="constraint.rightSide"
                      selectedPath={selectedPath}
                      expandedPaths={expandedPaths}
                      onSelect={handleNodeSelect}
                      onToggleExpand={handleToggleExpand}
                      errors={errors.constraint?.rightSide as FieldError}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Node Editor */}
            <Card className="gap-2">
              <CardHeader>
                <CardTitle className="text-base">Node Editor</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPath && getSelectedExpression() ? (
                  <ExpressionSelectionEditor<FormValues>
                    rootExpression={
                      selectedPath.startsWith("constraint.leftSide")
                        ? watchedConstraint.leftSide
                        : watchedConstraint.rightSide
                    }
                    rootPath={
                      selectedPath.startsWith("constraint.leftSide")
                        ? "constraint.leftSide"
                        : "constraint.rightSide"
                    }
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
              </CardContent>
            </Card>

            {/* Constraint Preview */}
            <Card className="gap-2">
              <CardHeader>
                <CardTitle className="text-base">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-muted rounded-md">
                  <code className="text-sm font-mono break-all">
                    {getConstraintPreview(watchedConstraint)}
                  </code>
                </div>
              </CardContent>
            </Card>
          </CardContent>
          <CardFooter className="shrink-0 flex justify-end gap-2">
            <Button type="submit" disabled={!isValid}>
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset({ constraint: defaultConstraint });
              }}
            >
              Cancel
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
