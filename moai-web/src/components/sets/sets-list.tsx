"use client";
import { Database, Edit2, Plus, Trash2 } from "lucide-react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React, { useMemo, useState } from "react";
import type { ModelWithComponents } from "@/db/types";
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
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

type Props = { model: ModelWithComponents };
export const SetsPage = ({ model }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const deleteSetMutation = useMutation(trpc.sets.delete.mutationOptions());
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const selected = useMemo(
    () => model.sets.find((s) => s.id === toDeleteId) || null,
    [model.sets, toDeleteId]
  );
  const confirmDelete = () => {
    if (!toDeleteId) return;
    deleteSetMutation.mutate(
      { id: toDeleteId },
      {
        onSuccess: () => {
          toast.success("Set deleted");
          setDeleteOpen(false);
          setToDeleteId(null);
          queryClient.invalidateQueries(
            trpc.models.detail.queryOptions({ id: model.id })
          );
        },
      }
    );
  };
  return (
    <div className="flex-1 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8 text-primary" />
            Sets
          </h1>
          <p className="text-muted-foreground mt-2">
            Define the domains and index sets for your optimization model
          </p>
        </div>
        <div className="flex justify-end">
          <Link href={`/models/${model.id}/sets/create`}>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Set
            </Button>
          </Link>
        </div>
      </div>

      {/* Sets List */}
      <div className="space-y-4">
        {model.sets.map((set) => (
          <Card key={set.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {set.name}
                    {set.isDraft && <Badge>Draft</Badge>}

                    <Badge variant="outline">
                      {set.elements.length} elements
                    </Badge>
                  </CardTitle>
                  {set.description && (
                    <CardDescription className="mt-1">
                      {set.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/models/${model.id}/sets/${set.id}`}>
                    <Button
                      variant={"ghost"}
                      className="flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setToDeleteId(set.id);
                      setDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  Elements ({set.elements.length}):
                </div>
                <div className="flex flex-wrap gap-2">
                  {set.elements.map((element, index) => (
                    <Badge key={index} variant="secondary">
                      {String(element)}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {model.sets.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No sets defined</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Sets define the domains for your variables and parameters. Start
              by adding your first set.
            </p>
            <Button
              // onClick={handleCreateSet}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Your First Set
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete set</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete
              {selected ? (
                <>
                  {" "}
                  <span className="font-medium">{selected.name}</span>
                </>
              ) : (
                <> this set</>
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

export function SetsSection({ modelId }: { modelId: string }) {
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

  return <SetsPage model={model} />;
}
