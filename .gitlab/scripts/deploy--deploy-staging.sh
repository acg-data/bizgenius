#!/usr/bin/env bash
set -euo pipefail
source .gitlab/scripts/common.sh
export INPUT_ENVIRONMENT="${INPUT_ENVIRONMENT:-staging}"
case "$INPUT_ENVIRONMENT" in staging|production) ;; *) echo 'Invalid environment for deploy' >&2; exit 1 ;; esac
if ! { [[ "${CI_SOURCE_REF:-}" = refs/heads/main ]] || [[ "${INPUT_ENVIRONMENT:-}" = staging ]]; }; then echo 'Original deploy:deploy-staging condition is false; no action taken.'; exit 0; fi
export CI_STEP_OUTPUT="$CI_TEMP_DIR/2.outputs"
: > "$CI_STEP_OUTPUT"
printf '%s\n' 'Deploy to App Platform'
bash "$CI_PROJECT_DIR/.gitlab/scripts/deploy--deploy-staging--2.sh"
ci_outputs "$CI_STEP_OUTPUT" CI_OUT_2_
