export type DanceMediaKind = 'photo' | 'video';
export type DanceMediaChoice = { source: 'file' | 'sample' | 'template'; url: string; name: string; id?: number; duration?: number; file?: File };
export type DanceMediaSnapshot = { value: DanceMediaChoice | null; pending: boolean; error: string | null };
export type DanceMediaDependencies = {
  create: (file: File) => string;
  revoke: (url: string) => void;
  probe: (kind: DanceMediaKind, file: File, url: string, signal: AbortSignal) => Promise<number | undefined>;
};
export class DanceMediaSlot {
  private state: DanceMediaSnapshot = { value: null, pending: false, error: null };
  private listeners = new Set<() => void>();
  private version = 0;
  private alive = true;
  private candidate: { url: string; abort: AbortController } | null = null;
  constructor(private kind: DanceMediaKind, private deps: DanceMediaDependencies) {}
  read = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private write(state: DanceMediaSnapshot) { this.state = state; this.listeners.forEach(listener => listener()); }
  private invalidate() {
    this.version += 1;
    if (this.candidate) { this.candidate.abort.abort(); this.deps.revoke(this.candidate.url); this.candidate = null; }
  }
  private releaseValue() { if (this.state.value?.source === 'file') this.deps.revoke(this.state.value.url); }
  activate() { this.alive = true; }
  choose(value: DanceMediaChoice) {
    if (!this.alive) return;
    this.invalidate(); this.releaseValue(); this.write({ value, pending: false, error: null });
  }
  clear = () => { this.invalidate(); this.releaseValue(); this.write({ value: null, pending: false, error: null }); };
  dispose() { this.alive = false; this.clear(); }
  async select(file?: File) {
    // 原生选择器取消没有文件，不触碰已选值或正在探测的候选。
    if (!file || !this.alive) return;
    this.invalidate();
    const allowed = this.kind === 'photo' ? ['image/jpeg', 'image/png'] : ['video/mp4', 'video/quicktime', 'video/webm'];
    const error = !allowed.includes(file.type) ? 'type' : !file.size ? 'decode' : this.kind === 'photo' && file.size > 5 * 1024 * 1024 ? 'size' : null;
    if (error) { this.write({ ...this.state, pending: false, error }); return; }
    const version = this.version, url = this.deps.create(file), abort = new AbortController();
    this.candidate = { url, abort }; this.write({ ...this.state, pending: true, error: null });
    try {
      const duration = await this.deps.probe(this.kind, file, url, abort.signal);
      if (!this.alive || version !== this.version) return;
      this.candidate = null; this.releaseValue();
      this.write({ value: { source: 'file', url, file, name: file.name, duration }, pending: false, error: null });
    } catch {
      if (!this.alive || version !== this.version) return;
      this.candidate = null; this.deps.revoke(url);
      this.write({ ...this.state, pending: false, error: 'decode' });
    }
  }
}
export async function probeDanceMedia(kind: DanceMediaKind, file: File, url: string, signal: AbortSignal): Promise<number | undefined> {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (signal.aborted) throw new Error('aborted');
  const png = bytes[0] === 137 && String.fromCharCode(...bytes.slice(1, 4)) === 'PNG';
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webm = bytes[0] === 26 && bytes[1] === 69 && bytes[2] === 223 && bytes[3] === 163;
  const atom = String.fromCharCode(...bytes.slice(4, 8));
  const mp4 = atom === 'ftyp';
  const quicktime = file.type === 'video/quicktime' && ['moov', 'mdat', 'wide', 'free', 'skip'].includes(atom);
  if (kind === 'photo' ? !(png || jpeg) : !(webm || mp4 || quicktime)) throw new Error('signature');
  return new Promise((resolve, reject) => {
    const node = kind === 'photo' ? new Image() : document.createElement('video');
    const timeout = window.setTimeout(() => done(false), 15000);
    const cleanup = () => {
      clearTimeout(timeout); signal.removeEventListener('abort', abort); node.onload = null; node.onerror = null;
      if (node instanceof HTMLVideoElement) { node.onloadedmetadata = null; node.pause(); node.removeAttribute('src'); node.load(); }
      else node.src = '';
    };
    const done = (ok: boolean, duration?: number) => { cleanup(); if (ok) resolve(duration); else reject(new Error('decode')); };
    const abort = () => done(false);
    signal.addEventListener('abort', abort, { once: true }); node.onerror = () => done(false);
    if (node instanceof HTMLVideoElement) {
      node.preload = 'metadata'; node.onloadedmetadata = () => done(Number.isFinite(node.duration) && node.duration > 0 && node.videoWidth > 0, node.duration);
    } else node.onload = () => done(node.naturalWidth > 0 && node.naturalHeight > 0);
    node.src = url;
  });
}
export const danceMediaDependencies: DanceMediaDependencies = {
  create: file => URL.createObjectURL(file), revoke: url => URL.revokeObjectURL(url), probe: probeDanceMedia,
};
