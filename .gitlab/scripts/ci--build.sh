#!/usr/bin/env bash
set -euo pipefail
source .gitlab/scripts/common.sh
export NODE_VERSION=20
export CI_STEP_OUTPUT="$CI_TEMP_DIR/2.outputs"
: > "$CI_STEP_OUTPUT"
printf '%s\n' 'Install frontend dependencies'
bash "$CI_PROJECT_DIR/.gitlab/scripts/ci--build--2.sh"
ci_outputs "$CI_STEP_OUTPUT" CI_OUT_2_
export CI_STEP_OUTPUT="$CI_TEMP_DIR/3.outputs"
: > "$CI_STEP_OUTPUT"
printf '%s\n' 'Build frontend'
bash "$CI_PROJECT_DIR/.gitlab/scripts/ci--build--3.sh"
ci_outputs "$CI_STEP_OUTPUT" CI_OUT_3_
