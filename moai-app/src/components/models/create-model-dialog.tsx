"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateModelDialog } from "@/stores/create-model-dialog";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  description: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

export function CreateModelDialog() {
  const { open, closeDialog, templateId, resetDialog, setTemplateId } =
    useCreateModelDialog();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const invalidateModels = async () => {
    await queryClient.invalidateQueries(trpc.models.list.queryFilter());
  };
  const { data: templates } = useQuery(
    trpc.models.templates.queryOptions(undefined, {
      enabled: open,
    })
  );

  const selectedTemplate = templateId
    ? templates?.find((t) => t.id === templateId)
    : undefined;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (!open) form.reset({ name: "", description: "" });
  }, [open, form]);

  const createMutation = useMutation(
    trpc.models.create.mutationOptions({
      onSuccess: async () => {
        await invalidateModels();
        resetDialog();
      },
    })
  );

  const createFromTemplateMutation = useMutation(
    trpc.models.createFromTemplate.mutationOptions({
      onSuccess: async () => {
        await invalidateModels();
        resetDialog();
      },
    })
  );

  const onSubmit = (values: FormValues) => {
    if (templateId) {
      createFromTemplateMutation.mutate({ templateId, name: values.name });
    } else {
      createMutation.mutate(values);
    }
  };

  const isSubmitting =
    createMutation.isPending || createFromTemplateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? undefined : closeDialog())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new model</DialogTitle>
          <DialogDescription>
            Give your model a name and an optional description.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FormLabel>Start from</FormLabel>
              <Select
                value={templateId ?? "__scratch__"}
                onValueChange={(val) =>
                  setTemplateId(val === "__scratch__" ? null : val)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__scratch__">From scratch</SelectItem>
                  {templates?.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground rounded-md border bg-muted/20 p-3">
                {selectedTemplate ? (
                  <p>
                    {selectedTemplate.description ||
                      "No description available for this template."}
                  </p>
                ) : (
                  <p>Create a blank model with no prefilled components.</p>
                )}
              </div>
            </div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Production planning" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Briefly describe the model (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={closeDialog}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create model"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
