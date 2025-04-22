import { complete } from "./src/api/v0/complete";

const server = Bun.serve({
  port: 3000,
  routes: {
    "/api/v0/complete": complete,
  },
});

console.log(`Listening on http://localhost:${server.port} ...`);
