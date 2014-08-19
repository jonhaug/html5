#!/bin/bash


grep -E 'href *= *.*(jpg|png)' index.html | sed -e "s|.*href *= *.\([^'\"]*\).*|\1|" | while read file; do
  SIZE=$(convert "$file" -verbose /dev/null 2>&1 | sed -e 's|.*dev/null *[^ ]* *\([^ ]*\).*|\1|')
  BYTES=$(ls -l "$file" | awk '{print $6}')
  printf "%15s %15s %s\n" "$SIZE" "$BYTES" "$file"
done
