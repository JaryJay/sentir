export default function NotFound() {
  return new Response('404 Not Found', { status: 404 });
}