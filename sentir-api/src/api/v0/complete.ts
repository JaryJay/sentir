import { PromptRequest } from "sentir-common";

export async function complete(req: Request) {
  const body = await req.json();

  const parsed = PromptRequest.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.message }), {
      status: 400,
    });
  }
  // const completion = await getCompletion(parsed.data);
  // return new Response(JSON.stringify(completion));
  return new Response(
    JSON.stringify({
      message: "Hello, world!",
    }),
    { status: 200 }
  );
}
