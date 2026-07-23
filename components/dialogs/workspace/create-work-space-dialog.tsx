"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import {
  Form,
} from "@/components/ui/form"

import workSpaceSchema, { WorkSpaceSchema } from "@/lib/schemas/workspace/workspace"
import CancelButton from "@/components/buttons/cancel-button"
import { AppFormField } from "@/components/forms/app-form-field"
import SubmitButton from "@/components/buttons/submit-button"


type WorkspaceFormValues = z.infer<typeof workSpaceSchema>

interface CreateWorkSpaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateWorkSpaceDialog({
  open,
  onOpenChange,
}: CreateWorkSpaceDialogProps) {
  const form = useForm<WorkSpaceSchema>({
    resolver: zodResolver(workSpaceSchema),
    defaultValues: { name: "" },
    mode: "onChange",
  })

  const { control, handleSubmit, formState: { isValid } } = form

  useEffect(() => {
    if (!open) {
      form.reset({ name: "" })
    }
  }, [open, form])

  const onSubmit = (data: WorkspaceFormValues) => {
    console.log({
      action: "create-workspace",
      name: data.name.trim(),
      next: "POST /api/workspaces (Phase 3)",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <Button type="button" size="lg" className="h-10 px-4" />
        }
      >
        Create Workspace
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-semibold">
            Create workspace
          </DialogTitle>
          <DialogDescription>
            Name your team&apos;s shared home. You can invite people after it
            exists.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
           <AppFormField
            control={control}
            name="name"
            label="Workspace name"
            type="text"
            placeholder="e.g. Acme Product"
            className="h-10"
           />
            <DialogFooter className="gap-2 sm:justify-end">
             <CancelButton
              onClick={() => onOpenChange(false)}
             />
             <SubmitButton
              type="submit"
              disabled={!isValid}
              text="Create Workspace"
             />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
