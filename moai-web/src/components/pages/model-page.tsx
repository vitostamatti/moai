"use client";
import type { ModelWithComponents } from "@/db/types";
import React from "react";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Activity,
  BarChart3,
  ChevronRight,
  Clock,
  Edit3,
  Eye,
  FileText,
  TrendingUp,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import Link from "next/link";
import { format } from "date-fns";

type Props = { model: ModelWithComponents };
// Mock data for recent runs and activity
const recentRuns = [
  {
    id: "run-001",
    status: "optimal",
    objectiveValue: 153.675,
    runtime: "0.8s",
    timestamp: new Date("2024-01-20T10:30:00"),
  },
  {
    id: "run-002",
    status: "optimal",
    objectiveValue: 153.675,
    runtime: "1.2s",
    timestamp: new Date("2024-01-19T15:45:00"),
  },
  {
    id: "run-003",
    status: "infeasible",
    objectiveValue: null,
    runtime: "0.3s",
    timestamp: new Date("2024-01-19T14:20:00"),
  },
];

export const ModelPage = ({ model }: Props) => {
  // Simple items for component summary
  const modelId = model.id;
  const componentSummaryItems = [
    {
      name: "Sets",
      href: `/models/${modelId}/sets`,
      count: model.sets.length,
    },
    {
      name: "Parameters",
      href: `/models/${modelId}/parameters`,
      count: model.parameters.length,
    },
    {
      name: "Variables",
      href: `/models/${modelId}/variables`,
      count: model.variables.length,
    },
    {
      name: "Constraints",
      href: `/models/${modelId}/constraints`,
      count: model.constraints.length,
    },
    {
      name: "Objective",
      href: `/models/${modelId}/objective`,
      status:
        model.objectives.find((o) => o.enabled) ?? model.objectives[0]
          ? (model.objectives.find((o) => o.enabled) ?? model.objectives[0])!
              .type
          : "none",
    },
  ];
  return (
    <div className="flex-1 p-4">
      {/* Model Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">{model.name}</h1>
            <p className="text-muted-foreground mt-2">{model.description}</p>
          </div>
          <Badge variant="outline">Version {model.version ?? 1}</Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            Author: {model.user?.name ?? model.user?.email ?? "Unknown"}
          </span>
          <span>•</span>

          <span>Created: {format(model.createdAt, "MM/dd/yyyy")}</span>
          <span>•</span>
          <span>Updated: {format(model.updatedAt, "MM/dd/yyyy")}</span>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Model Statistics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Model Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Sets</span>
              <span className="text-sm font-medium">{model.sets.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Parameters</span>
              <span className="text-sm font-medium">
                {model.parameters.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Variables</span>
              <span className="text-sm font-medium">
                {model.variables.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Constraints</span>
              <span className="text-sm font-medium">
                {model.constraints.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Objective</span>
              <span className="text-sm font-medium">
                {model.objectives.find((o) => o.enabled) ?? model.objectives[0]
                  ? (model.objectives.find((o) => o.enabled) ??
                      model.objectives[0])!.type
                  : "None"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Run */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Latest Run
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentRuns[0] && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    variant={
                      recentRuns[0].status === "optimal"
                        ? "default"
                        : "destructive"
                    }
                    className="text-xs"
                  >
                    {recentRuns[0].status}
                  </Badge>
                </div>
                {recentRuns[0].objectiveValue && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Objective Value
                    </span>
                    <span className="text-sm font-medium">
                      {recentRuns[0].objectiveValue}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Runtime</span>
                  <span className="text-sm font-medium">
                    {recentRuns[0].runtime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Run Time
                  </span>
                  <span className="text-sm font-medium">
                    {format(recentRuns[0].timestamp, "MM/dd/yyyy hh:mm:ss")}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Edit Model
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <Eye className="h-4 w-4" />
              View Results
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <FileText className="h-4 w-4" />
              Export Model
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <Clock className="h-4 w-4" />
              Run History
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Model Components Overview */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Recent Runs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Runs</CardTitle>
            <CardDescription>
              Latest optimization runs for this model
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Objective</TableHead>
                  <TableHead>Runtime</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell>
                      <Badge
                        variant={
                          run.status === "optimal" ? "default" : "destructive"
                        }
                        className="text-xs"
                      >
                        {run.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {run.objectiveValue ? run.objectiveValue.toFixed(3) : "—"}
                    </TableCell>
                    <TableCell>{run.runtime}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(run.timestamp, "MM/dd/yyyy hh:mm:ss")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Component Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Component Summary</CardTitle>
            <CardDescription>
              Overview of model components with quick navigation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {componentSummaryItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.name === "Sets" &&
                        `${item.count} index sets defined`}
                      {item.name === "Parameters" &&
                        `${item.count} input parameters`}
                      {item.name === "Variables" &&
                        `${item.count} decision variables`}
                      {item.name === "Constraints" &&
                        `${item.count} constraints defined`}
                      {item.name === "Objective" &&
                        (model.objectives.find((o) => o.enabled) ??
                        model.objectives[0]
                          ? `${
                              (model.objectives.find((o) => o.enabled) ??
                                model.objectives[0])!.type
                            } objective`
                          : "No objective set")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.count !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      {item.count}
                    </Badge>
                  )}
                  {item.status && (
                    <Badge variant="outline" className="text-xs">
                      {item.status}
                    </Badge>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export function ModelOverviewSection({ modelId }: { modelId: string }) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.models.detail.queryOptions({ id: modelId })
  );

  const model = {
    ...data.model,
    user: data.model.user,
    sets: data.sets,
    parameters: data.parameters,
    variables: data.variables,
    constraints: data.constraints,
    objectives: data.objectives,
  } satisfies ModelWithComponents;

  return <ModelPage model={model} />;
}
