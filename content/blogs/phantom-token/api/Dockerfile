FROM oven/bun
WORKDIR /app

COPY package.json bun.lock .
RUN bun install --production

COPY index.ts tsconfig.json .

ENV NODE_ENV=production
RUN bun build \
	--compile \
	--minify-whitespace \
	--minify-syntax \
	--target bun \
	--outfile server \
	./index.ts

EXPOSE 3000
CMD ["./server"]

