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
    const res = await useFileRouter<Response>(req);
    return res ?? new Response("No Response is provided", { status: 500 });
  },
});

console.log(`Listening on http://localhost:${server.port} ...`);
