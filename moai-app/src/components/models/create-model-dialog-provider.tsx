"use client";

import { PropsWithChildren } from "react";
import { CreateModelDialog } from "./create-model-dialog";

export function CreateModelDialogProvider({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      <CreateModelDialog />
    </>
  );
}
