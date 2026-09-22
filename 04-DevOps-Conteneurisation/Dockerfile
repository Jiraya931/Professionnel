# ==============================================================================
# DOCKERFILE MULTI-STAGE POUR ENVIRONNEMENT DE PRODUCTION
# Auteur: Ababacar Ousmane Niang (Master 2 RESI)
# ==============================================================================

FROM alpine:3.19 AS base
RUN apk add --no-cache curl ca-certificates tzdata
ENV TZ=Africa/Dakar

# Stage de construction applicative
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Stage d'exécution léger et sécurisé (Non-root user)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Création d'un utilisateur non-privilégié pour le durcissement du conteneur
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

COPY --from=builder /app ./
RUN chown -R appuser:nodejs /app

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "index.js"]
