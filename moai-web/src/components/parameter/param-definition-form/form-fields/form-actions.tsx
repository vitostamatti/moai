import React from "react";
import type { ParameterSelect } from "@/db/schema";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  parameter?: ParameterSelect;
  onCancel: () => void;
}

export const FormActions = ({ parameter, onCancel }: FormActionsProps) => (
  <>
    <Button type="button" variant="outline" onClick={onCancel}>
      Cancel
    </Button>
    <Button type="submit">
      {parameter ? "Update Parameter" : "Create Parameter"}
    </Button>
  </>
);
