"use client"

import { useState } from "react"
import { type Control, type FieldPath, type FieldValues } from "react-hook-form"
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react"

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type InputFieldType = "text" | "email" | "password"

type AppFormFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  type?: InputFieldType
  placeholder?: string
  description?: string
  disabled?: boolean
  autoComplete?: string
  className?: string
  inputClassName?: string
  showIcon?: boolean
  maxLength?: number
}

export function AppFormField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  type = "text",
  placeholder,
  description,
  disabled,
  autoComplete,
  className,
  inputClassName,
  showIcon = true,
  maxLength,
}: AppFormFieldProps<TFieldValues>) {
  const [visible, setVisible] = useState(false)

  let resolvedAutoComplete: string | undefined = autoComplete
  if (!resolvedAutoComplete) {
    if (type === "email") resolvedAutoComplete = "email"
    else if (type === "password") resolvedAutoComplete = "current-password"
  }

  const Icon = type === "email" ? Mail : type === "password" ? Lock : User

  const inputType = type === "password" ? (visible ? "text" : "password") : type

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn(className)}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              {showIcon ? (
                <Icon
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
              ) : null}
              <Input
                {...field}
                type={inputType}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete={resolvedAutoComplete}
                className={cn(
                  "h-11",
                  showIcon && "pl-9",
                  type === "password" && "pr-10",
                  inputClassName
                )}
                value={field.value ?? ""}
                maxLength={maxLength}
              />
              {type === "password" ? (
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setVisible((v) => !v)}
                  aria-label={visible ? "Hide password" : "Show password"}
                >
                  {visible ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              ) : null}
            </div>
          </FormControl>
          {description ? (
            <FormDescription>{description}</FormDescription>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
