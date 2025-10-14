import Link from "next/link";
import { MoaiIcon } from "@/components/icons";

export interface Breadcrumbs {
  url: string;
  label: string;
}
interface ModelNavProps {
  breadcrumbs: Breadcrumbs[];
}

export function ModelNav({ breadcrumbs }: ModelNavProps) {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center space-x-2">
          <MoaiIcon className="size-6 text-primary" />
          <span className="text-xl font-bold">MOAI</span>
        </Link>
      </div>
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <span>/</span>
        <Link href="/models" className="hover:text-primary">
          Models
        </Link>
        <span>/</span>
        {breadcrumbs.map((crumb, index) => (
          <span key={index} className="flex items-center space-x-1">
            <Link href={crumb.url} className="hover:text-primary">
              {crumb.label}
            </Link>
            {index < breadcrumbs.length - 1 && <span>/</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
