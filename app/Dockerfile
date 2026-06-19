# ---- Faza 1: instalacija ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json .
RUN npm install --omit=dev --no-audit

# ---- Faza 2: runtime ----
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
USER node
EXPOSE 3000
CMD ["npm", "start"]