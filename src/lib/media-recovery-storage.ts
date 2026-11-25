export const mediaRecoveryKey = "media-generation-recovery";
export const mediaRecoveryMaxLength = 24576;

export type MediaRecoveryStorage = Pick<Storage, "getItem" | "setItem" | "removeItem"> & {
  accountRevision?: () => number;
};

// 浏览器拒绝存储访问时，只在当前文档内保留恢复记录或待删除状态。
let memoryRecovery: string | null = null;
let pendingWrite = false;
let accountRevision = 0;

export const browserMediaRecoveryStorage: MediaRecoveryStorage = {
  accountRevision: () => accountRevision,
  getItem(key) {
    if (pendingWrite) {
      if (memoryRecovery === null) this.removeItem(key);
      return memoryRecovery;
    }
    try {
      memoryRecovery = window.sessionStorage.getItem(key);
    } catch {
      // 保留上次可读的标签页记录。
    }
    return memoryRecovery;
  },
  setItem(key, value) {
    memoryRecovery = value;
    try {
      window.sessionStorage.setItem(key, value);
      pendingWrite = false;
    } catch {
      pendingWrite = true;
    }
  },
  removeItem(key) {
    memoryRecovery = null;
    try {
      window.sessionStorage.removeItem(key);
      pendingWrite = false;
    } catch {
      pendingWrite = true;
    }
  },
};

export function clearMediaRecovery(storage: MediaRecoveryStorage | undefined) {
  try {
    storage?.removeItem(mediaRecoveryKey);
  } catch {
    // 兼容不提供内存回退的存储。
  }
}

export function clearAccountMediaRecovery() {
  accountRevision++;
  clearMediaRecovery(browserMediaRecoveryStorage);
}

export function readMediaRecoveryRecord(storage: MediaRecoveryStorage | undefined) {
  const raw = storage?.getItem(mediaRecoveryKey);
  if (!raw) return null;
  if (raw.length > mediaRecoveryMaxLength) throw new Error("invalid_media_recovery");
  const record: unknown = JSON.parse(raw);
  if (typeof record !== "object" || record === null || Array.isArray(record)) {
    throw new Error("invalid_media_recovery");
  }
  return record as Record<string, unknown>;
}

export function verifyMediaRecoveryOwner(userId: string) {
  try {
    const record = readMediaRecoveryRecord(browserMediaRecoveryStorage);
    if (record && record.userId !== userId) clearAccountMediaRecovery();
  } catch {
    clearAccountMediaRecovery();
  }
}
