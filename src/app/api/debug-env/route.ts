export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.REPLICATE_API_KEY ?? "NOT SET";
  const newKey = process.env.REPLICATE_KEY ?? "NOT SET";
  return Response.json({
    REPLICATE_API_KEY: key.slice(0, 12) + "...(len=" + key.length + ")",
    REPLICATE_KEY: newKey.slice(0, 12) + "...(len=" + newKey.length + ")",
    active: (process.env.REPLICATE_KEY ?? process.env.REPLICATE_API_KEY ?? "").slice(0, 12) + "...",
  });
}
