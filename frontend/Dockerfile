# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm || { echo "Failed to install pnpm"; exit 1; }

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile || { echo "Failed to install dependencies"; exit 1; }

# Copy source code
COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_FRONTEND_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_FRONTEND_URL=$NEXT_PUBLIC_FRONTEND_URL

RUN pnpm run build || { echo "Failed to build Next.js app"; exit 1; }

# Verify .next exists
RUN test -d /app/.next || { echo "ERROR: .next directory not found after build"; ls -la /app/; exit 1; }

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install pnpm in the runtime image as well
RUN npm install -g pnpm || { echo "Failed to install pnpm in runtime"; exit 1; }

# Copy necessary files from builder
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Verify files were copied
RUN test -d /app/.next || { echo "ERROR: .next missing in production image"; ls -la /app/ || echo "Cannot list /app"; exit 1; }
RUN test -d /app/node_modules || { echo "ERROR: node_modules missing in production image"; exit 1; }

EXPOSE 3001

CMD ["pnpm", "start"]
