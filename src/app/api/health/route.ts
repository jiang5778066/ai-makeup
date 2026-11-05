export const dynamic = "force-dynamic";
export const GET = async () => {
  const sha = process.env.RELEASE_SHA;
  const project = process.env.RELEASE_PROJECT_ID;
  const deployment = process.env.VERCEL_URL;
  if (!sha || !/^[a-f0-9]{40}$/.test(sha) || !project || !deployment) return Response.json({ status: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  return Response.json({ status: "ready", sha, project, deployment }, { headers: { "Cache-Control": "no-store" } });
};
