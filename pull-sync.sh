#!/bin/bash

# Auto-pull from GitHub every 10 seconds
echo "[Auto-sync] Starting auto-pull from GitHub..."
while true; do
  git pull origin master || echo "[Auto-sync] Merge conflict or pull error! Manual resolution may be needed."
  sleep 600
done 