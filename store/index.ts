import { configureStore } from "@reduxjs/toolkit"

import { baseApi } from "@/store/api/base-api"

// Side-effect imports: register endpoints on baseApi before the store is created
import { authApi } from "./api/auth/auth-api"
import { workspacesApi } from "./api/workspace/workspaces-api"
import { channelsApi } from "./api/channel/channel-api"
import { uploadApi } from "./api/upload/upload-api"
import { aiApi } from "./api/ai/ai-api"
import { profileApi } from "./api/profile/profile-api"

export { authApi, workspacesApi, channelsApi, uploadApi, aiApi, profileApi }

/**
 * Factory so each browser tab gets its own store (see ReduxProvider).
 * Called once per Provider mount — not on every render.
 */
export const makeStore = () => {
  return configureStore({
    reducer: {
      // RTK Query owns this slice (queries, mutations, cache)
      [baseApi.reducerPath]: baseApi.reducer,
    },
    // RTK Query middleware is required for caching + invalidation to work
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  })
}

// Typed helpers — use these in components instead of raw Redux types
export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]
