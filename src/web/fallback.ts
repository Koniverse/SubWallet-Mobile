// @ts-ignore
if (!global.chrome) {
  // @ts-ignore
  global.chrome = {};
}

// @ts-ignore
if (!global.chrome.extension) {
  // @ts-ignore
  global.chrome.extension = {
    getURL: (input: string) => input,
  };
}

export function getLocalStorageKeys (): string[] {
  return getLocalStorageItem('__storage_keys__', []);
}

export function setLocalStorageKeys (key: string) {
  const currentKeys = getLocalStorageKeys();
  currentKeys.push(key);
  setLocalStorageItem('__storage_keys__', currentKeys);
}

function setLocalStorageItem (key: string, value: any) {
  if (key != '__storage_keys__') {
    setLocalStorageKeys(key);
  }
  localStorage.setItem(key, JSON.stringify(value));
}

function removeLocalStorageItem (key: string) {
  localStorage.removeItem(key);
}

function getLocalStorageItem (key: string, defaultVal: any = undefined) {
  const value: string | null = localStorage.getItem(key);
  if (value) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return defaultVal;
    }
  } else {
    return defaultVal;
  }
}

// @ts-ignore
global.chrome.runtime = {
  lastError: undefined,
};

// @ts-ignore
global.chrome.storage = {
  local: {
    get: (
      keys: string[] | undefined | null,
      callback: (val: object) => void,
    ) => {
      keys = getLocalStorageKeys();
      const rs: Record<string, any> = {};
      keys.forEach(k => {
        rs[k] = getLocalStorageItem(k);
      });

      callback(rs);
    },
    set: (input: object, callback?: () => void) => {
      Object.entries(input).forEach(([k,v]) => {
          setLocalStorageItem(k, v);
        });

      callback && callback();
    },
    remove: (key: string, value: any, callback?: () => void) => {
      removeLocalStorageItem(key);
      callback && callback();
    },
  },
};
