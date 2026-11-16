/**
 * Standalone entry for the story: `npx remotion render src/mouse/index.ts CountryMouseStory`.
 * Bundles only this composition, so it renders without the web fonts the other
 * compositions fetch at load time.
 */
import { registerRoot } from "remotion";
import { MouseRoot } from "./MouseRoot";

registerRoot(MouseRoot);
