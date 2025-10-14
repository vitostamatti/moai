import React from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface FormActionsProps {
  isEditing: boolean;
  onCancel: () => void;
}

export const FormActions = ({ isEditing, onCancel }: FormActionsProps) => (
  <DialogFooter>
    <Button type="button" variant="outline" onClick={onCancel}>
      Cancel
    </Button>
    <Button type="submit">
      {isEditing ? "Update Variable" : "Create Variable"}
    </Button>
  </DialogFooter>
);
