/** Learning Companion animal branding + public asset paths. */

export type CompanionAnimalKey = "Rabbit" | "Owl" | "Dolphin" | "Turtle" | "Fox" | "Bee"

export type CompanionAnimalMeta = {
  key: CompanionAnimalKey
  label: string
  shortName: string
  initial: string
  emoji: string
  accent: string
  accentSoft: string
  heroSrc: string
  poseSrcs: string[]
  meaning1: string
  meaning2: string
  oftenObservedAs: string[]
  whatMayHelp: string[]
  theory: string
}

/** Six report visual slots — each uses one pose image for the animal. */
export const REPORT_POSE_SLOTS = [
  "cover",
  "what_may_help",
  "why_we_think_this",
  "supporting",
  "personalised_interpretation",
  "strategies_and_next",
] as const

export type ReportPoseSlot = (typeof REPORT_POSE_SLOTS)[number]

const ASSET_ROOT = "/assets/learning-companion"

export function poseForSlot(animal: CompanionAnimalMeta, slot: ReportPoseSlot): string {
  const idx = REPORT_POSE_SLOTS.indexOf(slot)
  return animal.poseSrcs[idx] || animal.poseSrcs[0] || animal.heroSrc
}

export const COMPANION_ANIMALS: Record<CompanionAnimalKey, CompanionAnimalMeta> = {
  Rabbit: {
    key: "Rabbit",
    label: "Rabbit Active Explorer",
    shortName: "Rabbit",
    initial: "R",
    emoji: "🐇",
    accent: "#0ABAB5",
    accentSoft: "#E7F8F7",
    heroSrc: `${ASSET_ROOT}/rabbit/hero.png`,
    poseSrcs: [1, 2, 3, 4, 5, 6].map((n) => `${ASSET_ROOT}/rabbit/pose-${String(n).padStart(2, "0")}.png`),
    meaning1:
      "Your child may learn best through trying, exploring, asking, and actively taking part. They may enjoy hands-on experiences, new challenges, and opportunities to test ideas instead of only listening passively.",
    meaning2:
      "They may show progress when they are given chances to participate, make attempts, and learn through experience.",
    oftenObservedAs: ["Participating actively", "Trying independently", "Showing initiative", "Asking questions"],
    whatMayHelp: [
      "Give them chances to try before over-explaining.",
      "Encourage questions and curiosity.",
      "Offer small challenges that allow exploration.",
      "Help them reflect after trying, not only focus on the outcome.",
      "Guide them to slow down and review when needed.",
    ],
    theory:
      "This is grounded in the idea that children learn actively through interaction, exploration, and guided experience. In developmental and educational psychology, active participation and curiosity are important parts of learning, especially when adults provide support that matches the child’s current level.",
  },
  Owl: {
    key: "Owl",
    label: "Owl Thoughtful Learner",
    shortName: "Owl",
    initial: "O",
    emoji: "🦉",
    accent: "#4C5B5C",
    accentSoft: "#F2F5F5",
    heroSrc: `${ASSET_ROOT}/owl/hero.png`,
    poseSrcs: [7, 8, 9, 10, 11, 12].map((n) => `${ASSET_ROOT}/owl/pose-${String(n).padStart(2, "0")}.png`),
    meaning1:
      "Your child may learn best when they have time to think, review their work, and receive clear feedback. They may show progress through careful practice, reflection, and gradual improvement rather than rushing into tasks.",
    meaning2:
      "They may benefit from understanding the reason behind a task and may improve well when feedback is specific and constructive.",
    oftenObservedAs: ["Working carefully", "Responding well to feedback", "Asks questions", "Checking mistakes carefully"],
    whatMayHelp: [
      "Give clear instructions and examples.",
      "Allow time to process and review.",
      "Encourage them to ask questions.",
      "Praise effort, strategy, and improvement, not only results.",
      "Help them notice what improved from last time.",
    ],
    theory:
      "This is grounded in the idea that children learn well when feedback and support match their current level of development. Vygotsky’s Zone of Proximal Development describes the space between what a learner can do independently and what they can do with guidance, which supports the idea of showing “what helps next” rather than only judging performance.",
  },
  Dolphin: {
    key: "Dolphin",
    label: "Dolphin Social Collaborator",
    shortName: "Dolphin",
    initial: "D",
    emoji: "🐬",
    accent: "#2F8FCE",
    accentSoft: "#EAF5FC",
    heroSrc: `${ASSET_ROOT}/dolphin/hero.png`,
    poseSrcs: [13, 14, 15, 16, 17, 18].map((n) => `${ASSET_ROOT}/dolphin/pose-${String(n).padStart(2, "0")}.png`),
    meaning1:
      "Your child may learn best through interaction, shared practice, encouragement, and group-based learning. They may become more engaged when learning feels social, supportive, and connected with others.",
    meaning2:
      "They may show progress when they can discuss, cooperate, observe peers, or receive feedback in an encouraging environment.",
    oftenObservedAs: [
      "Collaborating well",
      "Participating actively",
      "Responding well to feedback",
      "Engaging with others during learning",
    ],
    whatMayHelp: [
      "Encourage group practice or partner activities.",
      "Give opportunities to explain ideas to others.",
      "Use positive social encouragement.",
      "Help them balance teamwork with independent practice.",
      "Praise cooperation, listening, and contribution.",
    ],
    theory:
      "This is grounded in social learning theory and developmental psychology, where children often learn through observing others, interacting with peers, and receiving social feedback from adults and classmates.",
  },
  Turtle: {
    key: "Turtle",
    label: "Turtle Steady Builder",
    shortName: "Turtle",
    initial: "T",
    emoji: "🐢",
    accent: "#3D8B6E",
    accentSoft: "#EAF6F1",
    heroSrc: `${ASSET_ROOT}/turtle/hero.png`,
    poseSrcs: [19, 20, 21, 22, 23, 24].map((n) => `${ASSET_ROOT}/turtle/pose-${String(n).padStart(2, "0")}.png`),
    meaning1:
      "Your child may learn best with calm support, clear steps, and enough time to warm up. They may not always rush into tasks, but they can show growth through steady practice, persistence, and repeated encouragement.",
    meaning2:
      "They may benefit from a predictable learning environment where tasks are broken down into manageable steps.",
    oftenObservedAs: ["Showing persistence", "Staying focused", "Working carefully", "Needing encouragement to start"],
    whatMayHelp: [
      "Give warm encouragement before starting.",
      "Break tasks into smaller steps.",
      "Allow time to build confidence.",
      "Notice effort and persistence.",
      "Avoid rushing them too quickly into performance or comparison.",
    ],
    theory:
      "This is grounded in the idea that children develop confidence and independence through appropriate scaffolding. Some children show stronger engagement after emotional safety, structure, and gradual support are provided.",
  },
  Fox: {
    key: "Fox",
    label: "Fox Creative Problem Solver",
    shortName: "Fox",
    initial: "F",
    emoji: "🦊",
    accent: "#E07A3D",
    accentSoft: "#FFF2EA",
    heroSrc: `${ASSET_ROOT}/fox/hero.png`,
    poseSrcs: [25, 26, 27, 28, 29, 30].map((n) => `${ASSET_ROOT}/fox/pose-${String(n).padStart(2, "0")}.png`),
    meaning1:
      "Your child may learn best when they can explore different ways to solve a problem. They may enjoy open-ended tasks, creative challenges, and opportunities to test their own ideas.",
    meaning2:
      "They may show progress when they are encouraged to explain their thinking, try strategies, and refine ideas after experimenting.",
    oftenObservedAs: ["Showing initiative", "Trying independently", "Asking questions", "Showing persistence"],
    whatMayHelp: [
      "Give open-ended challenges.",
      "Ask “What else could you try?”",
      "Encourage them to explain their thinking.",
      "Help them organise ideas after exploring.",
      "Balance creativity with clear next steps.",
    ],
    theory:
      "This is grounded in problem-solving and constructivist learning ideas, where children build understanding by testing strategies, reflecting on outcomes, and making sense of experience.",
  },
  Bee: {
    key: "Bee",
    label: "Bee Focused Worker",
    shortName: "Bee",
    initial: "B",
    emoji: "🐝",
    accent: "#D4A017",
    accentSoft: "#FFF8E8",
    heroSrc: `${ASSET_ROOT}/bee/hero.png`,
    poseSrcs: [31, 32, 33, 34, 35, 36].map((n) => `${ASSET_ROOT}/bee/pose-${String(n).padStart(2, "0")}.png`),
    meaning1:
      "Your child may learn best with clear goals, steady routines, and tasks that allow them to concentrate. They may show progress through consistency, careful practice, and repeated effort.",
    meaning2:
      "They may benefit from knowing what is expected, having a clear task structure, and seeing small improvements over time.",
    oftenObservedAs: ["Staying focused", "Working carefully", "Checking mistakes carefully", "Showing persistence"],
    whatMayHelp: [
      "Set clear goals for each practice.",
      "Keep instructions simple and structured.",
      "Encourage careful checking.",
      "Celebrate small improvements.",
      "Add variety when learning becomes too repetitive.",
    ],
    theory:
      "This is grounded in self-regulated learning and process-focused feedback. Children often build stronger learning habits when they can set goals, monitor their work, receive feedback, and recognise progress over time.",
  },
}

export const COMPANION_ANIMAL_KEYS = Object.keys(COMPANION_ANIMALS) as CompanionAnimalKey[]

export const Z_SIR_SRC = `${ASSET_ROOT}/z-sir.png`

export const PARENT_REMINDER =
  "This is not a diagnosis or a fixed personality label — it's a recent snapshot based on ClassZ records, and it may change as your child joins more classes and receives more feedback."

const LABEL_TO_KEY: Record<string, CompanionAnimalKey> = Object.fromEntries(
  COMPANION_ANIMAL_KEYS.flatMap((key) => {
    const meta = COMPANION_ANIMALS[key]
    return [
      [key.toLowerCase(), key],
      [meta.label.toLowerCase(), key],
      [meta.shortName.toLowerCase(), key],
    ]
  }),
) as Record<string, CompanionAnimalKey>

export function resolveCompanionAnimal(
  value?: string | null,
): CompanionAnimalMeta | null {
  if (!value) return null
  const raw = String(value).trim()
  if (!raw) return null
  const direct = COMPANION_ANIMALS[raw as CompanionAnimalKey]
  if (direct) return direct
  const mapped = LABEL_TO_KEY[raw.toLowerCase()]
  if (mapped) return COMPANION_ANIMALS[mapped]
  const firstWord = raw.split(/\s+/)[0]
  const fromFirst = LABEL_TO_KEY[firstWord.toLowerCase()]
  return fromFirst ? COMPANION_ANIMALS[fromFirst] : null
}
