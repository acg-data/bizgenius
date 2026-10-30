# GitLab CI recovery

The recovered GitHub Actions workflows now have native jobs in `.gitlab/ci/` and shell steps in `.gitlab/scripts/`.
Pushes and merge requests run the original checks. In Build â†’ Pipelines â†’ New pipeline, select the `workflow` input to run a particular former manual workflow. Its other inputs appear in the same form.

## Release activation

Publishing and operational write jobs are manual during recovery. This avoids deploying recovered source over newer live releases before provider variables and source drift are reconciled. The job keeps the original branch and input restrictions.
A green build alone does not mean a deployment occurred. Read the publish job result and provider deployment record.

## Variables

Restore the following names under Settings â†’ CI/CD â†’ Variables. Use masked values for secrets and protect write credentials. Secret values could not be exported from the suspended GitHub account.

- `DIGITALOCEAN_ACCESS_TOKEN`
- `DIGITALOCEAN_APP_ID_PRODUCTION`
- `DIGITALOCEAN_APP_ID_STAGING`
- `VITE_API_BASE_URL`

Images use the GitLab registry and built-in CI registry credentials. Deployment mirrors the exact GitLab image tag into the existing DigitalOcean Container Registry using `DIGITALOCEAN_ACCESS_TOKEN`; App Platform does not support pulling directly from GitLab registry. No paid registry is created automatically. The recovered default branch lacks both Dockerfiles referenced by the original workflow; image publication fails clearly until that source is restored. No replacement backend was invented.
