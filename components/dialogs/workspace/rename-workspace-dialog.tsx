"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Pencil } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import CancelButton from "@/components/buttons/cancel-button"
import SubmitButton from "@/components/buttons/submit-button"
import { AppFormField } from "@/components/forms/app-form-field"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import workSpaceSchema, {
  type WorkSpaceSchema,
} from "@/lib/schemas/workspace/workspace-schema"
import { useUpdateWorkspaceMutation } from "@/store/api/workspace/workspaces-api"

type WorkspaceFormValues = z.infer<typeof workSpaceSchema>

type RenameWorkspaceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  currentName: string
  currentDescription?: string
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: { message?: string } }).data
    if (data?.message) return data.message
  }
  return "Couldn’t update workspace. Try again."
}

/**
 * Owner/admin edit — name (+ slug) and optional description.
 */
export default function RenameWorkspaceDialog({
  open,
  onOpenChange,
  workspaceId,
  currentName,
  currentDescription = "",
}: RenameWorkspaceDialogProps) {
  const [updateWorkspace, { isLoading }] = useUpdateWorkspaceMutation()

  const form = useForm<WorkSpaceSchema>({
    resolver: zodResolver(workSpaceSchema),
    defaultValues: { name: currentName, description: currentDescription },
    mode: "onChange",
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = form

  useEffect(() => {
    if (open) {
      reset({ name: currentName, description: currentDescription })
    }
  }, [open, currentName, currentDescription, reset])

  function handleOpenChange(next: boolean) {
    if (!next) {
      reset({ name: currentName, description: currentDescription })
    }
    onOpenChange(next)
  }

  const onSubmit = async (data: WorkspaceFormValues) => {
    try {
      const response = await updateWorkspace({
        workspaceId,
        name: data.name,
        description: data.description?.trim() ?? "",
      }).unwrap()
      handleOpenChange(false)
      toast.success("Workspace updated", {
        description: `Saved changes for ${response.name}.`,
      })
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-5 p-5 sm:max-w-md">
        <DialogHeader className="gap-3 pr-8 text-left">
          <div
            className="flex size-11 items-center justify-center rounded-xl border border-border bg-primary/10 text-primary"
            aria-hidden
          >
            <Pencil className="size-5" strokeWidth={1.75} />
          </div>
          <div className="space-y-1.5">
            <DialogTitle className="font-heading text-xl font-semibold tracking-tight">
              Edit workspace
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Update the name and optional description. The URL slug updates
              when the name changes.
            </DialogDescription>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <AppFormField
              control={control}
              name="name"
              label="Workspace name"
              type="text"
              placeholder="e.g. Acme Inc."
              showIcon={false}
              autoComplete="organization"
              inputClassName="h-10"
              maxLength={50}
            />

            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      value={field.value ?? ""}
                      placeholder="e.g. Product engineering for the Acme mobile app"
                      maxLength={280}
                      rows={3}
                      className="w-full min-w-0 resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                  </FormControl>
                  <FormDescription>
                    Helps members understand what this workspace is for.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <CancelButton
                onClick={() => handleOpenChange(false)}
                className="h-9"
              />
              <SubmitButton
                type="submit"
                text="Save"
                isLoading={isLoading}
                disabled={!isValid || isLoading}
                className="h-9"
              />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
