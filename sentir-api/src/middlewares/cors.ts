import type { NextFunction } from "node-file-router";

export async function useCors(_: Request, next: NextFunction<Response>) {
  const res = await next();
  if (!res || !res.ok) return;

  if (!res.headers.get("Access-Control-Allow-Origin")) {
    res.headers.set("Access-Control-Allow-Origin", "*");
  }
  if (!res.headers.get("Access-Control-Allow-Methods")) {
    res.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
  }
  if (!res.headers.get("Access-Control-Allow-Headers")) {
    res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  }

  return res;
}
