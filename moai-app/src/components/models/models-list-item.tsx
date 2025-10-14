"use client";
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Clock,
  Users,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";

export type ModelSummary = {
  id: string;
  name: string;
  description: string | null;
  version: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  tags: string[];
  ownerName: string | null;
  componentsCount: {
    sets: number;
    parameters: number;
    variables: number;
    constraints: number;
    objectives: number;
  };
};

export const ModelsListItem = ({ model }: { model: ModelSummary }) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState(model.name);
  const [description, setDescription] = useState(model.description ?? "");

  const invalidateList = async () => {
    await queryClient.invalidateQueries(trpc.models.list.queryFilter());
  };

  const updateMutation = useMutation(
    trpc.models.update.mutationOptions({
      onSuccess: async () => {
        toast.success("Model updated");
        await invalidateList();
        setEditOpen(false);
      },
      onError: (err) => toast.error(err.message),
    })
  );

  const deleteMutation = useMutation(
    trpc.models.delete.mutationOptions({
      onSuccess: async () => {
        toast.success("Model deleted");
        await invalidateList();
        setDeleteOpen(false);
      },
      onError: (err) => toast.error(err.message),
    })
  );

  const cloneMutation = useMutation(
    trpc.models.clone.mutationOptions({
      onSuccess: async () => {
        toast.success("Model cloned");
        await invalidateList();
      },
      onError: (err) => toast.error(err.message),
    })
  );

  const onEditSave = () => {
    if (!name.trim()) return; // basic guard
    updateMutation.mutate({
      id: model.id,
      name: name.trim(),
      description: description.trim() || null,
    });
  };

  const onDeleteConfirm = () => {
    deleteMutation.mutate({ id: model.id });
  };

  const onClone = () => {
    const cloneName = `${model.name} (copy)`;
    cloneMutation.mutate({ id: model.id, name: cloneName });
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow h-full border-l-4 border-l-black">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <Link
                href={`/models/v1/${model.id}`}
                className="h-full cursor-pointer hover:underline"
              >
                <CardTitle className="text-lg truncate">{model.name}</CardTitle>
              </Link>
              {model.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {model.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">MILP</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setName(model.name);
                      setDescription(model.description ?? "");
                      setEditOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      onClone();
                    }}
                  >
                    <Copy className="h-4 w-4" /> Clone
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      setDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Components:</span>
              <div className="flex flex-wrap gap-2 justify-end">
                <Badge variant="secondary" className="text-xs">
                  {model.componentsCount.variables} vars
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {model.componentsCount.constraints} constraints
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {model.componentsCount.objectives} objectives
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {model.componentsCount.parameters} params
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {model.componentsCount.sets} sets
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  v{model.version} • {formatDistanceToNow(model.updatedAt)} ago
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{model.ownerName ?? ""}</span>
              </div>
            </div>

            {model.tags?.length ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {model.tags.slice(0, 4).map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">
                    {t}
                  </Badge>
                ))}
                {model.tags.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{model.tags.length - 4}
                  </Badge>
                )}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
        // onPointerDownOutside={(e) => e.preventDefault()}
        // onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Edit model</DialogTitle>
            <DialogDescription>
              Update the name and description.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Model name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setEditOpen(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={onEditSave}
                disabled={updateMutation.isPending || !name.trim()}
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete model</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{model.name}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={onDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
