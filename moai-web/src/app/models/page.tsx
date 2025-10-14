import Link from "next/link";
import { MoaiIcon } from "@/components/icons";
import { getActiveOrganization, getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ModelsList } from "@/components/models/models-list";
import { ModelsListSkeleton } from "@/components/models/models-list-skeleton";
import { ModelsListError } from "@/components/models/models-list-error";
import { UserAvatar } from "@/components/user/user-avatar";
import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ModelsHeader } from "@/components/models/models-header";
import { CreateModelDialog } from "@/components/models/create-model-dialog";

export default async function Page() {
  const { user } = await getSession();
  const organization = await getActiveOrganization();
  if (!organization) {
    redirect("/organization");
  }
  // Always prefetch organization models; the router assumes org context.
  trpc.models.list.prefetch();
  return (
    <HydrateClient>
      <div className="min-h-screen w-full bg-background">
        {/* Navigation */}
        <nav className="border-b">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <MoaiIcon className="size-6 text-primary" />
              <span className="text-xl font-bold">MOAI</span>
            </Link>
            <div className="flex items-center space-x-2">
              <UserAvatar
                name={user?.name}
                email={user?.email}
                image={user?.image as string | undefined}
              />
            </div>
          </div>
        </nav>

        {/* Header */}
        <div className="container mx-auto px-4 py-8">
          <ModelsHeader />

          <ErrorBoundary fallback={<ModelsListError />}>
            <Suspense fallback={<ModelsListSkeleton />}>
              <ModelsList />
            </Suspense>
          </ErrorBoundary>
          <CreateModelDialog />
        </div>
      </div>
    </HydrateClient>
  );
}
