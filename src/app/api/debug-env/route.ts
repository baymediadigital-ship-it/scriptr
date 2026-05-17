export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.REPLICATE_API_KEY ?? "NOT SET";
  return Response.json({
    replicate_prefix: key.slice(0, 12) + "...",
    length: key.length
  });
}
