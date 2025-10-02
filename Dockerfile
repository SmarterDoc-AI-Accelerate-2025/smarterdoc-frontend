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

# Accept API URL as build argument
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the Next.js app (API URL gets baked in here)
RUN npm run build

# -----------------------
# Run stage
# -----------------------
FROM node:20-alpine

WORKDIR /app

# Copy built app from builder
COPY --from=builder /app ./

# Expose port
EXPOSE 3000

# Run Next.js in production
CMD ["npm", "start"]
