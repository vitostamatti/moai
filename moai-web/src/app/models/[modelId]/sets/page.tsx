import { notFound } from "next/navigation";
import { trpc, caller, HydrateClient } from "@/trpc/server";
import { ModelShellClient } from "@/components/layout/model-shell";
import { SetsSection } from "@/components/sets/sets-list";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { SetsPageSkeleton } from "@/components/sets/sets-skeleton";
import { SetsPageError } from "@/components/sets/sets-error";

interface SetsPageProps {
  params: Promise<{
    modelId: string;
  }>;
}

export default async function Page({ params }: SetsPageProps) {
  const { modelId } = await params;
  await trpc.models.detail.prefetch({ id: modelId });
  await trpc.models.list.prefetch();
  const model = await caller.models.detail({ id: modelId }).catch(() => null);
  if (!model) return notFound();
  const breadcrumbs = [
    { url: `/models/${model.model.id}`, label: model.model.name },
    { url: `/models/${model.model.id}/sets`, label: "Sets" },
  ];

  return (
    <HydrateClient>
      <ModelShellClient modelId={modelId} breadcrumbs={breadcrumbs}>
        <ErrorBoundary fallback={<SetsPageError />}>
          <Suspense fallback={<SetsPageSkeleton />}>
            <SetsSection modelId={modelId} />
          </Suspense>
        </ErrorBoundary>
      </ModelShellClient>
    </HydrateClient>
  );
}
