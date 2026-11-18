#!/usr/bin/env bash
# Upload a rendered kids' story and its thumbnail to Cloudinary (unsigned preset),
# and print the two public URLs as JSON for the Make "Kids Stories → YouTube (Private)"
# scenario.
#
#   scripts/kids-publish.sh <slug> out/<StoryId>.mp4 out/<StoryId>-thumb.jpg
#
# The preset only allows creating new files, so each run gets a date-stamped id.
set -euo pipefail

CLOUD="${KIDS_CLOUDINARY_CLOUD:-dyyjx7cro}"
PRESET="${KIDS_CLOUDINARY_PRESET:-kids-stories-x7k2}"
slug="$1"; video="$2"; thumb="$3"
stamp="$(date -u +%Y%m%d-%H%M)"

upload() { # <resource_type> <file> <public_id>
  local out
  out="$(curl -sS --fail-with-body --retry 3 --max-time 600 -X POST \
    "https://api.cloudinary.com/v1_1/${CLOUD}/$1/upload" \
    -F "upload_preset=${PRESET}" -F "public_id=$3" -F "file=@$2")"
  python3 -c 'import json,sys; d=json.loads(sys.argv[1]); print(d["secure_url"])' "$out"
}

video_url="$(upload video "$video" "${slug}-${stamp}")"
thumb_url="$(upload image "$thumb" "${slug}-${stamp}-thumb")"
printf '{"video_url": "%s", "thumbnail_url": "%s"}\n' "$video_url" "$thumb_url"
