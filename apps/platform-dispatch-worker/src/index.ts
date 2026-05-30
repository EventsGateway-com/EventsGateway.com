type DispatchedWorker = {
  fetch(request: Request): Promise<Response>;
};

type DispatchNamespaceBinding = {
  get(name: string): DispatchedWorker;
};

type Env = {
  DISPATCHER: DispatchNamespaceBinding;
  PLATFORM_USER_WORKER?: string;
};

export default {
  async fetch(request: Request, env: Env) {
    const workerName = env.PLATFORM_USER_WORKER?.trim() || "collector";

    try {
      const worker = env.DISPATCHER.get(workerName);
      return await worker.fetch(request);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Dispatch failed.";
      const status = message.startsWith("Worker not found") ? 404 : 500;

      return new Response(message, {
        status,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "no-store"
        }
      });
    }
  }
};
