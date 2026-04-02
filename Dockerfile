FROM denoland/deno:2.2.2

WORKDIR /app

# Cache dependencies first (better layer caching)
COPY deno.json deno.lock* ./
RUN deno install

# Copy source
COPY . .

# Pre-compile for faster startup
RUN deno check --unstable-kv main.ts

EXPOSE 3000

# KV data persists in /data via volume mount
ENV DENO_KV_PATH=/data/status.db

CMD ["deno", "task", "start"]
