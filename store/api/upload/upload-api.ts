import type {
  PresignFileInput,
  PresignUploadsResponse,
} from "@/lib/types/upload/upload-types"
import { baseApi } from "@/store/api/base-api"

/**
 * Upload RTK — presign endpoints for direct-to-storage (S3) uploads.
 *
 * Kept separate from channel-api on purpose: uploading files is a cross-cutting
 * capability, not a channel concept. Presign *authorization* is still context-
 * specific (channel membership today), so each context gets its own endpoint
 * here — but they all share this one slice.
 *
 * Presign is transient (a short-lived signed URL), so no cache tags: nothing to
 * provide or invalidate. Actually pushing bytes to S3 is a raw PUT the browser
 * does directly (not an RTK request) — see the client upload helper (T21).
 */
export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * POST …/channels/:channelId/uploads — batch presign for chat attachments.
     * Server validates auth + channel access + MIME/size, then returns one
     * presigned PUT URL per file.
     */
    presignChannelUploads: builder.mutation<
      PresignUploadsResponse,
      { workspaceId: string; channelId: string; files: PresignFileInput[] }
    >({
      query: ({ workspaceId, channelId, files }) => ({
        url: `workspaces/${workspaceId}/channels/${channelId}/uploads`,
        method: "POST",
        body: { files },
      }),
    }),
  }),
})

export const { usePresignChannelUploadsMutation } = uploadApi
