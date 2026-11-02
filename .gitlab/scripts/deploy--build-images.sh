#!/usr/bin/env bash
set -euo pipefail
source .gitlab/scripts/common.sh
export INPUT_ENVIRONMENT="${INPUT_ENVIRONMENT:-staging}"
case "$INPUT_ENVIRONMENT" in staging|production) ;; *) echo 'Invalid environment for deploy' >&2; exit 1 ;; esac
mkdir -p .ci-results
: > .ci-results/deploy--build-images.env
printf '%s=%s\n' CI_NEED_deploy_build_images_backend_image "${CI_OUT_meta_backend_tags:-}" >> .ci-results/deploy--build-images.env
printf '%s=%s\n' CI_NEED_deploy_build_images_frontend_image "${CI_OUT_meta_frontend_tags:-}" >> .ci-results/deploy--build-images.env
