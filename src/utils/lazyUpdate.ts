const lazyMap: Record<string, NodeJS.Timeout> = {};

export function removeLazy(key: string) {
  if (lazyMap[key]) {
    clearTimeout(lazyMap[key]);
    delete lazyMap[key];
  }
}

export function addLazy(key: string, callback: () => void, lazyTime = 300) {
  removeLazy(key);
  lazyMap[key] = setTimeout(() => {
    callback();
    removeLazy(key);
  }, lazyTime);
}
