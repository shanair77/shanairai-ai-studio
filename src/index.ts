import "./config/fonts/bootstrap"; // Load all manifest fonts once, before the root registers.
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
