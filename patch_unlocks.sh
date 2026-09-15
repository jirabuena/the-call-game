#!/bin/bash
for file in /app/src/scenes/*Scene.ts; do
    if [[ "$file" == *"BootScene"* ]] || [[ "$file" == *"MainMenuScene"* ]] || [[ "$file" == *"ChapterSelectScene"* ]]; then
        continue
    fi
    
    # Whenever we set state.currentChapter = X, we should also check unlockedChapter
    # We can inject a utility call or just regex replace
    sed -i 's/state.currentChapter = \([0-9]*\);/state.currentChapter = \1;\n                if (\1 > state.unlockedChapter) state.unlockedChapter = \1;/g' "$file"
done
