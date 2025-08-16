# dockerfile stolen from one of my other projects so ignore how stupid it is

FROM oven/bun:alpine

WORKDIR /apptemp
COPY . .

# Doesn't use the other monorepo packages so can be installed directly
RUN bun i --production --frozen-lockfile

RUN mkdir /app && bun build --outfile /app/out --compile index.ts

RUN rm -rf /apptemp
WORKDIR /app

EXPOSE 48292

# Run the application
CMD ["./out"]