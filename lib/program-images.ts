/**
 * Static program imagery sourced from the Figma design captures
 * (public/images/programs/). The public API has no image/avatar fields yet,
 * so courses are assigned the design photos deterministically — swap to
 * API-driven images when they exist (see docs/Figma_Fidelity_Workflow.md
 * deviations policy).
 *
 * Design assets (imageHash → file):
 * - a2e38fec (card photo, 1219×640)   → class.jpg
 * - 34319d6f (gallery photo, portrait) → gallery.jpg
 * - avatars: host.jpg (50px fit) + a1–a4.jpg (25px ovals)
 */

const PROGRAM_IMAGES = [
  "/images/programs/class.jpg",
  "/images/programs/gallery.jpg",
] as const

/** Deterministic per-course image (only 2 photos exist in the design). */
export function programImage(courseId: number): string {
  return PROGRAM_IMAGES[courseId % PROGRAM_IMAGES.length]
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
