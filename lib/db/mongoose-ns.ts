/**
 * Mongoose named exports that work in Next *and* plain Node/tsx.
 *
 * Under Node ESM, `import { models } from "mongoose"` fails — `models` lives on
 * the default export only. Next's bundler hides that; realtime does not.
 *
 * For TypeScript namespaces (`Types.ObjectId` in type positions), import
 * `type { Types }` from `"mongoose"` in the model file.
 */
import mongoose from "mongoose"

export const Schema = mongoose.Schema
export const model = mongoose.model.bind(mongoose) as typeof mongoose.model
export const models = mongoose.models

export type { InferSchemaType, Model } from "mongoose"
