"use client"

import { useState } from "react"
import { LayoutTemplate } from "lucide-react"

import CreateWorkSpaceDialog from "@/components/dialogs/workspace/create-work-space-dialog"
import { Button } from "@/components/ui/button"

export default function WorkspacePage() {
  const [open, setOpen] = useState(false)

  const importWorkspaceHandler = () => {
    console.log("import-workspace: coming-soon")
  }

  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-4">
      <div className="flex w-full max-w-lg flex-col items-center text-center">
        <div
          className="mb-6 flex size-16 items-center justify-center rounded-[var(--radius)] border border-border bg-card text-primary"
          aria-hidden
        >
          <LayoutTemplate className="size-8" strokeWidth={1.5} />
        </div>

        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Create your first workspace
        </h1>

        <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
          Invite teammates, organize projects, and let AI help structure your
          work. A workspace is your team&apos;s shared home.
        </p>

        <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center">
          <CreateWorkSpaceDialog open={open} onOpenChange={setOpen} />
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-10 px-4"
            onClick={importWorkspaceHandler}
          >
            Import Existing Data
          </Button>
        </div>
      </div>
    </section>
  )
}
