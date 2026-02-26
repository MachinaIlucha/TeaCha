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

fix_astro() {
  local file="$1"

  local tmp
  tmp="$(mktemp)"

  awk -v HEADER="$HEADER_JS" '
    function is_blank(s) { return s ~ /^[[:space:]]*$/ }
    function is_delim(s) { return s ~ /^[[:space:]]*---[[:space:]]*$/ }
    function starts_comment(s) { return s ~ /^[[:space:]]*\/\*/ }
    function strip_bom(s) { sub(/^\xef\xbb\xbf/, "", s); return s }

    function block_has_teacha(arr, from, to, i) {
      for (i = from; i <= to; i++) {
        if (arr[i] ~ /TeaCha website/) return 1
      }
      return 0
    }

    function skip_leading_teacha_comment(arr, n, pos, j) {
      if (!starts_comment(arr[pos])) return pos
      j = pos
      while (j <= n) {
        if (arr[j] ~ /\*\//) break
        j++
      }
      if (j > n) return pos
      if (!block_has_teacha(arr, pos, j)) return pos

      j++
      while (j <= n && is_blank(arr[j])) j++
      return j
    }

    function filter_teacha_blocks(arr, from, to, out, i, j, k, has, count) {
      count = 0
      i = from
      while (i <= to) {
        if (starts_comment(arr[i])) {
          j = i
          while (j <= to) {
            if (arr[j] ~ /\*\//) break
            j++
          }
          if (j <= to) {
            has = 0
            for (k = i; k <= j; k++) {
              if (arr[k] ~ /TeaCha website/) {
                has = 1
                break
              }
            }
            if (has) {
              i = j + 1
              while (i <= to && is_blank(arr[i])) i++
              continue
            }
          }
        }

        out[++count] = arr[i]
        i++
      }

      while (count > 0 && is_blank(out[1])) {
        for (i = 1; i < count; i++) out[i] = out[i + 1]
        delete out[count]
        count--
      }

      return count
    }

    BEGIN { n=0 }

    {
      line=$0
      if (NR==1) line = strip_bom(line)
      lines[++n]=line
    }

    END {
      if (n == 0) {
        print "---"
        print HEADER "\n"
        print "---"
        exit
      }

      i = 1
      while (i <= n && is_blank(lines[i])) i++
      i = skip_leading_teacha_comment(lines, n, i)
      while (i <= n && is_blank(lines[i])) i++

      if (i <= n && is_delim(lines[i])) {
        fm_end = 0
        for (j = i + 1; j <= n; j++) {
          if (is_delim(lines[j])) {
            fm_end = j
            break
          }
        }

        if (fm_end > 0) {
          print lines[i]
          print HEADER "\n"

          fm_count = filter_teacha_blocks(lines, i + 1, fm_end - 1, fm)
          for (k = 1; k <= fm_count; k++) print fm[k]

          print lines[fm_end]
          for (k = fm_end + 1; k <= n; k++) print lines[k]
          exit
        }
      }

      # no frontmatter: create it
      print "---"
      print HEADER "\n"
      print "---"
      for (k=i; k<=n; k++) print lines[k]
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
    function starts_comment(s) { return s ~ /^[[:space:]]*\/\*/ }
    function strip_bom(s) { sub(/^\xef\xbb\xbf/, "", s); return s }

    BEGIN { n=0 }
    {
      line=$0
      if (NR==1) line = strip_bom(line)
      lines[++n]=line
    }

    END {
      i = 1
      while (i <= n && is_blank(lines[i])) i++

      # Remove one or more leading TeaCha comment blocks.
      while (i <= n && starts_comment(lines[i])) {
        j = i
        while (j <= n) {
          if (lines[j] ~ /\*\//) break
          j++
        }

        if (j > n) break

        has = 0
        for (k = i; k <= j; k++) {
          if (lines[k] ~ /TeaCha website/) {
            has = 1
            break
          }
        }

        if (!has) break

        i = j + 1
        while (i <= n && is_blank(lines[i])) i++
      }

      print HEADER "\n"
      for (k = i; k <= n; k++) print lines[k]
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
