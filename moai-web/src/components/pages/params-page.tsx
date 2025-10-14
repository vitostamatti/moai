"use client";
import { BarChart3, Edit2, Hash, Plus, Trash2 } from "lucide-react";
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
import type { ParamValues } from "@/lib/editor/param/param-schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import Link from "next/link";
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
import { useSuspenseQuery } from "@tanstack/react-query";

type Props = { model: ModelWithComponents };

export const ParametersPage = ({ model }: Props) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const selected = useMemo(
    () => model.parameters.find((p) => p.id === toDeleteId) || null,
    [model.parameters, toDeleteId]
  );
  const confirmDelete = () => {
    // TODO: wire to TRPC delete
    toast.success("Parameter deleted");
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
              <BarChart3 className="h-8 w-8 text-primary" />
              Parameters
            </h1>
            <p className="text-muted-foreground mt-2">
              Input data and constants for your optimization model
            </p>
          </div>
          <div className="flex justify-end">
            <Link href={`/models/${model.id}/parameters/create`}>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Parameter
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Parameters List */}
      <div className="space-y-4">
        {model.parameters.map((param) => (
          <Card key={param.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Hash className="h-5 w-5 text-muted-foreground" />
                    {param.name}
                  </CardTitle>
                  {param.description && (
                    <CardDescription className="mt-1">
                      {param.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/models/${model.id}/parameters/${param.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      // onClick={() => handleEditParameter(param.id)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setToDeleteId(param.id);
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
                {/* Indices */}
                {param.indices && param.indices.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Indices:</div>
                    <div className="flex flex-wrap gap-2">
                      {param.indices.map((index, i) => (
                        <Badge key={i} variant="secondary">
                          {index}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {renderParameterValues(param)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {model.parameters.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No parameters defined</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Parameters store data values that your model uses. Start by adding
              your first parameter.
            </p>
            <Link href={`/models/${model.id}/parameters/create`}>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Parameter
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete parameter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete
              {selected ? (
                <>
                  {" "}
                  <span className="font-medium">{selected.name}</span>
                </>
              ) : (
                <> this parameter</>
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

export function ParametersSection({ modelId }: { modelId: string }) {
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

  return <ParametersPage model={model} />;
}

const renderParameterValues = (param: {
  indices: string[] | null;
  values: ParamValues;
}) => {
  if (typeof param.values === "number" || typeof param.values === "string") {
    return (
      <div className="text-sm">
        <span className="font-medium">Value:</span> {param.values}
      </div>
    );
  }

  if (Array.isArray(param.values)) {
    // If parameter has indices, show tabular format
    if (param.indices && param.indices.length > 0) {
      return (
        <div className="space-y-2">
          <div className="text-sm font-medium">
            Values ({param.values.length}):
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  {param.indices.map((indexName, idx) => (
                    <TableHead key={idx} className="text-xs font-medium">
                      {indexName}
                    </TableHead>
                  ))}
                  <TableHead className="text-xs font-medium">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {param.values.slice(0, 3).map(
                  (
                    value: {
                      index: (string | number)[];
                      value: number | string;
                    },
                    index: number
                  ) => (
                    <TableRow key={index}>
                      {value.index.map(
                        (indexVal: string | number, idx: number) => (
                          <TableCell key={idx} className="text-sm py-1">
                            {indexVal}
                          </TableCell>
                        )
                      )}
                      <TableCell className="text-sm py-1 font-mono">
                        {value.value}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
            {param.values.length > 5 && (
              <div className="px-3 py-2 text-xs text-muted-foreground border-t">
                ... and {param.values.length - 3} more values
              </div>
            )}
          </div>
        </div>
      );
    } else {
      // Fallback to old format if no indices
      return (
        <div className="space-y-2">
          <div className="text-sm font-medium">
            Values ({param.values.length}):
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {param.values.map((value, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="text-xs">
                  [{value.index.join(", ")}]
                </Badge>
                <span>{value.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
  }

  return null;
};
