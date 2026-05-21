#!/bin/bash
# Script to merge all PRs without conflict
git fetch origin
prs=$(git ls-remote origin 'refs/pull/*/head' | awk '{print $2}' | grep -oE '[0-9]+')
for pr in $prs; do
  echo "Attempting to merge PR $pr"
  git fetch origin pull/$pr/head:pr-$pr
  # we want to merge but abort on conflict or without deleting features
  # --no-commit --no-ff
  if git merge --no-edit pr-$pr --allow-unrelated-histories; then
    echo "Merged PR $pr"
  else
    echo "Conflict or error on PR $pr, aborting merge."
    git merge --abort
  fi
done
