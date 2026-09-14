/**
 * aurelle/media — the still→video swap layer.
 *
 * The 13 supplied PNGs are MASTER VISUAL REFERENCES; the finished commercial is cut from
 * image-to-video CLIPS generated from them. This registry is the single source of truth that
 * maps each logical shot slot to BOTH its master still and the MP4 that will replace it. The
 * `<Plate>` / `<DetailPlate>` components (primitives.tsx) resolve a slot through here: if the
 * slot's clip is present (see videoManifest), they render real footage; otherwise they render
 * the still with the editorial camera move as a faithful placeholder.
 *
 * Adding footage never touches the edit: drop `NN-name.mp4` into public/aurelle/video/, run
 * `npm run aurelle:scan-video`, and that shot becomes live cinematography in place.
 */

import { A } from "./config";
import { PRESENT_VIDEOS } from "./videoManifest";

/** Folder (under public/) that holds the generated clips. */
export const VIDEO_DIR = "aurelle/video";

export type MediaSlot =
  | "product" //      01 — master handbag, product cinematography
  | "arrival" //      02 — the paparazzi arrival (event footage)
  | "clasp" //        03 — the clasp micro-action + CLICK
  | "walk" //         04 — the colonnade walk (subject + camera track)
  | "gold" //         05a — cuff / jewellery reflection
  | "heel" //         05b — the footfall
  | "stitch" //       05c — leather + stitch macro
  | "parfum" //       05d — the fragrance mist
  | "eyes" //         05e — natural eye movement / blink
  | "montageIcon" //  05f — product highlight
  | "hero" //         06 — the calm hero (restrained, freezes at 0:15)
  | "beauty" //       07 — living beauty film
  | "icon" //         08 — icon product (mostly Remotion-driven after)
  | "flagship" //     09 — the flagship storefront (environmental motion)
  | "restaurant" //   10 — plating / steam / room
  | "realEstate" //   11 — couple walks, water + reflections move
  | "travel" //       12 — terrace reveal toward the sea
  | "founder"; //     13 — the beauty founder

type SlotDef = { still: string; video: string };

/** slot → { master still, target clip filename }. Filenames follow the agreed video architecture. */
export const MEDIA: Record<MediaSlot, SlotDef> = {
  product: { still: A.handbag, video: "01-product.mp4" },
  arrival: { still: A.arrival, video: "02-arrival.mp4" },
  clasp: { still: A.clasp, video: "03-clasp.mp4" },
  walk: { still: A.gallery, video: "04-walk.mp4" },
  // Each detail hit is its OWN shot. Placeholders are the six panels sliced from the storyboard
  // contact sheet (05); drop a real per-hit clip into public/aurelle/video to replace one.
  gold: { still: "aurelle/05-hits/01-gold.png", video: "05-gold.mp4" },
  heel: { still: "aurelle/05-hits/02-heel.png", video: "05-heel.mp4" },
  stitch: { still: "aurelle/05-hits/03-stitch.png", video: "05-stitch.mp4" },
  parfum: { still: "aurelle/05-hits/04-parfum.png", video: "05-parfum.mp4" },
  eyes: { still: "aurelle/05-hits/05-eyes.png", video: "05-eyes.mp4" },
  montageIcon: { still: "aurelle/05-hits/06-no01.png", video: "05-icon.mp4" },
  hero: { still: A.hero, video: "06-hero.mp4" },
  beauty: { still: A.beauty, video: "07-beauty.mp4" },
  icon: { still: A.icon, video: "08-icon.mp4" },
  flagship: { still: A.flagship, video: "09-flagship.mp4" },
  restaurant: { still: A.restaurant, video: "10-restaurant.mp4" },
  realEstate: { still: A.realEstate, video: "11-real-estate.mp4" },
  travel: { still: A.travel, video: "12-travel.mp4" },
  founder: { still: A.founder, video: "13-beauty-founder.mp4" },
};

/** True once the slot's clip has been dropped in and the manifest rescanned. */
export const hasVideo = (slot: MediaSlot): boolean => PRESENT_VIDEOS.includes(MEDIA[slot].video);

/** The master still for a slot (always available — the placeholder / fallback). */
export const slotStill = (slot: MediaSlot): string => MEDIA[slot].still;

/** The staticFile-relative path to a slot's clip. */
export const slotVideo = (slot: MediaSlot): string => `${VIDEO_DIR}/${MEDIA[slot].video}`;
