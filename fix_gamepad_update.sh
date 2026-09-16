#!/bin/bash
for file in src/scenes/*Scene.ts; do
  # Remove the call from anywhere it might be
  sed -i '/if (this.virtualGamepad) this.virtualGamepad.update();/d' "$file"
done
