type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS";

export function options(...methods: HTTPMethod[]): (req: Request) => Response {
  return (req: Request) => {
    console.log("OPTIONS", req.method);
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Methods": methods.join(", "),
      },
      status: 204,
    });
  };
}
