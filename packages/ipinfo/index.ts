import { type CountryResponse, Reader } from "mmdb-lib";

// GeoIP data from https://github.com/sapics/ip-location-db/tree/main/geolite2-country-mmdb
const rawipdb = await fetch(
    "https://raw.githubusercontent.com/sapics/ip-location-db/refs/heads/main/geolite2-country-mmdb/geolite2-country.mmdb",
)
    .then((r) => r.arrayBuffer())
    .then((r) => Buffer.from(r));

const ipdb = new Reader<CountryResponse>(rawipdb);

const port = 48292; // change in Dockerfile and docker-compose.yml too

Bun.serve({
    port,
    fetch(request, server) {
        try {
            const { pathname, origin } = new URL(request.url);
            if (pathname === "/")
                return json(
                    400,
                    `{"error":"No IP address provided, please try again with an IP. (e.g. ${origin}/<ipv4/6 addr>). You can find your IP address by visiting https://icanhazip.com"}`,
                );
            const res = ipdb.get(
                pathname === "/me"
                    ? // why is this so complicated :(
                      (request.headers.get("CF-Connecting-IP") ??
                          request.headers.get("X-Real-IP") ??
                          request.headers.get("X-Forwarded-For") ??
                          pathname.slice(1))
                    : pathname.slice(1),
            );
            return res ? json(200, res) : json(404, '{"error":"IP not found"}');
        } catch (e) {
            console.error(e);
            return json(500, '{"error":"Internal server error"}');
        }
    },
});

console.log("Listening on http://127.0.0.1:" + port);

function json(status: number, text: string | object) {
    return new Response(typeof text === "string" ? text : JSON.stringify(text), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}
