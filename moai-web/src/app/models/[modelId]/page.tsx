import { notFound, redirect } from "next/navigation";
import { trpc, caller, HydrateClient } from "@/trpc/server";
import { ModelOverviewSection } from "@/components/pages/model-page";
import { ModelShellClient } from "@/components/layout/model-shell";
import { getActiveOrganization } from "@/lib/auth";

interface ModelPageProps {
  params: Promise<{
    modelId: string;
  }>;
}

export default async function Page({ params }: ModelPageProps) {
  const organization = await getActiveOrganization();
  if (!organization) {
    redirect("/organization");
  }
  const { modelId } = await params;
  // Prefetch model detail and org-scoped model list for sidebar
  await trpc.models.list.prefetch();
  await trpc.models.detail.prefetch({ id: modelId });

  // Validate the model exists (use server caller so 404s are respected)
  const model = await caller.models.detail({ id: modelId }).catch(() => null);
  if (!model) return notFound();
  const breadcrumbs = [
    { url: `/models/${model.model.id}`, label: model.model.name },
  ];

  return (
    <HydrateClient>
      <ModelShellClient modelId={modelId} breadcrumbs={breadcrumbs}>
        <ModelOverviewSection modelId={modelId} />
      </ModelShellClient>
    </HydrateClient>
  );
}
