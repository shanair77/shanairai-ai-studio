/** YouTube thumbnail for "The Country Mouse and the City Mouse". */

import React from "react";
import { C, Cake, Cheese, Jelly, Meadow, Skyline, ThumbnailFrame } from "../kids/kit";
import { Mouse } from "./Characters";

export const CountryMouseThumbnail: React.FC = () => (
  <ThumbnailFrame lines={[{ en: "Country Mouse", es: "Ratón de Campo" }, { en: "& City Mouse", es: "y Ratón de Ciudad" }]} colors={[C.leafDark, C.lavenderDark]} side="top">
    <Meadow treeX={null}>
      {/* the city peeks in on the right half */}
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", opacity: 0.9 }}>
        <Skyline offsetX={1150} />
      </svg>
      <Cheese x={960} y={1010} size={210} />
      <Cake x={1150} y={1010} size={190} />
      <Jelly x={790} y={1010} size={170} />
      <Mouse kind="country" x={430} y={1060} size={520} wave />
      <Mouse kind="city" flip x={1520} y={1060} size={520} mouthOpen={1} />
    </Meadow>
  </ThumbnailFrame>
);
