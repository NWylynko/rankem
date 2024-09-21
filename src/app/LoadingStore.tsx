"use client"

import { PropsWithChildren } from "react"
import { useAppStore } from "./store"

export const LoadingStore = (props: PropsWithChildren) => {
  const isLoading = useAppStore((state) => state.loading)

  if (isLoading) {
    return <LoadingSpinner />
  }

  return props.children
}

export const LoadingSpinner = () => <div className="min-h-svh flex items-center justify-center"><span className="animate-spin">Loading :)</span></div>