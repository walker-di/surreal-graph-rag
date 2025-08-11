import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async () => {
  const uptimeMs = Math.round(process.uptime() * 1000);
  const startedAt = new Date(Date.now() - uptimeMs).toISOString();

  return json({
    success: true,
    pid: process.pid,
    ppid: process.ppid,
    node: process.version,
    uptimeSec: Number(process.uptime().toFixed(3)),
    startedAt,
    memory: {
      rss: process.memoryUsage().rss,
      heapTotal: process.memoryUsage().heapTotal,
      heapUsed: process.memoryUsage().heapUsed,
      external: (process.memoryUsage() as any).external ?? 0,
      arrayBuffers: (process.memoryUsage() as any).arrayBuffers ?? 0,
    },
  });
};
