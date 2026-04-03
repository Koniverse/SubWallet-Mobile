type Cleanup = () => void;

type IdleGlobal = typeof globalThis & {
  requestIdleCallback?: (callback: () => void) => number;
  cancelIdleCallback?: (id: number) => void;
};

export function scheduleAfterIdle(callback: () => void, delay = 0): Cleanup {
  const idleGlobal = globalThis as IdleGlobal;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const runCallback = () => {
    if (delay > 0) {
      timeoutId = setTimeout(callback, delay);
      return;
    }

    callback();
  };

  if (typeof idleGlobal.requestIdleCallback === 'function') {
    const idleId = idleGlobal.requestIdleCallback(runCallback);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (typeof idleGlobal.cancelIdleCallback === 'function') {
        idleGlobal.cancelIdleCallback(idleId);
      }
    };
  }

  timeoutId = setTimeout(runCallback, 0);

  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}