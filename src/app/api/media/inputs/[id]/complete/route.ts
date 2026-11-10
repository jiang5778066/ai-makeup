import {mediaHandlers} from '@/lib/media-tasks';
export const dynamic='force-dynamic';
export async function POST(request:Request,context:{params:Promise<{id:string}>}){return mediaHandlers.inputComplete(request,(await context.params).id)}
