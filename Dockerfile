# Build stage
FROM node:18-alpine AS builder

# Declare Clerk build arguments
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG CLERK_SECRET_KEY

# Debug: Print status without showing values
RUN echo "==================== DEBUGGING BUILD ARGS ===================" && \
    if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then \
        echo "❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is MISSING"; \
    else \
        echo "✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is SET"; \
    fi && \
    if [ -z "$CLERK_SECRET_KEY" ]; then \
        echo "❌ CLERK_SECRET_KEY is MISSING"; \
    else \
        echo "✅ CLERK_SECRET_KEY is SET"; \
    fi && \
    echo "========================================================"

WORKDIR /app
COPY package*.json ./
RUN npm install

# Debug: Print working directory contents
RUN echo "Contents of /app after npm install:"
RUN ls -la

COPY . .

# Debug: Print all files copied
RUN echo "Contents of /app after copying all files:"
RUN ls -la

# Pass Clerk keys during build time
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
ENV CLERK_SECRET_KEY=${CLERK_SECRET_KEY}

# Debug: Print env var status without showing values
RUN echo "==================== DEBUGGING ENV VARS ===================" && \
    if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then \
        echo "❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is MISSING"; \
    else \
        echo "✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is SET"; \
    fi && \
    if [ -z "$CLERK_SECRET_KEY" ]; then \
        echo "❌ CLERK_SECRET_KEY is MISSING"; \
    else \
        echo "✅ CLERK_SECRET_KEY is SET"; \
    fi && \
    echo "========================================================"

# Debug: Add more verbose npm logging
ENV NPM_CONFIG_LOGLEVEL=verbose

# Add debugging to build process
RUN echo "Starting build process..."
RUN npm run build || (echo "==================== BUILD FAILED ===================" && \
    echo "❌ Build failed - Check if Clerk keys are properly set in Dokploy build arguments" && \
    echo "=======================================================" && \
    exit 1)

# Production stage
FROM node:18-alpine
WORKDIR /app

# Debug: Print working directory contents before copy
RUN echo "Production stage - initial contents:"
RUN ls -la

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Debug: Print final contents
RUN echo "Production stage - final contents:"
RUN ls -la

EXPOSE 3000
CMD ["npm", "start"]