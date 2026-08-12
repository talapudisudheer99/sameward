import type { PresignedUpload } from "@/lib/types/upload/upload-types"
import type {
  ProfileLink,
  PublicProfile,
  UpdateProfileInput,
} from "@/lib/types/profile/profile-types"
import { baseApi } from "@/store/api/base-api"
import type { CurrentUser } from "@/store/api/auth/auth-api"

/** Extended me payload (Profile v1). */
export type CurrentUserWithProfile = CurrentUser & {
  title: string
  bio: string
  timezone: string
  links: ProfileLink[]
  avatarUrl: string | null
}

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateMyProfile: builder.mutation<
      { user: CurrentUserWithProfile },
      UpdateProfileInput
    >({
      query: (body) => ({
        url: "auth/me",
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),

    presignAvatar: builder.mutation<
      { upload: PresignedUpload },
      { name: string; mime: string; sizeBytes: number }
    >({
      query: (body) => ({
        url: "auth/me/avatar",
        method: "POST",
        body,
      }),
    }),

    getWorkspaceProfile: builder.query<
      { profile: PublicProfile },
      { workspaceId: string; userId: string }
    >({
      query: ({ workspaceId, userId }) =>
        `workspaces/${workspaceId}/profiles/${userId}`,
    }),
  }),
})

export const {
  useUpdateMyProfileMutation,
  usePresignAvatarMutation,
  useGetWorkspaceProfileQuery,
  useLazyGetWorkspaceProfileQuery,
} = profileApi
