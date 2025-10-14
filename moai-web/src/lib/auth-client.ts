import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
export const authClient = createAuthClient({
  plugins: [organizationClient()],
  /** The base URL of the server (optional if you're using the same domain) */
  // baseURL: "http://localhost:3000",
});
// export {organization,
// useListOrganizations,
// useSession} =
export const {
  signUp,
  signIn,
  signOut,
  useSession,
  organization,
  useListOrganizations,
  useActiveOrganization,
} = authClient;
