# conformi-search-mcp — runnable MCP server
# Builds without any secrets so registries (e.g. Glama) can start it and
# introspect its tools. CONFORMI_API_KEY is optional and only unlocks the
# metered search_eu_law tool at runtime.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json tsconfig.json ./
RUN npm install
COPY src ./src
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
# Optional: set CONFORMI_API_KEY to enable search_eu_law
# ENV CONFORMI_API_KEY=cfm_live_...
ENTRYPOINT ["node", "dist/index.js"]
