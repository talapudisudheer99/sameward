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
import { Form } from "@/components/ui/form"
import workSpaceSchema, {
  type WorkSpaceSchema,
} from "@/lib/schemas/workspace/workspace-schema"
import { useUpdateWorkspaceMutation } from "@/store/api/workspaces-api"

type WorkspaceFormValues = z.infer<typeof workSpaceSchema>

type RenameWorkspaceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  currentName: string
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: { message?: string } }).data
    if (data?.message) return data.message
  }
  return "Couldn’t rename workspace. Try again."
}

/**
 * Owner/admin rename — same Zod schema as create.
 */
export default function RenameWorkspaceDialog({
  open,
  onOpenChange,
  workspaceId,
  currentName,
}: RenameWorkspaceDialogProps) {
  const [updateWorkspace, { isLoading }] = useUpdateWorkspaceMutation()

  const form = useForm<WorkSpaceSchema>({
    resolver: zodResolver(workSpaceSchema),
    defaultValues: { name: currentName },
    mode: "onChange",
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = form

  // Sync field when opening / name changes from server
  useEffect(() => {
    if (open) {
      reset({ name: currentName })
    }
  }, [open, currentName, reset])

  function handleOpenChange(next: boolean) {
    if (!next) {
      reset({ name: currentName })
    }
    onOpenChange(next)
  }

  const onSubmit = async (data: WorkspaceFormValues) => {
    try {
      const response = await updateWorkspace({
        workspaceId,
        name: data.name,
      }).unwrap()
      handleOpenChange(false)
      toast.success("Workspace renamed", {
        description: `Now called ${response.name}.`,
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
              Rename workspace
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Update the display name. The URL slug updates when needed.
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
            />

            <DialogFooter className="gap-2 sm:justify-end">
              <CancelButton
                className="h-9"
                onClick={() => handleOpenChange(false)}
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
