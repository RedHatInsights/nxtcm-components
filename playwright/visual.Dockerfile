FROM docker.io/library/node:26.8.1-bookworm-slim AS node
FROM mcr.microsoft.com/playwright:v1.62.1-noble

# Use the same Node runtime locally and in CI, satisfying package.json engines.
COPY --from=node /usr/local/ /usr/local/
WORKDIR /work
COPY package.json package-lock.json ./
COPY packages/nxtcm-dashboard/package.json packages/nxtcm-dashboard/package.json
COPY packages/nxtcm-rosa-hcp-wizard/package.json packages/nxtcm-rosa-hcp-wizard/package.json
RUN npm ci --no-audit --no-fund && chmod -R a+rwX /work
# Keep the checkout writable for a host UID, without copying host dependencies.
COPY --chmod=0777 . .
ENV HOME=/tmp/visual-home
ENV npm_config_cache=/tmp/npm-cache
CMD ["node", "scripts/run-visual-tests.mjs", "--inside-container"]
