# syntax=docker/dockerfile:1.7
# Build context = repository root (see railway.json)
FROM node:24-bookworm-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH CI=true
RUN npm i -g pnpm@11.25.0

FROM base AS build
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --filter @maf/api...
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter @maf/api build
RUN pnpm --filter @maf/api deploy --prod --legacy /out

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY --from=build --chown=node:node /out/node_modules ./node_modules
COPY --from=build --chown=node:node /out/dist ./dist
COPY --from=build --chown=node:node /out/drizzle ./drizzle
COPY --from=build --chown=node:node /out/assets ./assets
COPY --from=build --chown=node:node /out/package.json ./package.json
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
