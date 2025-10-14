import { OrganizationOnboarding } from "@/components/auth/organization-onboarding";

export default async function Page() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <OrganizationOnboarding />
    </div>
  );
}
