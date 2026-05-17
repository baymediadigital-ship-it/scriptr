export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.REPLICATE_API_KEY ?? "NOT SET";
  const test = process.env.REPLICATE_TEST ?? "NOT SET";
  return Response.json({
    REPLICATE_API_KEY: key.slice(0, 12) + "...(len=" + key.length + ")",
    REPLICATE_TEST: test.slice(0, 12) + "...(len=" + test.length + ")",
  });
}
