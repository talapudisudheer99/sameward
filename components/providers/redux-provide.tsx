"use client"

import { useState } from "react"
import { Provider } from "react-redux"

import { makeStore } from "@/store"

/**
 * Wraps the app so Client Components can use RTK Query hooks.
 * Must live under a "use client" boundary (root layout imports this).
 */
export function ReduxProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Lazy useState: makeStore() runs once per mount (one store per tab).
  // React 19 disallows reading ref.current during render — useState is the safe pattern.
  const [store] = useState(() => makeStore())

  return <Provider store={store}>{children}</Provider>
}
