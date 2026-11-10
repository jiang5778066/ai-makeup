import {pathToFileURL} from 'node:url';
import {MediaFault,mediaUuid} from '../src/lib/media-contracts';
import {createMediaStore} from '../src/lib/media-persistence';
import {createMediaOperations} from '../src/lib/media-operations';
export function parseMediaReconcileArgs(args:string[]){
 if(args.includes('--write'))throw new MediaFault('media_operations_unconfigured',503);
 if(args.length!==2||args[0]!=='--task'||!mediaUuid.test(args[1]))throw new MediaFault('usage: --task UUID (仅dry-run)');
 return {taskId:args[1],dryRun:true as const};
}
export async function mediaReconcileMain(args:string[]){const options=parseMediaReconcileArgs(args);return createMediaOperations(createMediaStore()).dryRun(options.taskId)}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){mediaReconcileMain(process.argv.slice(2)).then(result=>{process.stdout.write(JSON.stringify(result)+'\n');process.exit(0)},error=>{process.stderr.write((error instanceof MediaFault?error.code:'media_operations_unavailable')+'\n');process.exit(1)})}
