"use client";
import { CheckSquare, Edit2, Plus, Shield, Trash2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Button } from "../ui/button";
import type { ModelWithComponents } from "@/db/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { getConstraintPreview } from "@/lib/editor/constraint/constraint-utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

type Props = { model: ModelWithComponents };

export const ConstraintsPage = ({ model }: Props) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);

  const selected = useMemo(
    () => model.constraints.find((c) => c.id === toDeleteId) || null,
    [model.constraints, toDeleteId]
  );

  const confirmDelete = () => {
    // TODO: wire to TRPC delete when backend is connected
    toast.success("Constraint deleted");
    setDeleteOpen(false);
    setToDeleteId(null);
  };

  return (
    <div className="flex-1 p-4 space-y-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CheckSquare className="h-8 w-8 text-primary" />
              Constraints
            </h1>
            <p className="text-muted-foreground mt-2">
              Rules and limitations that your optimization model must satisfy
            </p>
          </div>
          <div className="flex justify-end">
            <Link href={`/models/${model.id}/constraints/create`}>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Constraint
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Constraints List */}
      <div className="space-y-4">
        {model.constraints.map((constraint) => {
          return (
            <Card key={constraint.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      {constraint.name}
                    </CardTitle>
                    {constraint.description && (
                      <CardDescription className="mt-1">
                        {constraint.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/models/${model.id}/constraints/${constraint.id}`}
                    >
                      <Button variant="ghost" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setToDeleteId(constraint.id);
                        setDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Constraint Expression */}
                  <div>
                    <div className="text-sm font-medium mb-2">Expression:</div>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md font-mono text-sm">
                      <code className="text-lg font-mono break-all">
                        {getConstraintPreview({
                          ...constraint,
                          description: constraint.description ?? undefined,
                          quantifiers: constraint.quantifiers ?? undefined,
                        })}
                      </code>
                    </div>
                  </div>

                  {/* Quantifiers */}
                  {constraint.quantifiers?.bindings &&
                    constraint.quantifiers.bindings.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2">
                          Quantifiers:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {constraint.quantifiers.bindings.map((binding, i) => (
                            <Badge key={i} variant="secondary">
                              {binding.index} ∈ {binding.over}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {model.constraints.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No constraints defined</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Constraints define the rules and limitations that your
              optimization model must satisfy. Start by adding your first
              constraint.
            </p>
            <Button
              // onClick={handleAddConstraint}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Your First Constraint
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete constraint</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete
              {selected ? (
                <>
                  {" "}
                  <span className="font-medium">{selected.name}</span>
                </>
              ) : (
                <> this constraint</>
              )}
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export function ConstraintsSection({ modelId }: { modelId: string }) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.models.detail.queryOptions({ id: modelId })
  );

  const model = {
    ...data.model,
    sets: data.sets,
    parameters: data.parameters,
    variables: data.variables,
    constraints: data.constraints,
    objectives: data.objectives,
  } satisfies ModelWithComponents;

  return <ConstraintsPage model={model} />;
}
