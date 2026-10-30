#!/usr/bin/env bash
set -euo pipefail
source .gitlab/scripts/common.sh
export NODE_VERSION=20
export CI_STEP_OUTPUT="$CI_TEMP_DIR/2.outputs"
: > "$CI_STEP_OUTPUT"
printf '%s\n' 'Install dependencies'
bash "$CI_PROJECT_DIR/.gitlab/scripts/ci--frontend-test--2.sh"
ci_outputs "$CI_STEP_OUTPUT" CI_OUT_2_
export CI_STEP_OUTPUT="$CI_TEMP_DIR/3.outputs"
: > "$CI_STEP_OUTPUT"
printf '%s\n' 'Run linting'
bash "$CI_PROJECT_DIR/.gitlab/scripts/ci--frontend-test--3.sh"
ci_outputs "$CI_STEP_OUTPUT" CI_OUT_3_
export CI_STEP_OUTPUT="$CI_TEMP_DIR/4.outputs"
: > "$CI_STEP_OUTPUT"
printf '%s\n' 'Run type checking'
bash "$CI_PROJECT_DIR/.gitlab/scripts/ci--frontend-test--4.sh"
ci_outputs "$CI_STEP_OUTPUT" CI_OUT_4_
export CI_STEP_OUTPUT="$CI_TEMP_DIR/5.outputs"
: > "$CI_STEP_OUTPUT"
printf '%s\n' 'Run tests'
bash "$CI_PROJECT_DIR/.gitlab/scripts/ci--frontend-test--5.sh"
ci_outputs "$CI_STEP_OUTPUT" CI_OUT_5_
export CI_STEP_OUTPUT="$CI_TEMP_DIR/6.outputs"
: > "$CI_STEP_OUTPUT"
printf '%s\n' 'Run tests with coverage'
bash "$CI_PROJECT_DIR/.gitlab/scripts/ci--frontend-test--6.sh"
ci_outputs "$CI_STEP_OUTPUT" CI_OUT_6_
