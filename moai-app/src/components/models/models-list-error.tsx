"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";

export function ModelsListError() {
  const router = useRouter();
  return (
    <Alert variant="destructive" className="max-w-xl">
      <TriangleAlert />
      <AlertTitle>Failed to load models</AlertTitle>
      <AlertDescription>
        <p className="mb-2">{"An unexpected error occurred."}</p>
        <button
          onClick={() => router.refresh()}
          className="inline-flex items-center rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-background"
        >
          Try again
        </button>
      </AlertDescription>
    </Alert>
  );
}
