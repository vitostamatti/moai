import { notFound } from "next/navigation";
import { trpc, caller, HydrateClient } from "@/trpc/server";
import { ModelShellClient } from "@/components/layout/model-shell";
import { ParametersSection } from "@/components/pages/params-page";

interface ParametersPageProps {
  params: Promise<{
    modelId: string;
  }>;
}

export default async function Page({ params }: ParametersPageProps) {
  const { modelId } = await params;
  await trpc.models.detail.prefetch({ id: modelId });
  await trpc.models.list.prefetch();
  const model = await caller.models.detail({ id: modelId }).catch(() => null);
  if (!model) return notFound();
  const breadcrumbs = [
    { url: `/models/${model.model.id}`, label: model.model.name },
    { url: `/models/${model.model.id}/parameters`, label: "Parameters" },
  ];
  return (
    <HydrateClient>
      <ModelShellClient modelId={modelId} breadcrumbs={breadcrumbs}>
        <ParametersSection modelId={modelId} />
      </ModelShellClient>
    </HydrateClient>
  );
}
