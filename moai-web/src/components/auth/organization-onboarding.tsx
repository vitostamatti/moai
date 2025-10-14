"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  organization,
  useListOrganizations,
  useSession,
} from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Building2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export function OrganizationOnboarding() {
  const router = useRouter();
  const { data: session } = useSession();
  const orgs = useListOrganizations();

  // Existing org selection
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");

  // Create org form
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [activating, setActivating] = useState(false);

  // Generate slug automatically from name unless user edits slug manually
  useEffect(() => {
    if (!isSlugEdited) {
      const s = name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      setSlug(s);
    }
  }, [name, isSlugEdited]);

  const hasOrgs = useMemo(() => (orgs.data?.length ?? 0) > 0, [orgs.data]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const setActiveAndEnter = async (organizationId: string) => {
    try {
      setActivating(true);
      await organization.setActive({ organizationId });
      router.push("/models");
    } catch (e: unknown) {
      const message = (e as { error?: { message?: string } })?.error?.message;
      toast.error(message ?? "Failed to set active organization");
    } finally {
      setActivating(false);
    }
  };

  const createOrg = async () => {
    if (!name || !slug) {
      toast.error("Please enter a name and slug");
      return;
    }
    try {
      setCreating(true);
      const checkResult = await organization.checkSlug(
        { slug },
        {
          onError: (err) => {
            toast.error(err.error.message);
          },
        }
      );
      if (!checkResult) {
        toast.error("Organization with this slug already exists");
        return;
      }
      const result = await organization.create(
        { name, slug, logo: logo || undefined },
        {
          onError: (err) => {
            toast.error(err.error.message);
          },
        }
      );
      const newId = result?.data?.id;
      if (newId) {
        await setActiveAndEnter(newId);
        toast.success("Organization created");
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center py-10">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/10 text-primary rounded-lg p-2 w-fit">
            <Building2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Choose your workspace</CardTitle>
          <CardDescription>
            {session?.user?.name ? `${session.user.name}, ` : ""}create a new
            organization or pick one you belong to.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {hasOrgs && (
            <div className="space-y-3">
              <Label>Your organizations</Label>
              <div className="flex gap-2">
                <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {orgs.data?.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  disabled={!selectedOrgId || activating}
                  onClick={() =>
                    selectedOrgId && setActiveAndEnter(selectedOrgId)
                  }
                >
                  {activating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              Or create a new organization
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Organization name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Acme Inc"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setIsSlugEdited(true);
                  }}
                  placeholder="acme"
                />
              </div>
              <div className="space-y-2">
                <Label>Logo (optional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                {logo && (
                  <div className="mt-2">
                    <Image
                      src={logo}
                      alt="Logo preview"
                      className="w-16 h-16 object-cover"
                      width={64}
                      height={64}
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <Button onClick={createOrg} disabled={creating}>
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create & continue"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
