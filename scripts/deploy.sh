#!/bin/sh
# Publish dist/ to the gh-pages branch (GitHub Pages serves it).
set -e
cd "$(dirname "$0")/.."
REMOTE=$(git remote get-url origin)
cd dist
rm -rf .git
git init -q -b gh-pages
git add -A
git commit -q -m "Deploy $(date +%Y-%m-%d)"
git push -f "$REMOTE" gh-pages
rm -rf .git
echo "Deployed to gh-pages"
