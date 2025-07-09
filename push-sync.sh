#!/bin/bash

# Auto-push local changes to GitHub on file change
REPO_DIR="$(pwd)"

if command -v fswatch >/dev/null 2>&1; then
  echo "[Auto-sync] Using fswatch for real-time sync."
  fswatch -o "$REPO_DIR" | while read f; do
    git add .
    git commit -m "Auto-sync: local changes" --allow-empty
    git push origin master
  done
else
  echo "[Auto-sync] fswatch not found. Using 10s polling. (Install fswatch for real-time sync)"
  while true; do
    git add .
    git commit -m "Auto-sync: local changes" --allow-empty
    git push origin master
    sleep 600
  done
fi 