# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm || { echo "Failed to install pnpm"; exit 1; }

# Copy package files AND prisma config (required by Prisma 7)
COPY package.json pnpm-lock.yaml prisma.config.ts ./

# Install dependencies (includes prisma as devDependency)
RUN pnpm install --frozen-lockfile || { echo "Failed to install dependencies"; exit 1; }

# Copy source code and prisma schema
COPY . .

# Set a placeholder DATABASE_URL so prisma generate doesn't fail
ENV DATABASE_URL=placeholder

# Generate Prisma client
RUN npx prisma generate || { echo "Failed to generate Prisma client"; exit 1; }

# Build the application
RUN pnpm run build || { echo "Failed to build application"; exit 1; }

# Verify dist/src/main.js exists
RUN test -f /app/dist/src/main.js || { echo "ERROR: dist/src/main.js not found after build"; ls -la /app/dist/; exit 1; }

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm || { echo "Failed to install pnpm in runtime"; exit 1; }

COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/proto ./proto
COPY --from=builder /app/generated ./generated

# CRITICAL: Copy prisma.config.ts for migrate deploy at runtime
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Verify files
RUN test -f /app/dist/src/main.js || { echo "ERROR: dist/src/main.js missing"; exit 1; }
RUN test -d /app/node_modules || { echo "ERROR: node_modules missing"; exit 1; }

ENV NODE_ENV=production

EXPOSE 5001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
