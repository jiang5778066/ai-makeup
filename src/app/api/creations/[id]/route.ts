import { creations } from "@/lib/platform-creations-server";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
export const GET = async (request: Request, { params }: Context) => creations.read(request, (await params).id);
export const DELETE = async (request: Request, { params }: Context) => creations.remove(request, (await params).id);
