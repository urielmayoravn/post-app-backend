FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .


FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache curl

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=deps /app ./
EXPOSE 3000

CMD ["sh", "-c", "npx drizzle-kit push && node src/src/app.js"]

# Revisar comandos mas avanzados de docker