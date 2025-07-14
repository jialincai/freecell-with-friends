# # Base image for all stages
# FROM node:20-alpine AS base
# EXPOSE 3000
# ENV PORT=3000

# FROM base AS deps
# RUN apk add --no-cache g++ make py3-pip libc6-compat
# WORKDIR /freecell-phaser
# COPY package*.json ./
# RUN npm ci


# # Build stage
# FROM base AS builder
# COPY --from=deps /freecell-phaser/node_modules ./node_modules
# COPY . .
# RUN npm run build

# # Production stage
# FROM base AS runner
# ENV NODE_ENV=production

# RUN addgroup -g 1001 -S freecell && \
#     adduser -u 1001 -S freecell -G freecell
# USER freecell

# # Copy public assets
# COPY --from=builder --chown=freecell:freecell /freecell-phaser/public ./public

# # Copy standalone server and static files
# COPY --from=builder --chown=freecell:freecell /freecell-phaser/.next/standalone ./
# COPY --from=builder --chown=freecell:freecell /freecell-phaser/.next/static ./.next/static

# # Start the standalone server
# ENV HOSTNAME="0.0.0.0"
# CMD ["node", "server.js"]

# # Development stage
# FROM base AS dev
# ENV NODE_ENV=development
# COPY --from=deps /freecell-phaser/node_modules ./node_modules
# COPY . .
# CMD ["npm", "run", "dev"]
