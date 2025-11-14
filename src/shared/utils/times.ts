export const times = {
  requestsTimeout: 1000 * 60 * 2, // 120_000 ms

  sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  },
  nowDateTime() {
    return new Date();
  },
  nowTimeStamp() {
    return Date.now();
  },
  localISODate(date = new Date()) {
    const offsetMs = date.getTimezoneOffset() * 60_000;
    const local = new Date(date.getTime() - offsetMs);
    return local.toISOString().split('T')[0]; // "YYYY-MM-DD"
  },
  localISODateTime(date = new Date()) {
    const offsetMs = date.getTimezoneOffset() * 60_000;
    const local = new Date(date.getTime() - offsetMs);
    return local.toISOString().slice(0, 19); // "YYYY-MM-DDTHH:mm:ss"
  },
  todayDate() {
    return this.localISODate();
  },
};
