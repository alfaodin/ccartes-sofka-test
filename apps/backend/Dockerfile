# ---------- build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# tsc only emits .ts -> .js; copy the JSON data file into dist so the
# runtime path.join(__dirname, "../data/products.json") resolves correctly.
RUN cp -r src/data dist/data

# ---------- runtime stage ----------
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3002
CMD ["node", "dist/main.js"]
