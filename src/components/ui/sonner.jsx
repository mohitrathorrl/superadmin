"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      position="bottom-right"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group flex w-[360px] items-start gap-3 rounded-xl border bg-white p-4 text-zinc-900 shadow-lg",
          title: "text-sm font-semibold",
          description: "text-sm text-zinc-600",
          icon: "mt-0.5",

          success: "!border-green-200 !bg-green-50 !text-green-900",
          error: "!border-red-200 !bg-red-50 !text-red-900",
          warning: "!border-yellow-200 !bg-yellow-50 !text-yellow-900",
          info: "!border-blue-200 !bg-blue-50 !text-blue-900",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
