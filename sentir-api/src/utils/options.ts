type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS";

export function options(...methods: HTTPMethod[]): () => Response {
  return () => {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Methods": methods.join(", "),
      },
      status: 204,
    });
  };
}
