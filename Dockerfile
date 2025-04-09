# Build stage
FROM node:18-alpine AS builder

# Declare Clerk build arguments
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG CLERK_SECRET_KEY

# Debug: Print build arguments (careful: don't log secret key in production)
RUN echo "Checking build arguments..."
RUN echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is ${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:+set}"
RUN echo "CLERK_SECRET_KEY is ${CLERK_SECRET_KEY:+set}"

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

# Debug: Print environment variables (careful with secrets)
RUN echo "Checking environment variables..."
RUN echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is ${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:+set}"
RUN echo "CLERK_SECRET_KEY is ${CLERK_SECRET_KEY:+set}"

# Debug: Add more verbose npm logging
ENV NPM_CONFIG_LOGLEVEL=verbose

# Add debugging to build process
RUN echo "Starting build process..."
RUN npm run build || (echo "Build failed. Environment state:" && printenv && exit 1)

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