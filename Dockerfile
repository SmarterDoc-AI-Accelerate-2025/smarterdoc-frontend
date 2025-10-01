# -----------------------
# Build stage
# -----------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first
COPY package*.json ./

RUN npm install

# Copy source code
COPY . .

# Make sure NODE_ENV is production
ENV NODE_ENV=production

# Build the Next.js app (env gets baked here)
RUN NEXT_PUBLIC_API_URL=https://smarterdoc-backend-1094971678787.us-central1.run.app npm run build

# -----------------------
# Run stage
# -----------------------
FROM node:20-alpine

WORKDIR /app

# Copy built app from builder
COPY --from=builder /app ./

# Environment variable for runtime (though it's already baked in during build)
ENV NEXT_PUBLIC_API_URL=https://smarterdoc-backend-1094971678787.us-central1.run.app

EXPOSE 3000
CMD ["npm", "start"]