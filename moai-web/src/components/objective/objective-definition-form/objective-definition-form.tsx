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
import { TrendingDown, TrendingUp } from "lucide-react";

import {
  objectiveDefinitionSchema,
  ObjectiveDefinition,
} from "@/lib/editor/objective/objective-schema";
import type { Expression } from "@/lib/editor/expression/core/types";
import type { ObjectiveSelect } from "@/db/schema";
import { createNode, getNodeDisplayText } from "@/lib/editor/expression/utils";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
// import { ExpressionPath } from "@/lib/editor/expression/utils/form-utils";

import { ExpressionTreeView } from "@/components/expression/expression-tree";
import { ExpressionSelectionEditor } from "@/components/expression/expression-selection-editor";
import {
  expressionTypeHasChildren,
  useExpressionTreeState,
} from "@/components/expression/hooks/useExpressionTreeState";

type FormValues = { objective: ObjectiveDefinition };

const formSchema: z.ZodType<FormValues, FormValues> = z.object({
  objective: objectiveDefinitionSchema,
});

type Props = {
  modelId?: string;
  objective?: ObjectiveSelect;
};
export function ObjectiveDefinitionForm(props: Props) {
  const { objective } = props;

  const defaultValues: ObjectiveDefinition = objective
    ? {
        id: objective.id,
        name: objective.name,
        description: objective.description ?? undefined,
        enabled: objective.enabled ?? true,
        type: objective.type,
        expression: objective.expression,
      }
    : {
        id: `objective-${Date.now()}`,
        name: "",
        description: "",
        enabled: true,
        type: "minimize",
        expression: createNode("var"),
      };
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "all",
    defaultValues: {
      objective: defaultValues,
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = form;

  // Watch objective values for preview
  const watchedObjective = watch("objective");

  // Shared tree view state management (after watch so it's defined)
  const {
    selectedPath,
    expandedPaths,
    selectPath: handleNodeSelect,
    toggleExpand: handleToggleExpand,
    setExpandedPaths,
  } = useExpressionTreeState({
    rootObject: watchedObjective,
    rootKey: "objective",
    initialSelectedPath: "objective.expression",
    initialExpandedPaths: ["objective.expression"],
  });

  // Type changes are handled inside ExpressionSelectionEditor; we only expand if the new type has children via onAfterTypeChange

  // Get the currently selected expression
  const getSelectedExpression = (): Expression | null => {
    if (!selectedPath) return null;

    const pathParts = selectedPath.split(".");
    if (pathParts[0] !== "objective") return null;

    let current: unknown = watchedObjective;
    for (let i = 1; i < pathParts.length; i++) {
      if (current && typeof current === "object" && pathParts[i] in current) {
        current = (current as Record<string, unknown>)[pathParts[i]];
      } else {
        return null;
      }
    }

    return current as Expression;
  };

  // Objective preview
  const getObjectivePreview = (): string => {
    try {
      const expression = getNodeDisplayText(watchedObjective.expression);
      const type =
        watchedObjective.type === "minimize" ? "minimize" : "maximize";
      return `${type} ${expression}`;
    } catch {
      return "Invalid objective structure";
    }
  };

  // Form submission
  const trpc = useTRPC();
  const qc = useQueryClient();

  const invalidateModelCaches = async () => {
    if (!props.modelId) return;
    await Promise.all([
      qc.invalidateQueries(
        trpc.models.detail.queryFilter({ id: props.modelId })
      ),
      qc.invalidateQueries(trpc.models.list.queryFilter()),
    ]);
  };

  const createMutation = useMutation(
    trpc.objectives.create.mutationOptions({
      onSuccess: async () => {
        toast.success("Objective created");
        await invalidateModelCaches();
      },
      onError: (e) =>
        toast.error(
          (e as { message?: string })?.message ?? "Failed to create objective"
        ),
    })
  );

  const updateMutation = useMutation(
    trpc.objectives.update.mutationOptions({
      onSuccess: async () => {
        toast.success("Objective updated");
        await invalidateModelCaches();
      },
      onError: (e) =>
        toast.error(
          (e as { message?: string })?.message ?? "Failed to update objective"
        ),
    })
  );

  const onSubmit = handleSubmit((data: FormValues) => {
    const o = data.objective;
    if (objective) {
      updateMutation.mutate({
        id: objective.id,
        name: o.name,
        description: o.description,
        enabled: o.enabled,
        type: o.type,
        expression: o.expression,
      });
    } else {
      if (!props.modelId) {
        toast.error("Missing modelId");
        return;
      }
      createMutation.mutate({
        modelId: props.modelId,
        name: o.name,
        description: o.description,
        enabled: o.enabled,
        type: o.type,
        expression: o.expression,
      });
    }
  });

  return (
    <Card className="h-full flex flex-col">
      <Form {...form}>
        <form onSubmit={onSubmit} className="h-full flex flex-col space-y-4">
          {/* Basic Information */}
          <CardHeader className="shrink-0">
            <CardTitle>Objective Editor</CardTitle>
            <CardDescription>
              {objective
                ? "Update the objective definition below."
                : "Define a new objective for your model."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-6">
            <FormField
              control={control}
              name="objective.enabled"
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
              name="objective.name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Objective Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter objective name"
                      className={fieldState.error ? "border-red-300" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="objective.description"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe what this objective represents"
                      className={fieldState.error ? "border-red-300" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="objective.type"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Optimization Goal</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className={fieldState.error ? "border-red-300" : ""}
                      >
                        <SelectValue placeholder="Select optimization goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimize">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4" />
                            Minimize
                          </div>
                        </SelectItem>
                        <SelectItem value="maximize">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Maximize
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expression Tree Editor */}
            <Card className="">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Objective Expression</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    Click on nodes to edit them
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-96 overflow-y-auto group">
                  <ExpressionTreeView
                    expression={watchedObjective.expression}
                    basePath="objective.expression"
                    selectedPath={selectedPath}
                    expandedPaths={expandedPaths}
                    onSelect={handleNodeSelect}
                    onToggleExpand={handleToggleExpand}
                    errors={errors.objective?.expression as FieldError}
                  />
                </div>
              </CardContent>
            </Card>
            {/* Node Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Node Editor</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPath?.startsWith("objective.expression") &&
                getSelectedExpression() ? (
                  <ExpressionSelectionEditor<FormValues>
                    rootExpression={watchedObjective.expression}
                    rootPath="objective.expression"
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
                  <div className="text-center py-8 text-muted-foreground">
                    Select a node in the expression tree above to edit it
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Objective Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Objective Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-md">
                  <code className="text-sm font-mono break-all">
                    {getObjectivePreview()}
                  </code>
                </div>
              </CardContent>
            </Card>
          </CardContent>
          <CardFooter>
            {/* Form Actions */}
            <div className="flex gap-4">
              <Button type="submit" disabled={!isValid}>
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset({ objective: defaultValues });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
