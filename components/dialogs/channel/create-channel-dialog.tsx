"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Globe, Lock } from "lucide-react"
import { useForm } from "react-hook-form"
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
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import channelSchema from "@/lib/schemas/channel/channel-schema"
import { cn } from "@/lib/utils"
import type { ChannelVisibility } from "@/lib/types/channel/channel-types"

type FormValues = z.infer<typeof channelSchema>

type CreateChannelDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /**
   * Wire RTK here: useCreateChannelMutation → unwrap → toast → close.
   * Return void; throw or reject on failure so isSubmitting stays honest.
   */
  onCreate: (data: FormValues) => Promise<void>
  isSubmitting?: boolean
}

/**
 * Ch-C — Create channel (public | private).
 * No RTK inside — parent passes onCreate.
 */
export default function CreateChannelDialog({
  open,
  onOpenChange,
  onCreate,
  isSubmitting = false,
}: CreateChannelDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(channelSchema),
    defaultValues: { name: "", visibility: "public" },
    mode: "onChange",
  })

  const visibility = form.watch("visibility")

  function handleOpenChange(next: boolean) {
    if (!next) {
      form.reset({ name: "", visibility: "public" })
    }
    onOpenChange(next)
  }

  async function onSubmit(data: FormValues) {
    await onCreate(data)
    handleOpenChange(false)
  }

  function setVisibility(v: ChannelVisibility) {
    form.setValue("visibility", v, { shouldValidate: true, shouldDirty: true })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-5 p-5 sm:max-w-md">
        <DialogHeader className="gap-1.5 pr-8 text-left">
          <DialogTitle className="font-heading text-xl font-semibold tracking-tight">
            Create channel
          </DialogTitle>
          <DialogDescription className="sr-only text-sm leading-relaxed">
            Create a new channel in your workspace.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <AppFormField
              control={form.control}
              name="name"
              label="Channel name"
              type="text"
              placeholder="e.g. product-launch"
              showIcon={false}
              inputClassName="h-10"
              maxLength={80}
            />

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Visibility</legend>
              <div className="grid grid-cols-2 gap-2">
                <VisibilityCard
                  selected={visibility === "public"}
                  icon={Globe}
                  title="Public"
                  description="Everyone in the workspace"
                  onClick={() => setVisibility("public")}
                />
                <VisibilityCard
                  selected={visibility === "private"}
                  icon={Lock}
                  title="Private"
                  description="Invite only"
                  onClick={() => setVisibility("private")}
                />
              </div>
            </fieldset>

            <DialogFooter className="gap-2">
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

function VisibilityCard({
  selected,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  selected: boolean
  icon: typeof Globe
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={cn(
        "h-auto flex-col items-start gap-1 px-3 py-3 text-left whitespace-normal",
        selected && "border-primary bg-primary/5 ring-1 ring-primary/30"
      )}
    >
      <span className="flex items-center gap-1.5 text-sm font-medium">
        <Icon className="size-3.5 text-primary" aria-hidden />
        {title}
      </span>
      <span className="text-xs font-normal text-muted-foreground">
        {description}
      </span>
    </Button>
  )
}
