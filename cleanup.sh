
#!/bin/bash

echo "🧹 Starting EvoWell File Structure Consolidation..."

# Directories to consolidate into src/
DIRS=("components" "views" "services" "hooks" "contexts" "utils" "styles" "config" "layouts")

# Ensure src exists
mkdir -p src

for dir in "${DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo "Processing directory: $dir"
    mkdir -p "src/$dir"
    # Merge content: copy files from root/$dir to src/$dir, respecting existing files in src (no overwrite)
    # -r = recursive, -n = no clobber
    cp -rn "$dir/." "src/$dir/" 2>/dev/null
    
    # Remove the root directory
    rm -rf "$dir"
    echo "  Merged and removed root/$dir"
  fi
done

# Files to move/delete
FILES=("App.tsx" "index.tsx" "types.ts")

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    if [ -f "src/$file" ]; then
      echo "Removing duplicate file: $file (src version retained)"
      rm "$file"
    else
      echo "Moving unique file to src: $file"
      mv "$file" "src/"
    fi
  fi
done

echo "✅ Cleanup Complete. Project structure consolidated to src/."
