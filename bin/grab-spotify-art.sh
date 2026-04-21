#!/bin/bash
#
# grab-spotify-art.sh - a script for downloading artist images from spotify
#
# usage:
#   grab-spotify-art.sh <artist name|spotify artist url>

INPUT="$1"

fail() { echo "Error: $@" >&2; exit 1; }

if [[ "$INPUT" == *spotify.com/artist/* ]]; then
    URL="$INPUT"
else
    ENCODED=$(perl -MURI::Escape -e 'print uri_escape($ARGV[0]), "\n"' "$INPUT")

    MBID=$(curl -s "https://musicbrainz.org/ws/2/artist/?query=artist:${ENCODED}&limit=1&fmt=json" \
        | grep -oP '"id"\s*:\s*"\K[0-9a-f-]{36}' | head -1)

    [[ -z "$MBID" ]] && fail "Could not find artist '$INPUT' on MusicBrainz."

    URL=$(curl -s "https://musicbrainz.org/ws/2/artist/${MBID}?inc=url-rels&fmt=json" \
        | grep -oP 'https://open\.spotify\.com/artist/[A-Za-z0-9]+' | head -1)

    [[ -z "$URL" ]] && fail "No Spotify link found for '$INPUT' in MusicBrainz."
fi

CONTENT=$(curl -s "$URL" | perl -pe 's/</\n</g' | grep 'meta')
NAME=$(echo "$CONTENT" | grep 'og:title' | awk -F'"' '{print $4}')
IMAGE=$(echo "$CONTENT" | grep 'og:image' | awk -F'"' '{print $4}')

[[ -z "$IMAGE" ]] && fail "Could not find image on Spotify page."

echo "Resolved: $URL"
echo "Artist:   $NAME"
echo "Image:    $IMAGE"

curl -o "${NAME}.jpg" "$IMAGE"
feh "${NAME}.jpg"
