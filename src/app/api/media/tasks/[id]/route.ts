import {mediaHandlers} from '@/lib/media-tasks';
export const dynamic='force-dynamic';
export async function GET(request:Request,context:{params:Promise<{id:string}>}){return mediaHandlers.read(request,(await context.params).id)}
