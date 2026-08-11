"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import CancelButton from "@/components/buttons/cancel-button"
import SubmitButton from "@/components/buttons/submit-button"
import { AppFormField } from "@/components/forms/app-form-field"
import { TeamHubLogo } from "@/components/layout/teamhub-logo"
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
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import workSpaceSchema, {
  WorkSpaceSchema,
} from "@/lib/schemas/workspace/workspace-schema"
import { useCreateWorkspaceMutation } from "@/store/api/workspace/workspaces-api"

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
    defaultValues: { name: "", description: "" },
    mode: "onChange",
  })

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = form

  function handleOpenChange(next: boolean) {
    if (!next) {
      form.reset({ name: "", description: "" })
    }
    onOpenChange(next)
  }

  const onSubmit = async (data: WorkspaceFormValues) => {
    try {
      const response = await createWorkspace({
        name: data.name,
        description: data.description?.trim() ?? "",
      }).unwrap()
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
          render={
            <Button
              type="button"
              size="lg"
              className="btn-brand-gradient h-10 px-4 text-white shadow-sm"
            />
          }
        >
          Create Workspace
        </DialogTrigger>
      ) : null}

      <DialogContent className="gap-5 p-5 sm:max-w-md">
        <DialogHeader className="gap-3 pr-8 text-left">
          <TeamHubLogo variant="mark" size={44} />
          <div className="space-y-1.5">
            <DialogTitle className="font-heading text-xl font-semibold tracking-tight">
              Create workspace
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Name your team home. A short description helps members know what
              this workspace is for.
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
                    Up to 280 characters. Shown on the workspace home.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
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
