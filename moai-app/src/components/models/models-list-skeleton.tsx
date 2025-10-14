"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ModelsListSkeleton() {
  return (
    <ul className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="p-3 border rounded-md">
          <Skeleton className="h-4 w-40 mb-2" />
          <Skeleton className="h-3 w-64" />
        </li>
      ))}
    </ul>
  );
}
