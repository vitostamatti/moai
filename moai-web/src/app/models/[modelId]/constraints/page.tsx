import { notFound } from "next/navigation";
import { trpc, caller, HydrateClient } from "@/trpc/server";
import { ModelShellClient } from "@/components/layout/model-shell";
import { ConstraintsSection } from "@/components/pages/constraints-page";

interface ConstraintsPageProps {
  params: Promise<{
    modelId: string;
  }>;
}

export default async function Page({ params }: ConstraintsPageProps) {
  const { modelId } = await params;
  await trpc.models.detail.prefetch({ id: modelId });
  await trpc.models.list.prefetch();
  const model = await caller.models.detail({ id: modelId }).catch(() => null);
  if (!model) return notFound();
  const breadcrumbs = [
    { url: `/models/${model.model.id}`, label: model.model.name },
    { url: `/models/${model.model.id}/constraints`, label: "Constraints" },
  ];
  return (
    <HydrateClient>
      <ModelShellClient modelId={modelId} breadcrumbs={breadcrumbs}>
        <ConstraintsSection modelId={modelId} />
      </ModelShellClient>
    </HydrateClient>
  );
}
