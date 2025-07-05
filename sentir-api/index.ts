import { initFileRouter } from "node-file-router";

// See https://node-file-router.js.org/ for docs
const useFileRouter = await initFileRouter({
  baseDir: "src/api",
  onInit({ routes }) {
    console.dir(routes, { depth: null });
  },
});

const server = Bun.serve({
  port: 3000,
  fetch: async (req) => {
    console.log(
      `[${new Date().toLocaleTimeString()}] Request: ${req.method} ${req.url}`
    );
    const res = await useFileRouter<Response>(req);
    if (res && !res.ok) {
      console.log(`${res.status} ${res.statusText}`);
      console.log(await res.json());
    }
    return res ?? new Response("No Response is provided", { status: 500 });
  },
});

console.log(`Listening on http://localhost:${server.port} ...`);
