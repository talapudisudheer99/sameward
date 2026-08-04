"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import { renameChannelSchema } from "@/lib/schemas/channel/channel-schema"

type FormValues = z.infer<typeof renameChannelSchema>

type RenameChannelDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentName: string
  /** Wire: useUpdateChannelMutation */
  onRename: (data: FormValues) => Promise<void>
  isSubmitting?: boolean
}

export default function RenameChannelDialog({
  open,
  onOpenChange,
  currentName,
  onRename,
  isSubmitting = false,
}: RenameChannelDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(renameChannelSchema),
    values: { name: currentName },
    mode: "onChange",
  })

  function handleOpenChange(next: boolean) {
    if (!next) form.reset({ name: currentName })
    onOpenChange(next)
  }

  async function onSubmit(data: FormValues) {
    await onRename(data)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-5 p-5 sm:max-w-md">
        <DialogHeader className="gap-1.5 pr-8 text-left">
          <DialogTitle className="font-heading text-xl font-semibold">
            Rename channel
          </DialogTitle>
          <DialogDescription>
            Update the display name. Slug updates on the server.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <AppFormField
              control={form.control}
              name="name"
              label="Channel name"
              type="text"
              showIcon={false}
              inputClassName="h-10"
              maxLength={80}
            />
            <DialogFooter className="gap-2 sm:justify-end">
              <CancelButton
                onClick={() => handleOpenChange(false)}
                className="h-9 min-w-24"
              />
              <SubmitButton
                type="submit"
                disabled={
                  !form.formState.isValid ||
                  isSubmitting ||
                  form.formState.isSubmitting
                }
                isLoading={isSubmitting || form.formState.isSubmitting}
                text="Save"
                className="h-9 min-w-24"
              />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
