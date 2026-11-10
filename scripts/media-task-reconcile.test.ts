import {it,expect} from 'vitest';
import {parseMediaReconcileArgs} from './media-task-reconcile';
it('CLI默认只读且不接受operator自报身份',()=>{expect(parseMediaReconcileArgs(['--task','00000000-0000-4000-8000-000000000001']).dryRun).toBe(true);expect(()=>parseMediaReconcileArgs(['--operator','admin'])).toThrow();expect(()=>parseMediaReconcileArgs(['--write','--task','00000000-0000-4000-8000-000000000001'])).toThrow('media_operations_unconfigured')});
