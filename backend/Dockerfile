FROM oven/bun:1.3.13

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY . .

ENV NODE_ENV=production
ENV PORT=4000

USER bun
EXPOSE 4000

CMD ["bun", "run", "start"]
