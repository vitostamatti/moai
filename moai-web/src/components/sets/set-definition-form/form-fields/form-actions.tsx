import React from "react";

import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onCancel: () => void;
  isFormValid: () => boolean;
}

export const FormActions = ({
  onCancel,

  isFormValid,
}: FormActionsProps) => (
  <div className="flex justify-end gap-3 pt-6">
    <Button type="button" variant="outline" onClick={onCancel}>
      Cancel
    </Button>
    <Button type="submit" disabled={!isFormValid()}>
      Save
    </Button>
  </div>
);
