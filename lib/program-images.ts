/**
 * Program cover images. Centre-uploaded `image_url` wins; otherwise a
 * design placeholder from public/images/programs/.
 */

import { resolveUploadUrl } from "@/lib/resolve-upload-url"

const PROGRAM_IMAGES = [
  "/images/programs/class.jpg",
  "/images/programs/gallery.jpg",
] as const

/** Cover photo: centre upload when present, otherwise a design placeholder. */
export function programImage(courseId: number, imageUrl?: string | null): string {
  const custom = resolveUploadUrl(imageUrl)
  if (custom) return custom
  return PROGRAM_IMAGES[Math.abs(Number(courseId) || 0) % PROGRAM_IMAGES.length]
}

/** Option-card classmate avatar stack (Figma ovals 25px, white 1.04 stroke). */
export const CLASS_AVATARS = [
  "/images/programs/avatars/a1.jpg",
  "/images/programs/avatars/a2.jpg",
  "/images/programs/avatars/a3.jpg",
  "/images/programs/avatars/a4.jpg",
] as const

/** "By X" avatar next to the instructor name (Figma 26.24px oval). */
export const BY_AVATAR = CLASS_AVATARS[0]

/** Hosted-by avatar (Figma 50px, scaleMode fit). */
export const HOST_AVATAR = "/images/programs/avatars/host.jpg"
