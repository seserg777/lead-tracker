FROM node:22-alpine
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/backend ./apps/backend
RUN npm ci
RUN npm run build --workspace=backend
WORKDIR /repo/apps/backend
ENV NODE_ENV=production
ENV PORT=3101
EXPOSE 3101
CMD ["sh", "-c", "npm run migration:up:prod && node dist/main.js"]
