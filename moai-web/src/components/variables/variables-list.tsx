"use client";
import {
  Edit2,
  Hash,
  Plus,
  PlusIcon,
  Trash2,
  TrendingDown,
  TrendingUp,
  VariableIcon,
} from "lucide-react";
import Link from "next/link";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreHorizontal, Copy } from "lucide-react";

type Props = { model: ModelWithComponents };

const domainColors = {
  Binary: "bg-blue-100 text-blue-800",
  NonNegativeIntegers: "bg-green-100 text-green-800",
  NonNegativeReals: "bg-purple-100 text-purple-800",
  Reals: "bg-orange-100 text-orange-800",
  Integers: "bg-red-100 text-red-800",
};
export const VariablesPage = ({ model }: Props) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const selected = useMemo(
    () => model.variables.find((v) => v.id === toDeleteId) || null,
    [model.variables, toDeleteId]
  );
  const trpc = useTRPC();
  const qc = useQueryClient();
  const invalidateModel = async () => {
    await Promise.all([
      qc.invalidateQueries(trpc.models.detail.queryFilter({ id: model.id })),
      qc.invalidateQueries(trpc.models.list.queryFilter()),
    ]);
  };

  const deleteMutation = useMutation(
    trpc.variables.delete.mutationOptions({
      onSuccess: async () => {
        toast.success("Variable deleted");
        await invalidateModel();
      },
      onError: (e) =>
        toast.error(
          (e as { message?: string })?.message ?? "Failed to delete variable"
        ),
    })
  );

  const cloneMutation = useMutation(
    trpc.variables.clone.mutationOptions({
      onSuccess: async () => {
        toast.success("Variable cloned");
        await invalidateModel();
      },
      onError: (e) =>
        toast.error(
          (e as { message?: string })?.message ?? "Failed to clone variable"
        ),
    })
  );

  const confirmDelete = () => {
    if (!toDeleteId) return;
    deleteMutation.mutate({ id: toDeleteId });
    setDeleteOpen(false);
    setToDeleteId(null);
  };
  return (
    <div className="flex-1 p-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <VariableIcon className="h-8 w-8 text-primary" />
              Variables
            </h1>
            <p className="text-muted-foreground mt-2">
              Decision variables that the optimization solver will determine
              optimal values for
            </p>
          </div>
          <div className="flex justify-end">
            <Link href={`/models/${model.id}/variables/create`}>
              <Button className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                Create Variable
              </Button>
            </Link>
          </div>
        </div>
      </div>
      {/* Variables List */}
      <div className="space-y-4">
        {model.variables.map((variable) => (
          <Card key={variable.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Hash className="h-5 w-5 text-muted-foreground" />
                    {variable.name}
                    <Badge
                      className={`${
                        domainColors[
                          variable.domain as keyof typeof domainColors
                        ]
                      } border-0`}
                    >
                      {variable.domain}
                    </Badge>
                  </CardTitle>
                  {variable.description && (
                    <CardDescription className="mt-1">
                      {variable.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-1">
                  <Link href={`/models/${model.id}/variables/${variable.id}`}>
                    <Button variant="ghost" size="icon">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          cloneMutation.mutate({ id: variable.id })
                        }
                      >
                        <Copy className="w-4 h-4 mr-2" /> Clone
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setToDeleteId(variable.id);
                          setDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Indices */}
                {variable.indices && variable.indices.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Indices:</div>
                    <div className="flex flex-wrap gap-2">
                      {variable.indices.map((index, i) => (
                        <Badge key={i} variant="secondary">
                          {index}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bounds */}
                <div className="grid grid-cols-2 gap-4">
                  {variable.lowerBound !== undefined && (
                    <div>
                      <div className="text-sm font-medium mb-1 flex items-center gap-1">
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                        Lower Bound
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {variable.lowerBound}
                      </div>
                    </div>
                  )}
                  {variable.upperBound !== undefined && (
                    <div>
                      <div className="text-sm font-medium mb-1 flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        Upper Bound
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {variable.upperBound}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {model.variables.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Hash className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No variables defined</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Variables represent the decision variables in your optimization
              model. Start by adding your first variable.
            </p>
            <Button
              // onClick={handleAddVariable}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Your First Variable
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete variable</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete
              {selected ? (
                <>
                  {" "}
                  <span className="font-medium">{selected.name}</span>
                </>
              ) : (
                <> this variable</>
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

// Fetching wrapper colocated with the page UI to avoid a separate *-client component
export function VariablesSection({ modelId }: { modelId: string }) {
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

  return <VariablesPage model={model} />;
}
