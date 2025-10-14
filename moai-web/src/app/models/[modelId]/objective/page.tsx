import { notFound } from "next/navigation";
import { HydrateClient, trpc, caller } from "@/trpc/server";
import { ModelShellClient } from "@/components/layout/model-shell";
import { ObjectiveSection } from "@/components/pages/objective-page";

interface ObjectivePageProps {
  params: Promise<{
    modelId: string;
  }>;
}

export default async function Page({ params }: ObjectivePageProps) {
  const { modelId } = await params;
  await trpc.models.detail.prefetch({ id: modelId });
  await trpc.models.list.prefetch();
  const model = await caller.models.detail({ id: modelId }).catch(() => null);
  if (!model) return notFound();
  const breadcrumbs = [
    { url: `/models/${model.model.id}`, label: model.model.name },
    { url: `/models/${model.model.id}/objective`, label: "Objective" },
  ];
  return (
    <HydrateClient>
      <ModelShellClient modelId={modelId} breadcrumbs={breadcrumbs}>
        <ObjectiveSection modelId={modelId} />
      </ModelShellClient>
    </HydrateClient>
  );
}
