# "Postcards From..." — channel branding

The YouTube channel is **Postcards From...**. Each region is its own series on it ("Postcards From Africa" is the first), so the channel art stays location-neutral and only the banner's "Now showing" line and painted strip change per series.

| Asset | Choice | Files |
|---|---|---|
| **Profile picture** | **Stamp**: the traveler inside a postage stamp with a red postmark, on dark teal | `out/channel/PostcardsFrom-Icon-Stamp-800x800.png` (upload this) · `-98x98.png` (display size) · source `public/postcards/brand/icon-stamp.jpg` |
| **Banner** | "Postcards From..." · "Hand-painted travel journals, one place at a time" · "Now showing: Postcards From Africa", over the Morocco-to-Cape-Town painted strip | `out/channel/PostcardsFrom-Banner-2048x1152.jpg` · Remotion still `PostcardsChannelBanner` |
| Not used | Traveler and globe icons; the two Africa-shaped icons (kept as Africa series art, e.g. a playlist cover) | `public/postcards/brand/` |

**Uploading:** YouTube Studio → Customization → Branding → Picture (the 800×800 stamp) and Banner image. YouTube shows the picture as a 98×98 circle; the stamp keeps its frame and postmark inside that circle.

**A new series:** paint a new banner strip for the region (calm sky band in the middle third), save it to `public/postcards/brand/`, and change `background` and `series` on the `PostcardsChannelBanner` still in `src/Root.tsx`. The stamp stays.
