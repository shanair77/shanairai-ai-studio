/**
 * Season line-ups for the long-form (open journal) YouTube videos. Season 1 is the whole
 * Africa run, from Morocco to the Cape (Cape Town is its finale): add each new Africa episode here, in travel order, and it joins the season
 * video. Every episode also stays a standalone vertical Short.
 */

import { CAPE_TOWN } from "./cape-town";
import { EGYPT } from "./egypt";
import { MOROCCO } from "./morocco";
import { NAMIBIA } from "./namibia";
import { OKAVANGO } from "./okavango";
import { TANZANIA } from "./tanzania";
import type { Episode } from "./types";
import { VICTORIA_FALLS } from "./victoria-falls";

export const SEASON_1: Episode[] = [MOROCCO, EGYPT, TANZANIA, VICTORIA_FALLS, OKAVANGO, NAMIBIA, CAPE_TOWN];
