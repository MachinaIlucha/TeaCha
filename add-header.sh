#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
TARGET_DIRS=("$ROOT/public" "$ROOT/src")

HEADER_JS='/**
 * TeaCha website
 * Design & development: Ілля Пінчук Вадимович
 * © 2026. All rights reserved.
 */'

# CSS/SCSS: /*! ... */ часто сохраняется минификаторами
HEADER_CSS='/*!
 * TeaCha website
 * Design & development: Ілля Пінчук Вадимович
 * © 2026. All rights reserved.
 */'

is_astros_header_inside_frontmatter() {
  local file="$1"
  awk '
    BEGIN { fm=0; started=0 }
    NR==1 { sub(/^\xef\xbb\xbf/, "", $0) }
    {
      if (!started && $0 ~ /^[[:space:]]*---[[:space:]]*$/) { fm=1; started=1; next }
      if (fm && $0 ~ /^[[:space:]]*---[[:space:]]*$/) { exit }
      if (fm && $0 ~ /TeaCha website/) { print "yes"; exit }
    }
  ' "$file"
}

fix_astro() {
  local file="$1"

  if [[ "$(is_astros_header_inside_frontmatter "$file" || true)" == "yes" ]]; then
    return 0
  fi

  local tmp
  tmp="$(mktemp)"

  awk -v HEADER="$HEADER_JS" '
    function is_blank(s) { return s ~ /^[[:space:]]*$/ }
    function is_delim(s) { return s ~ /^[[:space:]]*---[[:space:]]*$/ }

    BEGIN { n=0 }

    {
      line=$0
      if (NR==1) sub(/^\xef\xbb\xbf/, "", line)
      lines[++n]=line
    }

    END {
      i=1

      # remove leading header block if it contains "TeaCha website"
      if (i <= n && lines[i] ~ /^[[:space:]]*\/\*\*!?/ ) {
        start=i
        found=0
        j=i
        while (j <= n) {
          if (lines[j] ~ /TeaCha website/) found=1
          if (lines[j] ~ /\*\//) { end=j; break }
          j++
        }
        if (found && end > 0) {
          i=end+1
          while (i <= n && is_blank(lines[i])) i++
        }
      }

      if (i <= n && is_delim(lines[i])) {
        # has frontmatter: insert header right after opening ---
        print lines[i]
        print HEADER "\n"
        for (k=i+1; k<=n; k++) print lines[k]
      } else {
        # no frontmatter: create it
        print "---"
        print HEADER "\n"
        print "---"
        for (k=i; k<=n; k++) print lines[k]
      }
    }
  ' "$file" > "$tmp"

  mv "$tmp" "$file"
  echo "ASTRO fixed: ${file#$ROOT/}"
}

fix_scss() {
  local file="$1"
  local tmp
  tmp="$(mktemp)"

  awk -v HEADER="$HEADER_CSS" '
    function is_blank(s) { return s ~ /^[[:space:]]*$/ }

    BEGIN { n=0 }
    {
      line=$0
      if (NR==1) sub(/^\xef\xbb\xbf/, "", line)
      lines[++n]=line
    }

    END {
      # If header exists near top, normalize /** -> /*! if needed
      has=0
      for (i=1; i<=n && i<=30; i++) {
        if (lines[i] ~ /TeaCha website/) { has=1; break }
      }

      if (has) {
        if (lines[1] ~ /^[[:space:]]*\/\*\*/ ) {
          sub(/\/\*\*/, "/*!", lines[1])
        }
        for (i=1; i<=n; i++) print lines[i]
        exit
      }

      # else prepend CSS header + blank line
      print HEADER "\n"
      for (i=1; i<=n; i++) print lines[i]
    }
  ' "$file" > "$tmp"

  mv "$tmp" "$file"
  echo "SCSS fixed: ${file#$ROOT/}"
}

scan_and_fix() {
  local dir="$1"
  [[ -d "$dir" ]] || return 0

  find "$dir" -type f \( -iname '*.astro' -o -iname '*.scss' \) -print0 |
  while IFS= read -r -d '' file; do
    case "${file,,}" in
      *.astro) fix_astro "$file" ;;
      *.scss)  fix_scss "$file" ;;
    esac
  done
}

for d in "${TARGET_DIRS[@]}"; do
  scan_and_fix "$d"
done

echo "Done."
