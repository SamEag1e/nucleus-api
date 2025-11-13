export const redisKeys = {
  lock(key: string) {
    return `LOCK:${key}`;
  },
};
