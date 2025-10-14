"use client";
import { Edit2, Target, Trash2, TrendingDown, TrendingUp } from "lucide-react";

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
import { getObjectivePreview } from "@/lib/editor/objective/objective-utills";
import type { ObjectiveDefinition } from "@/lib/editor/objective/objective-schema";
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
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

const objectiveTypeIcons = {
  minimize: TrendingDown,
  maximize: TrendingUp,
};

const objectiveTypeColors = {
  minimize: "bg-red-100 text-red-800",
  maximize: "bg-green-100 text-green-800",
};

type Props = { model: ModelWithComponents };
export const ObjectivePage = ({ model }: Props) => {
  const activeObjective = useMemo(
    () => model.objectives.find((o) => o.enabled) ?? model.objectives[0],
    [model.objectives]
  );
  const Icon = activeObjective
    ? objectiveTypeIcons[activeObjective.type]
    : Target;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const confirmDelete = () => {
    // TODO: wire to TRPC delete
    toast.success("Objective deleted");
    setDeleteOpen(false);
  };
  return (
    <div className="flex-1 p-4 space-y-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Target className="h-8 w-8 text-primary" />
              Objective Function
            </h1>
            <p className="text-muted-foreground mt-2">
              Define what you want to optimize - minimize costs or maximize
              profits
            </p>
          </div>
        </div>
      </div>
      {/* Objective Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-muted-foreground" />
                Objective Function
                {activeObjective && (
                  <Badge
                    className={`${
                      objectiveTypeColors[activeObjective.type]
                    } border-0 flex items-center gap-1`}
                  >
                    <Icon className="h-3 w-3" />
                    {activeObjective.type === "minimize"
                      ? "Minimize"
                      : "Maximize"}
                  </Badge>
                )}
              </CardTitle>
              {activeObjective?.description && (
                <CardDescription className="mt-1">
                  {activeObjective.description}
                </CardDescription>
              )}
            </div>
            <div className="flex gap-2">
              {activeObjective && (
                <Link
                  href={`/models/${model.id}/objective/${activeObjective.id}`}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    // onClick={() => handleEditParameter(param.id)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Objective Expression */}
            <div>
              <div className="text-sm font-medium mb-2">Expression:</div>
              {activeObjective ? (
                <div className="p-3 bg-muted/50 rounded-md font-mono text-sm">
                  <code className="text-lg font-mono break-all">
                    {getObjectivePreview(
                      activeObjective as unknown as ObjectiveDefinition
                    )}
                  </code>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No objective defined
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State - This would only show if no objective is defined */}
      {!activeObjective && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No objective defined</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              The objective function defines what you want to optimize. Set a
              goal to minimize costs or maximize profits.
            </p>
            <Link href={`/models/${model.id}/parameters/create`}>
              <Button className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Define Objective
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete objective</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the current objective? This action
              cannot be undone.
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

export function ObjectiveSection({ modelId }: { modelId: string }) {
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

  return <ObjectivePage model={model} />;
}
