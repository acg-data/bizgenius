#!/usr/bin/env bash
set -euo pipefail
source .gitlab/scripts/common.sh
export NODE_VERSION=20
export CI_STEP_OUTPUT="$CI_TEMP_DIR/2.outputs"
: > "$CI_STEP_OUTPUT"
printf '%s\n' 'Run npm audit'
bash "$CI_PROJECT_DIR/.gitlab/scripts/ci--security--2.sh"
ci_outputs "$CI_STEP_OUTPUT" CI_OUT_2_
