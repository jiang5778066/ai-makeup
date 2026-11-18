import {createMediaStepHandler} from '@/lib/media-step';
import {runMediaDatabaseStep,mediaDatabaseStepEnabled} from '@/lib/media-step-runtime';
export const runtime='nodejs';
export const maxDuration=120;
export const POST=createMediaStepHandler({secret:()=>process.env.MEDIA_STEP_SECRET,enabled:mediaDatabaseStepEnabled,tick:runMediaDatabaseStep});
