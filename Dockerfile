# Not currently used — the app is deployed on Vercel, so containerizing it isn't
# needed for deployment. Kept as scaffolding in case we ever want dev-environment
# parity (matching Node/native-dep versions) or a non-Vercel deployment target.
# The "app" service in docker-compose.yml that would build this is disabled too.

# FROM node:20-alpine AS base
# EXPOSE 3000
# ENV PORT=3000

# FROM base AS deps
# WORKDIR /app
# # g++/make/py3-pip/libc6-compat: needed to compile native npm deps on alpine
# RUN apk add --no-cache g++ make py3-pip libc6-compat
# COPY package*.json ./
# RUN npm ci

# FROM base AS builder
# WORKDIR /app
# COPY --from=deps /app/node_modules ./node_modules
# COPY . .
# RUN npm run build

# FROM base AS runner
# WORKDIR /app
# ENV NODE_ENV=production
# RUN addgroup -g 1001 -S freecell && \
#     adduser -u 1001 -S freecell -G freecell
# USER freecell
# COPY --from=builder --chown=freecell:freecell /app/public ./public
# COPY --from=builder --chown=freecell:freecell /app/.next/standalone ./
# COPY --from=builder --chown=freecell:freecell /app/.next/static ./.next/static
# ENV HOSTNAME="0.0.0.0"
# CMD ["node", "server.js"]

# FROM base AS dev
# WORKDIR /app
# ENV NODE_ENV=development
# COPY --from=deps /app/node_modules ./node_modules
# COPY . .
# CMD ["npm", "run", "dev"]
