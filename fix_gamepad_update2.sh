#!/bin/bash
for file in src/scenes/*Scene.ts; do
  # Injeta no final da função update
  awk '/update\(\) {/{
    print
    f=1; next
  }
  /^    }$/ && f {
    print "        if (this.virtualGamepad) this.virtualGamepad.update();"
    print
    f=0; next
  }
  {print}' "$file" > tmp_file && mv tmp_file "$file"
done
