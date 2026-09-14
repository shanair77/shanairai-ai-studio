/**
 * aurelle/config — the entire 45s commercial described as data.
 *
 * ShanairAICommercial45 · 1080×1920 · 30fps · 1350 frames (45.000s).
 *
 * The film tells one story in six acts: a believable AURELLE luxury-fashion campaign
 * (0–15s), a hard interruption (15–18s), a Remotion-style deconstruction that reveals the
 * campaign was constructed (18–26s), the truthful reveal (26–31s), a real-business
 * capability montage across four industries (31–38s), and the Shanair.AI brand + CTA
 * (38–45s). Every timing is a contiguous frame window so the edit reads as one continuous
 * piece; refine cuts by a few frames here without touching the story.
 */

export const FPS = 30;
export const DURATION = 1350; // 45.0s — tight two-voice cut: AURELLE narrator (Act 1) → break → Shanair narrator
export const WIDTH = 1080;
export const HEIGHT = 1920;

/* ─────────────────────────── assets ─────────────────────────── */

/** The 13 supplied AURELLE campaign stills, copied into public/aurelle. 941×1672 (9:16). */
export const A = {
  handbag: "aurelle/01-master-handbag.png",
  arrival: "aurelle/02-arrival.png",
  clasp: "aurelle/03-clasp-macro.png",
  gallery: "aurelle/04-gallery-walk.png",
  montage: "aurelle/05-detail-montage.png",
  hero: "aurelle/06-campaign-hero.png",
  beauty: "aurelle/07-beauty-campaign.png",
  icon: "aurelle/08-icon-product.png",
  flagship: "aurelle/09-flagship.png",
  restaurant: "aurelle/10-restaurant-hospitality.png",
  realEstate: "aurelle/11-real-estate.png",
  travel: "aurelle/12-travel-hospitality.png",
  founder: "aurelle/13-beaut-product-entrepreneur.png",
} as const;

/**
 * Asset #5 is a vertical contact sheet of six stacked panels. Rather than six files we crop
 * six deliberate regions from it for the rapid detail montage. Each entry is the focal point
 * (0–1 of the source) and the zoom used to fill the 9:16 frame with that panel's subject.
 */
export const MONTAGE_HITS = [
  { label: "GOLD", focalX: 0.36, focalY: 0.065, zoom: 2.5 }, // panel 1 — gold cuff
  { label: "HEEL", focalX: 0.5, focalY: 0.245, zoom: 2.4 }, //  panel 2 — patent heel
  { label: "STITCH", focalX: 0.55, focalY: 0.4, zoom: 2.6 }, // panel 3 — leather + stitch + A edge
  { label: "PARFUM", focalX: 0.44, focalY: 0.57, zoom: 2.3 }, // panel 4 — perfume spray
  { label: "EYES", focalX: 0.55, focalY: 0.75, zoom: 2.6 }, //  panel 5 — eyes
  { label: "AURELLE", focalX: 0.5, focalY: 0.93, zoom: 2.3 }, // panel 6 — the bag
] as const;

/* ─────────────────────────── timeline ─────────────────────────── */

/**
 * Contiguous section windows (start frame + length). Six acts; the AURELLE act is cut into
 * six restrained shots so it can breathe, then the hero freezes straight into the interrupt.
 */
export const S = {
  // ── Act 1 · AURELLE illusion (Voice 1) — freeze at 372 (12.4s) ──
  fragments: { from: 0, len: 66 }, //     0–66     No.01 fragments
  arrival: { from: 66, len: 66 }, //      66–132   paparazzi arrival + flashes
  clasp: { from: 132, len: 60 }, //       132–192  macro clasp + CLICK
  gallery: { from: 192, len: 60 }, //     192–252  colonnade tracking shot
  montage: { from: 252, len: 60 }, //     252–312  six percussive detail hits
  hero: { from: 312, len: 60 }, //        312–372  calm hero — freezes here
  // ── Act 2 · interruption (silence — no voice) ──
  interrupt: { from: 372, len: 78 }, //   372–450  frozen frame, silence, cursor, selection
  // ── Act 3 · deconstruction (quick, plain-language labels) ──
  deconstruct: { from: 450, len: 110 }, //450–560  layers → BRAND · CAMPAIGN · MOTION · COMMERCIAL
  // ── Act 4 · reveal ("doesn't exist" — compressed, moving thumbnails) ──
  reveal: { from: 560, len: 140 }, //     560–700  AURELLE / product / flagship / campaign
  // ── Act 5 · proof + brand (Shanair.AI enters ~0:24) ──
  proof: { from: 700, len: 150 }, //      700–850  process/proof + BUILT WITH SHANAIR.AI
  // ── Act 6 · the offer ── (launch-ready VO ~4.6s)
  offer: { from: 850, len: 160 }, //      850–1010 launch-ready commercials, established now
  // ── Act 7 · the industries ──
  industries: { from: 1010, len: 140 }, //1010–1150 restaurants · real estate · travel · beauty
  // ── Act 8 · Shanair.AI + CTA ──
  finale: { from: 1150, len: 200 }, //    1150–1350 brand reveal + CTA (long clean end hold)
} as const;

export type SectionKey = keyof typeof S;

/** The exact frame the campaign freezes and the music is cut — the hook (~0:17.3). */
export const FREEZE_FRAME = 372;
/** The hero push settles at this scale; the interrupt scene locks the plate here (invisible cut). */
export const HERO_END_SCALE = 1.12;
export const HERO_FOCAL = { x: 0.62, y: 0.4 } as const;

/* ─────────────────────────── copy ─────────────────────────── */

export const COPY = {
  house: "AURELLE",
  no01: "THE No. 01",
  season: "AUTUMN · WINTER 2026",
  montage: MONTAGE_HITS.map((h) => h.label),

  // Reveal ("doesn't exist")
  doesntExist: "DOESN'T EXIST.",
  flagship: "THE FLAGSHIP?",
  product: "THE PRODUCT?",
  campaign: "THE CAMPAIGN?",

  // Deconstruction — plain-language labels foregrounded over the code/timeline texture
  deconLabels: ["BRAND", "CAMPAIGN", "MOTION", "COMMERCIAL"],

  // Proof (Shanair.AI enters early)
  builtWith: "BUILT WITH SHANAIR.AI",
  builtWithSuffix: ".AI",

  // Offer
  offerLead: "LAUNCH-READY COMMERCIALS.",
  offerBody: "FOR BRANDS THAT NEED TO LOOK ESTABLISHED",
  offerNow: "NOW.",

  // Industries
  anyIndustry: "ANY INDUSTRY.",
  industries: [
    { label: "RESTAURANTS", tone: "warm" },
    { label: "REAL ESTATE", tone: "cool" },
    { label: "TRAVEL · HOSPITALITY", tone: "warm" },
    { label: "BEAUTY · BRANDS", tone: "warm" },
  ],

  // Finale
  withStack: ["WITH AI.", "CLAUDE CODE.", "REMOTION.", "AND CREATIVE DIRECTION."],
  unforgettable: ["LET'S MAKE YOUR BUSINESS", "UNFORGETTABLE."],
  brand: "Shanair.AI",
  brandSuffix: ".AI",
  services: "COMMERCIALS · BRAND CAMPAIGNS · AI-POWERED CREATIVE",
  // Contact: taken from the brand configuration (src/shanairai/brand.ts meta.url). Not invented.
  site: "shanair.ai",
  cta: "LET'S BUILD YOURS.",
} as const;

/* ─────────────────────────── type stacks ─────────────────────────── */

/** Font stacks loaded at entry via config/fonts/bootstrap — matched to the theme manifest. */
export const FONT = {
  /** Editorial high-contrast serif — the AURELLE / reveal display face. */
  serif: `"Playfair Display", "Georgia", serif`,
  /** Delicate serif — accents. */
  serifSoft: `"Cormorant Garamond", "Playfair Display", serif`,
  /** Modern sans — support copy. */
  sans: `"Poppins", "Helvetica Neue", Arial, sans-serif`,
  /** Spaced label sans — overlines, kickers, industry labels. */
  label: `"Jost", "Poppins", sans-serif`,
} as const;
