/**
 * Standalone entry for the kids' stories:
 *   npx remotion render src/kids/index.ts <StoryId> out/<StoryId>.mp4
 *   npx remotion still  src/kids/index.ts <StoryId>Thumbnail out/<StoryId>-thumb.png
 * Bundles only the kids' compositions, so it renders without the web fonts the
 * other compositions fetch.
 */
import { registerRoot } from "remotion";
import { KidsCompositions } from "./KidsCompositions";

registerRoot(KidsCompositions);
