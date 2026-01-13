#!/usr/bin/env bash
set -euo pipefail

HEADER='/**
 * TeaCha website
 * Design & development: Ілля Пінчук Вадимович
 * © 2026. All rights reserved.
 */'

TARGET_DIRS=("public" "src")
EXTENSIONS=("js" "scss" "astro")

for dir in "${TARGET_DIRS[@]}"; do
  [ -d "$dir" ] || continue

  find "$dir" -type f \( \
    $(printf -- '-name "*.%s" -o ' "${EXTENSIONS[@]}" | sed 's/ -o $//') \
  \) | while read -r file; do

    if head -n 5 "$file" | grep -Fq "TeaCha website"; then
      continue
    fi

    tmp="$(mktemp)"
    {
      printf "%s\n\n" "$HEADER"
      cat "$file"
    } > "$tmp"

    mv "$tmp" "$file"
  done
done
