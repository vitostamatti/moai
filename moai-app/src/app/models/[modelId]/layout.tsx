import { getSession } from "@/auth/server";
import { MoaiIcon } from "@/components/icons";
import { UserAvatar } from "@/components/user-avatar";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  children: React.ReactNode;
  params: Promise<{
    modelId: string;
  }>;
};

const Layout = async ({ children, params }: Props) => {
  const { user } = await getSession();
  if (!user) {
    return redirect("/");
  }

  return (
    <div className="flex flex-col w-full h-screen bg-background">
      <nav className="border-b w-full flex-shrink-0">
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
      <div className="flex-1 min-h-0 w-full overflow-hidden">{children}</div>
    </div>
  );
};

export default Layout;
