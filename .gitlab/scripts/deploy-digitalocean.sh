#!/usr/bin/env bash
set -euo pipefail
source .gitlab/scripts/common.sh
[[ "$CI_COMMIT_BRANCH" = "$CI_DEFAULT_BRANCH" ]] || { echo 'Deployments require the default branch.' >&2; exit 1; }
ci_require DIGITALOCEAN_ACCESS_TOKEN
case "$1" in staging) export APP_ID="${DIGITALOCEAN_APP_ID_STAGING:?Missing staging app ID}" ;; production) export APP_ID="${DIGITALOCEAN_APP_ID_PRODUCTION:?Missing production app ID}" ;; *) exit 1 ;; esac
node .gitlab/scripts/deploy-digitalocean.mjs
