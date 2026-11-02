#!/usr/bin/env bash
set -euo pipefail
source "$CI_PROJECT_DIR/.gitlab/scripts/common.sh"
cd "$CI_PROJECT_DIR"/.
doctl apps create-deployment ${DIGITALOCEAN_APP_ID_STAGING:-} --wait
