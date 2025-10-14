import { notFound } from "next/navigation";
import { trpc, caller } from "@/trpc/server";
import { ModelShellClient } from "@/components/layout/model-shell";
import { VariablesSection } from "@/components/variables/variables-list";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { VariablesPageSkeleton } from "@/components/variables/variables-skeleton";
import { VariablesPageError } from "@/components/variables/variables-error";

interface VariablesPageProps {
  params: Promise<{
    modelId: string;
  }>;
}

export default async function Page({ params }: VariablesPageProps) {
  const { modelId } = await params;
  await trpc.models.detail.prefetch({ id: modelId });
  await trpc.models.list.prefetch();
  const model = await caller.models.detail({ id: modelId }).catch(() => null);
  if (!model) return notFound();
  const breadcrumbs = [
    { url: `/models/${model.model.id}`, label: model.model.name },
    { url: `/models/${model.model.id}/variables`, label: "Variables" },
  ];

  return (
    <ModelShellClient modelId={modelId} breadcrumbs={breadcrumbs}>
      <ErrorBoundary fallback={<VariablesPageError />}>
        <Suspense fallback={<VariablesPageSkeleton />}>
          <VariablesSection modelId={modelId} />
        </Suspense>
      </ErrorBoundary>
    </ModelShellClient>
  );
}
