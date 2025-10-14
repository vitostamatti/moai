import "server-only"; // <-- ensure this file cannot be imported from the client
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";
import { createCallerFactory } from "./init";
import { createTRPCContext } from "./context";
import { makeQueryClient } from "./query-client";
import { type AppRouter, appRouter } from "./routers/_app";

export const getQueryClient = cache(makeQueryClient);
export const caller = createCallerFactory(appRouter)(createTRPCContext);
export const { trpc, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient
);
