#!/bin/bash
# Mux each vNN-*.mp4 with its matching .wav into final/<name>.mp4 (AAC 192k).
set -e
cd "$(dirname "$0")"
FF=/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2
mkdir -p final
for v in v[0-9][0-9]-*.mp4; do
  name="${v%.mp4}"
  [ -f "$name.wav" ] || { echo "skip $name (no wav)"; continue; }
  $FF -y -i "$v" -i "$name.wav" -c:v copy -c:a aac -b:a 192k -shortest \
     -movflags +faststart "final/$name.mp4" 2>/dev/null
  echo "muxed final/$name.mp4"
done
ls -la final/
