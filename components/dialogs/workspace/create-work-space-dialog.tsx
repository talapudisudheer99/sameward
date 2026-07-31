"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { LayoutTemplate } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import CancelButton from "@/components/buttons/cancel-button"
import SubmitButton from "@/components/buttons/submit-button"
import { AppFormField } from "@/components/forms/app-form-field"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import workSpaceSchema, {
  WorkSpaceSchema,
} from "@/lib/schemas/workspace/workspace-schema"
import { useCreateWorkspaceMutation } from "@/store/api/workspaces-api"

type WorkspaceFormValues = z.infer<typeof workSpaceSchema>

interface CreateWorkSpaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Hide the built-in trigger when the parent already has a Create button */
  showTrigger?: boolean
}

export default function CreateWorkSpaceDialog({
  open,
  onOpenChange,
  showTrigger = true,
}: CreateWorkSpaceDialogProps) {
  const [createWorkspace, { isLoading }] = useCreateWorkspaceMutation()

  const form = useForm<WorkSpaceSchema>({
    resolver: zodResolver(workSpaceSchema),
    defaultValues: { name: "" },
    mode: "onChange",
  })

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = form

  function handleOpenChange(next: boolean) {
    if (!next) {
      form.reset({ name: "" })
    }
    onOpenChange(next)
  }

  const onSubmit = async (data: WorkspaceFormValues) => {
    try {
      const response = await createWorkspace(data).unwrap()
      handleOpenChange(false)
      toast.success("Workspace created", {
        description: `${response.name} is ready for your team.`,
      })
    } catch (error) {
      console.error(error)
      toast.error("Couldn’t create workspace", {
        description: "Check the name and try again.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {showTrigger ? (
        <DialogTrigger
          render={<Button type="button" size="lg" className="h-10 px-4" />}
        >
          Create Workspace
        </DialogTrigger>
      ) : null}

      <DialogContent className="gap-5 p-5 sm:max-w-md">
        <DialogHeader className="gap-3 pr-8 text-left">
          <div
            className="flex size-11 items-center justify-center rounded-xl border border-border bg-primary/10 text-primary"
            aria-hidden
          >
            <LayoutTemplate className="size-5" strokeWidth={1.75} />
          </div>
          <div className="space-y-1.5">
            <DialogTitle className="font-heading text-xl font-semibold tracking-tight">
              Create workspace
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Name your workspace. You can always change it later.
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
            <DialogFooter className="gap-2 pt-1 sm:justify-end">
              <CancelButton
                onClick={() => handleOpenChange(false)}
                className="h-9 min-w-24"
              />
              <SubmitButton
                type="submit"
                disabled={!isValid || isLoading}
                isLoading={isLoading}
                text="Create"
                className="h-9 min-w-24"
              />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
