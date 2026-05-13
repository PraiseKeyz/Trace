# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code and prisma schema
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN pnpm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/proto ./proto
COPY --from=builder /app/generated ./generated

# Set environment to production
ENV NODE_ENV=production

EXPOSE 5001

CMD ["node", "dist/main.js"]
