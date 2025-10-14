import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { Session } from "@/lib/auth-types";

import { cache } from "react";

export type TRPCContext = {
  session: Session | null;
  organizationId: string | null;
};

export const createTRPCContext = cache(async (): Promise<TRPCContext> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const organization = await auth.api.getFullOrganization({
    headers: await headers(),
  });

  return { session: session ?? null, organizationId: organization?.id ?? null };
});

// export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
