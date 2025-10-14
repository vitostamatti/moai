import { cookies } from "next/headers";
import { SidebarProvider } from "@/components/ui/sidebar";
import { HydrateClient } from "@/trpc/server";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "false";
  return (
    <HydrateClient>
      <SidebarProvider defaultOpen={!defaultOpen}>{children}</SidebarProvider>
    </HydrateClient>
  );
}
