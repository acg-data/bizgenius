#!/usr/bin/env bash
set -euo pipefail
source .gitlab/scripts/common.sh
for part in backend frontend; do
  [[ -f "$part/Dockerfile" ]] || { echo "Recovered source does not contain $part/Dockerfile. The original image workflow was already broken; restore its source before deployment." >&2; exit 1; }
done
printf '%s' "$CI_REGISTRY_PASSWORD" | docker login "$CI_REGISTRY" --username "$CI_REGISTRY_USER" --password-stdin
for part in backend frontend; do
  args=()
  if [[ "$part" = frontend ]]; then args+=(--build-arg "VITE_API_BASE_URL=${VITE_API_BASE_URL:-}"); fi
  docker buildx build --push --cache-from "type=registry,ref=$CI_REGISTRY_IMAGE/$part:buildcache" --cache-to "type=registry,ref=$CI_REGISTRY_IMAGE/$part:buildcache,mode=max" \
    --tag "$CI_REGISTRY_IMAGE/$part:$CI_COMMIT_SHA" --tag "$CI_REGISTRY_IMAGE/$part:$CI_COMMIT_REF_SLUG" "${args[@]}" "$part"
done
